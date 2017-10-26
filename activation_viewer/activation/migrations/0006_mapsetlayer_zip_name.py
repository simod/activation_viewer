# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('activation', '0005_auto_20171026_0237'),
    ]

    operations = [
        migrations.AddField(
            model_name='mapsetlayer',
            name='zip_name',
            field=models.CharField(max_length=256, null=True, blank=True),
        ),
    ]
