# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('activation', '0001_initial'),
    ]

    operations = [
        migrations.AlterField(
            model_name='activationmaps',
            name='config',
            field=models.CharField(max_length=20000, null=True),
        ),
    ]
