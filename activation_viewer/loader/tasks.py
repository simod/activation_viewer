from __future__ import absolute_import, unicode_literals
import re
import zipfile
import os
import pysftp
from itertools import islice
from django.conf import settings
from django.utils.text import slugify
from celery.task import task
from celery import chain, group
from celery.utils.log import get_task_logger
from mapproxy.seed import seeder
from geonode.base.models import Region
from geonode.layers.utils import upload
from geonode.layers.models import Layer
from geonode.people.models import Profile
from geonode.contrib.mp.models import Tileset
from geonode.geoserver.helpers import gs_catalog, create_gs_thumbnail
from djmp.helpers import generate_confs
from activation_viewer.activation.models import Activation, MapSet, DisasterType

from .styles import getSld

# list of folders to be excluded from download
EXCLUDE_FROM_DOWNLOAD = ['RASTER', '00AEM']

logger = get_task_logger(__name__)

def listNotHiddenFolders(path):
    return [ f for f in os.listdir(path) if not f.startswith('.') ]

def dictChunks(data, size=settings.CONCURRENT_LAYER_LOAD_PROCESSES):
    it = iter(data)
    for i in xrange(0, len(data), size):
        yield {k:data[k] for k in islice(it, size)}


@task(name='loader.get_activation', queue='loader')
def getActivation(activation_code, disaster_type, region, download_only=False, load_only= False):
    if not load_only:
        with pysftp.Connection(settings.COPERNICUS_FTP['url'], username=settings.COPERNICUS_FTP['user'],
            password=settings.COPERNICUS_FTP['password']) as sftp:

            def folderWalker(folder):
                elements = sftp.listdir(folder)

                # if we are in the versions folder only get the latest
                if 'v1' in elements:
                    folderWalker(os.path.join(folder, elements[-1]))
                    return

                for element in elements:
                    fullpath = os.path.join(folder, element)
                    logger.debug('Downloading %s' % fullpath)

                    # if is a file then fetch it locally, respecting the same folder structure
                    if sftp.isfile(fullpath) and not 'VECTOR.zip' in fullpath:
                        download_path = os.path.join(settings.ACTIVATIONS_DOWNLOAD_PATH, folder)
                        if not os.path.exists(download_path):
                            os.makedirs(download_path)
                        sftp.get(fullpath, os.path.join(settings.ACTIVATIONS_DOWNLOAD_PATH, fullpath))
                    elif sftp.isdir(fullpath) and element not in EXCLUDE_FROM_DOWNLOAD:
                        folderWalker(fullpath)

            walkdir = os.path.join(settings.SFTP_DATA_FOLDER, activation_code)
            logger.debug('Downloading the %s folder' % walkdir)
            folderWalker(walkdir)

    if not download_only:
        loadActivation.delay(activation_code, disaster_type, region)


@task(name='loader.load_activation', queue='loader')
def loadActivation(activation_code, disaster_type, region):
    activation_path = os.path.join(settings.ACTIVATIONS_DOWNLOAD_PATH, settings.SFTP_DATA_FOLDER, activation_code)

    activation, __ = Activation.objects.get_or_create(
        activation_id = activation_code,
        disaster_type = DisasterType.objects.get_or_create(name=disaster_type, slug=slugify(disaster_type))[0],
        region = Region.objects.get(name__iexact=region)
        )

    # loop over AOIs and create a MapSet for each of them
    for aoi in listNotHiddenFolders(activation_path):
        mp_name = re.split('(\d+)', aoi)[-1]
        mapset, __ = MapSet.objects.get_or_create(
            name=mp_name,
            slug=slugify(mp_name),
            activation=activation
            )

        # Loop over the analisys types and load data for each of them
        for analysis_type in listNotHiddenFolders(os.path.join(activation_path, aoi)):
            analisys_name = re.split('(\d+)', analysis_type)[-1]

            for dirpath, dirname, files in os.walk(os.path.join(activation_path, aoi, analysis_type)):
                if 'VECTOR' in dirpath:
                    files_dict = {}
                    for filename in [f for f in files if not f.startswith('.')]:
                        layer_name = filename.split('.')[0]
                        if files_dict.has_key(layer_name):
                            files_dict[layer_name].append(filename)
                        else:
                            files_dict[layer_name] = [filename]

                    # make sure the zip files folder exists
                    if not os.path.exists(settings.ZIPFILE_LOCATION):
                        os.makedirs(settings.ZIPFILE_LOCATION)

                    # manually chunk the dict and send parallel chains per chunk
                    for layers_dict in dictChunks(files_dict):
                        group(
                            getChain(layer_name, filenames, dirpath, mapset) for layer_name, filenames in layers_dict.items()
                            ).apply_async()


def getChain(layer_name, filenames, dirpath, mapset):
    return chain(
        zipShp.s(layer_name, filenames, dirpath, mapset),
        saveToGeonode.s(),
        seedLayer.s(),
        deleteFromGeoserver.s()
        )


@task(name='loader.zip_shp', queue='loader')
def zipShp(layer_name, files, dirpath, mapset):
    print '__ZIP %s ' % layer_name
    zipfile_name = os.path.join(settings.ZIPFILE_LOCATION, layer_name + '.zip')
    the_zip = zipfile.ZipFile(zipfile_name, 'w')
    for item in files:
        the_zip.write(os.path.join(dirpath, item), item)
    the_zip.close()
    return {'zip_name': zipfile_name,
            'mapset': mapset}


@task(name='loader.save_to_geonode', queue='loader')
def saveToGeonode(payload):
    admin = Profile.objects.filter(is_superuser=True).first()
    logger.debug('Uploading layer %s to geonode' % payload['zip_name'])

    # use overwrite to make sure if a layer exists it gets updated
    uploaded_name = upload(payload['zip_name'], admin, overwrite=True)[0]['name']

    if any(s in payload['zip_name'] for s in ['_point', '_line', '_poly']):
        gs_layer = gs_catalog.get_layer(name=uploaded_name)
        geom_type = uploaded_name.split('_')[-1]
        gs_style = gs_catalog.get_style(name=settings.EMS_STYLES[geom_type])
        if not gs_style:
            #let's make sure the style is there
            gs_catalog.create_style('act_viewer_%s' % geom_type, getSld(geom_type))
            gs_style = gs_catalog.get_style(name=settings.EMS_STYLES[geom_type])
        gs_layer.default_style = gs_style
        gs_catalog.save(gs_layer)
        gs_catalog.reload()
    saved_layer = Layer.objects.get(name=uploaded_name)
    payload['mapset'].layers.add(saved_layer)

    #create_gs_thumbnail(saved_layer, overwrite=True)
    return uploaded_name


@task(name='loader.seed_layer', queue='loader')
def seedLayer(layername):
    try:
        tileset = Tileset.objects.get(layer_name=Layer.objects.get(name=layername).typename)
    except Tileset.DoesNotExist:
        logger.error('Cannot find tileset for layer %s' % layername)
        return
    logger.debug('starting seeding for layer %s' % layername)
    mp_conf, seed_conf = generate_confs(tileset)
    seeder.seed(tasks=seed_conf.seeds())
    print '__SEED %s' % layername
    return layername


@task(name='loader.delete_from_gs', queue='loader')
def deleteFromGeoserver(typename):
    print '__DELETE %s' % typename
    gs_catalog.delete(gs_catalog.get_layer(typename))
    gs_catalog.delete(gs_catalog.get_style(typename))
