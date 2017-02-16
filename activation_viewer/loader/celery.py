from __future__ import absolute_import, unicode_literals

import os

from celery import Celery


app = Celery('tasks', broker='amqp://guest@localhost//')

@app.task
def getFile(filename):
    pass

if __name__ == '__main__':
    app.start()
