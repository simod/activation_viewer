# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('activation', '0002_auto_20170105_0100'),
    ]

    operations = [
        migrations.AddField(
            model_name='activationmaps',
            name='config',
            field=models.CharField(max_length=4000, null=True),
        ),
    ]
