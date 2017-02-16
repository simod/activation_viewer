from ftplib import FTP
from __future__ import absolute_import, unicode_literals
from .celery import app
from celery.utils.log import get_task_logger

logger = get_task_logger(__name__)

class FTPWalker(object):

    def __init__(self, address, user, password):
        self.ftp = FTP(address)
        self.ftp.login(user=user, password=password)

    def getFile(self, finename):
        localfile = open(filename, 'wb')
        ftp.retrbinary('RETR ' + filename, localfile.write, 1024)
        localfile.close()

    def walk(self):
        pass


class GeoNodeLoader(object):

    @app.task
    def save(self, filename):
        pass

    @app.task
    def seedLayer(typename):
        pass

    @app.task
    def deleteFromGeoserver(typename):
        pass
