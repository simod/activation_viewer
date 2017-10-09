# -*- coding: utf-8 -*-
#########################################################################
#
# Copyright (C) 2012 OpenPlans
#
# This program is free software: you can redistribute it and/or modify
# it under the terms of the GNU General Public License as published by
# the Free Software Foundation, either version 3 of the License, or
# (at your option) any later version.
#
# This program is distributed in the hope that it will be useful,
# but WITHOUT ANY WARRANTY; without even the implied warranty of
# MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
# GNU General Public License for more details.
#
# You should have received a copy of the GNU General Public License
# along with this program. If not, see <http://www.gnu.org/licenses/>.
#
#########################################################################

# Django settings for the GeoNode project.
import os
from geonode.settings import *
#
# General Django development settings
#

SITENAME = 'activation_viewer'

# Defines the directory that contains the settings file as the LOCAL_ROOT
# It is used for relative settings elsewhere.
LOCAL_ROOT = os.path.abspath(os.path.dirname(__file__))

WSGI_APPLICATION = "activation_viewer.wsgi.application"

DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.sqlite3',
        'NAME': os.path.join('development.db'),
    },
    # vector datastore for uploads
    # 'datastore' : {
    #    'ENGINE': 'django.contrib.gis.db.backends.postgis',
    #    'NAME': '',
    #    'USER' : '',
    #    'PASSWORD' : '',
    #    'HOST' : '',
    #    'PORT' : '',
    # }
}


# Additional directories which hold static files
STATICFILES_DIRS.append(
    os.path.join(LOCAL_ROOT, "static"),
)

# Note that Django automatically includes the "templates" dir in all the
# INSTALLED_APPS, se there is no need to add maps/templates or admin/templates

# Django automatically includes the "templates" dir in all the INSTALLED_APPS.
TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [os.path.join(PROJECT_ROOT, "templates"), os.path.join(LOCAL_ROOT, "templates")],
        'APP_DIRS': True,
        'OPTIONS': {
            'context_processors': [
                'django.contrib.auth.context_processors.auth',
                'django.core.context_processors.debug',
                'django.core.context_processors.i18n',
                'django.core.context_processors.tz',
                'django.core.context_processors.media',
                'django.core.context_processors.static',
                'django.core.context_processors.request',
                'django.contrib.messages.context_processors.messages',
                'account.context_processors.account',
                'geonode.context_processors.resource_urls',
                'geonode.geoserver.context_processors.geoserver_urls',
                'activation_viewer.context_processors.resource_urls',
            ],
            'debug': DEBUG,
        },
    },
]

# Location of url mappings
ROOT_URLCONF = 'activation_viewer.urls'

# Location of locale files
LOCALE_PATHS = (
    os.path.join(LOCAL_ROOT, 'locale'),
    ) + LOCALE_PATHS

INSTALLED_APPS = INSTALLED_APPS + (
    'activation_viewer.activation',
    'geonode.contrib.mp',
    'djmp',
    'activation_viewer.loader',
    )

# Location of url mappings
ROOT_URLCONF = 'activation_viewer.urls'

DEBUG = True
DEBUG_REACT = False

ALLOWED_HOSTS = ['localhost:8000',]

SITEURL = "http://localhost:8000/"

#USE_DISK_CACHE = True



CACHE_ZOOM_START = 15
CACHE_ZOOM_STOP = 18
TILESET_CACHE_DIRECTORY = 'cache/layers'
TILESET_CACHE_URL = 'cache'

CELERY_DISABLE_RATE_LIMITS = False
CELERY_ALWAYS_EAGER = False

# CELERY_QUEUES = [
#     Queue('loader', routing_key='loader')
# ]

COPERNICUS_FTP = {
    'url': 'ftp://xxx.xxx.xxx.xxx',
    'user': '',
    'password': ''
}

ACTIVATIONS_DOWNLOAD_PATH = ''

CONCURRENT_LAYER_LOAD_PROCESSES = 3

OGC_SERVER['default']['datastore'] = 'datastore'

from geonode.contrib.mp.settings import *

# Load more settings from a file called local_settings.py if it exists
try:
    from local_settings import *
except ImportError:
    pass
