# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('activation', '0003_auto_20170606_0949'),
    ]

    operations = [
        migrations.AlterField(
            model_name='activationmaps',
            name='config',
            field=models.CharField(max_length=6000, null=True),
        ),
    ]
