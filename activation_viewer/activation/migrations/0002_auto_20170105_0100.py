# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('base', '0007_auto_20160915_0944'),
        ('activation', '0001_initial'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='activation',
            name='regions',
        ),
        migrations.AddField(
            model_name='activation',
            name='region',
            field=models.ForeignKey(verbose_name=b'Affected Country', blank=True, to='base.Region', null=True),
        ),
        migrations.AlterField(
            model_name='mapset',
            name='layers',
            field=models.ManyToManyField(to='layers.Layer'),
        ),
    ]
