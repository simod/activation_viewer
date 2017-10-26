# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('layers', '24_to_26'),
        ('activation', '0004_auto_20170607_0228'),
    ]

    operations = [
        migrations.CreateModel(
            name='MapSetLayer',
            fields=[
                ('id', models.AutoField(verbose_name='ID', serialize=False, auto_created=True, primary_key=True)),
                ('type', models.CharField(blank=True, max_length=30, null=True, choices=[[b'ref', b'Reference'], [b'del', b'Delineation'], [b'gra', b'Grading']])),
                ('display_name', models.CharField(max_length=256)),
                ('version', models.CharField(max_length=5, null=True, blank=True)),
                ('layer', models.OneToOneField(to='layers.Layer')),
            ],
        ),
        migrations.AlterField(
            model_name='mapset',
            name='layers',
            field=models.ManyToManyField(to='activation.MapSetLayer', null=True, blank=True),
        ),
    ]
