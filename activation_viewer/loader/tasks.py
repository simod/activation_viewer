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
from geonode.base.models import Region
from geonode.layers.utils import upload
from geonode.layers.models import Layer
from geonode.people.models import Profile
from geonode.contrib.mp.models import Tileset
from geonode.geoserver.helpers import gs_catalog, create_gs_thumbnail
from djmp.helpers import generate_confs
from activation_viewer.activation.models import Activation, MapSet, DisasterType, MapSetLayer
from activation_viewer.loader import seeder

from .styles import getSld


logger = get_task_logger(__name__)

def listNotHiddenFolders(path):
    return [ f for f in os.listdir(path) if not f.startswith('.') ]

@task(name='loader.get_activation', queue='loader', max_retries=3)
def getActivation(activation_code, disaster_type, region, download_only=False, load_only= False):
    if not load_only:
        with pysftp.Connection(settings.AW_COPERNICUS_FTP['url'], username=settings.AW_COPERNICUS_FTP['user'],
            password=settings.AW_COPERNICUS_FTP['password']) as sftp:

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
                    if sftp.isfile(fullpath) and not any(name in fullpath for name in settings.AW_FILES_EXCLUDE_FROM_DOWNLOAD):
                        download_path = os.path.join(settings.AW_ACTIVATIONS_DOWNLOAD_PATH, folder)
                        if not os.path.exists(download_path):
                            os.makedirs(download_path)
                        sftp.get(fullpath, os.path.join(settings.AW_ACTIVATIONS_DOWNLOAD_PATH, fullpath))
                    elif sftp.isdir(fullpath) and element not in settings.AW_FOLDERS_EXCLUDE_FROM_DOWNLOAD:
                        folderWalker(fullpath)

            walkdir = os.path.join(settings.AW_SFTP_DATA_FOLDER, activation_code)
            logger.debug('Downloading the %s folder' % walkdir)
            folderWalker(walkdir)

    if not download_only:
        loadActivation.delay(activation_code, disaster_type, region)


@task(name='loader.load_activation', queue='loader', max_retries=3)
def loadActivation(activation_code, disaster_type, region):
    activation_path = os.path.join(settings.AW_ACTIVATIONS_DOWNLOAD_PATH, settings.AW_SFTP_DATA_FOLDER, activation_code)

    activation, __ = Activation.objects.get_or_create(
        activation_id = activation_code,
        disaster_type = DisasterType.objects.get_or_create(name=disaster_type, slug=slugify(disaster_type))[0],
        region = Region.objects.get(name__iexact=region),
        public = False
        )

    # make sure the zip files folder exists
    if not os.path.exists(settings.AW_ZIPFILE_LOCATION):
        os.makedirs(settings.AW_ZIPFILE_LOCATION)

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

                    for layers_dict in files_dict.items():
                        getChain(layers_dict[0], layers_dict[1], dirpath, mapset).apply_async()


def getChain(layer_name, filenames, dirpath, mapset, max_retries=3):
    return chain(
        zipShp.s(layer_name, filenames, dirpath, mapset),
        saveToGeonode.s(),
        seedLayer.s()
        )


@task(name='loader.zip_shp', queue='loader', max_retries=3)
def zipShp(layer_name, files, dirpath, mapset):
    zipfile_path = os.path.join(settings.AW_ZIPFILE_LOCATION, layer_name.lower() + '.zip')
    the_zip = zipfile.ZipFile(zipfile_path, 'w')
    for item in files:
        the_zip.write(os.path.join(dirpath, item), item)
    the_zip.close()
    return {'zipfile_path': zipfile_path,
            'zip_name': layer_name,
            'mapset': mapset}

def createMapSetLayer(layer, zip_name):
    """Creates a MapSetLayer down from a GeoNode saved layer and the name of the zipfile"""
    layer_def = zip_name.split('_')
    code, aoi, map_type, v = [layer_def.pop(0) for i in range(4)]
    geom_type = layer_def.pop(-1)
    title = '%s %s' % (' '.join([i.capitalize() for i in layer_def]), map_type)
    msLayer, created = MapSetLayer.objects.get_or_create(
        layer = layer,
        map_type = map_type,
        version = v,
        title = title,
        zip_name = zip_name
    )
    return msLayer

@task(name='loader.save_to_geonode', queue='loader', max_retries=3)
def saveToGeonode(payload):
    admin = Profile.objects.filter(is_superuser=True).first()
    logger.debug('Uploading layer %s to geonode' % payload['zip_name'])

    # use overwrite to make sure if a layer exists it gets updated
    uploaded = upload(payload['zipfile_path'], admin, overwrite=True)[0]
    if uploaded['status'] == 'failed':
        raise Exception("Failed layer %s with error %s " % (payload['zip_name'], uploaded['error']))
    else:
        uploaded_name = uploaded['name']

    if any(s in payload['zip_name'] for s in ['_a', '_p', '_l']):
        gs_layer = gs_catalog.get_layer(name=uploaded_name)
        geom_type = payload['zip_name'].split('_')[-1]
        style_name = 'act_viewer_%s' % geom_type
        gs_style = gs_catalog.get_style(name=style_name)

        if not gs_style:
            #let's make sure the style is there
            gs_catalog.create_style(style_name, getSld(geom_type))
            gs_style = gs_catalog.get_style(name=style_name)

        gs_layer.default_style = gs_style
        gs_catalog.save(gs_layer)
        # gs_catalog.reload()

    saved_layer = Layer.objects.get(name=uploaded_name)
    mapSetLayer = createMapSetLayer(saved_layer, payload['zip_name'])
    payload['mapset'].layers.add(mapSetLayer)

    #create_gs_thumbnail(saved_layer, overwrite=True)
    return uploaded_name


@task(name='loader.seed_layer', queue='loader', max_retries=3)
def seedLayer(layername):
    layer = Layer.objects.get(name=layername)

    try:
        tileset = Tileset.objects.get(layer_name=layer.typename)
    except Tileset.DoesNotExist:
        logger.error('Cannot find tileset for layer %s' % layername)
        return

    logger.debug('starting seeding for layer %s' % layername)
    mp_conf, seed_conf = generate_confs(tileset)

    seeder.seed(seed_conf.seeds(['tileset_seed']))

    return {'layer': layer, 'tileset_id': '%s' % tileset.id}
