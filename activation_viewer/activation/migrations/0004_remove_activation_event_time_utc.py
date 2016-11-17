# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('activation', '0003_auto_20161109_0443'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='activation',
            name='event_time_utc',
        ),
    ]
