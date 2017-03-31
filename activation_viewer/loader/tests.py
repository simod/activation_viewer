import os
from django.conf import settings
from django.test import TestCase
from .utils import getActivation

class LoaderTests(TestCase):

    def testDownloadActivation(self):
        activation_code = 'EMSR195'
        getActivation(activation_code, download_only=True)
        self.assertTrue(os.path.exists(os.path.join(settings.ACTIVATIONS_DOWNLOAD_PATH, 'GIO-EMS', activation_code)))

    def testFileDownload(self):
        path = getFile.apply_async(filename)
        self.assertTrue(os.path.exists(path))

    def testLayerLoad(self):
        pass

    def testLayerIsRemovedFromGS(self):
        pass

    def testCacheIsCreated(self):
        pass
