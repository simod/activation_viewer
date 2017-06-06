# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('activation', '0002_auto_20170606_0944'),
    ]

    operations = [
        migrations.AlterField(
            model_name='activationmaps',
            name='config',
            field=models.CharField(max_length=100000, null=True),
        ),
    ]
