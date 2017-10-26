# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('activation', '0006_mapsetlayer_zip_name'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='mapsetlayer',
            name='type',
        ),
        migrations.AddField(
            model_name='mapsetlayer',
            name='map_type',
            field=models.CharField(blank=True, max_length=30, null=True, choices=[[b'REF', b'Reference'], [b'DEL', b'Delineation'], [b'GRA', b'Grading']]),
        ),
    ]
