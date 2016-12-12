# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('base', '0007_auto_20160915_0944'),
        ('layers', '0004_auto_20161212_0248'),
    ]

    operations = [
        migrations.CreateModel(
            name='Activation',
            fields=[
                ('activation_id', models.CharField(max_length=7, unique=True, serialize=False, primary_key=True)),
                ('bbox_x0', models.DecimalField(null=True, max_digits=19, decimal_places=10, blank=True)),
                ('bbox_x1', models.DecimalField(null=True, max_digits=19, decimal_places=10, blank=True)),
                ('bbox_y0', models.DecimalField(null=True, max_digits=19, decimal_places=10, blank=True)),
                ('bbox_y1', models.DecimalField(null=True, max_digits=19, decimal_places=10, blank=True)),
                ('glide_number', models.CharField(max_length=20, null=True, blank=True)),
                ('event_time', models.DateTimeField(null=True, verbose_name=b'Event Time', blank=True)),
                ('activation_time', models.DateTimeField(null=True, verbose_name=b'Activation Time', blank=True)),
                ('thumbnail_url', models.CharField(max_length=256, null=True, blank=True)),
            ],
            options={
                'permissions': (('view_activation', 'Can view activation'), ('change_activation_permissions', 'Can change activation permissions')),
            },
        ),
        migrations.CreateModel(
            name='ActivationMaps',
            fields=[
                ('id', models.AutoField(verbose_name='ID', serialize=False, auto_created=True, primary_key=True)),
            ],
        ),
        migrations.CreateModel(
            name='DisasterType',
            fields=[
                ('id', models.AutoField(verbose_name='ID', serialize=False, auto_created=True, primary_key=True)),
                ('name', models.CharField(max_length=128)),
                ('slug', models.SlugField()),
            ],
        ),
        migrations.CreateModel(
            name='ExternalLayer',
            fields=[
                ('id', models.AutoField(verbose_name='ID', serialize=False, auto_created=True, primary_key=True)),
                ('title', models.CharField(max_length=128)),
                ('layer_name', models.CharField(max_length=128)),
                ('url', models.URLField()),
                ('activation', models.ForeignKey(to='activation.Activation')),
            ],
        ),
        migrations.CreateModel(
            name='MapSet',
            fields=[
                ('id', models.AutoField(verbose_name='ID', serialize=False, auto_created=True, primary_key=True)),
                ('name', models.CharField(max_length=128)),
                ('slug', models.SlugField()),
                ('bbox_x0', models.DecimalField(null=True, max_digits=19, decimal_places=10, blank=True)),
                ('bbox_x1', models.DecimalField(null=True, max_digits=19, decimal_places=10, blank=True)),
                ('bbox_y0', models.DecimalField(null=True, max_digits=19, decimal_places=10, blank=True)),
                ('bbox_y1', models.DecimalField(null=True, max_digits=19, decimal_places=10, blank=True)),
                ('activation', models.ForeignKey(to='activation.Activation')),
                ('layers', models.ManyToManyField(to='layers.Layer', null=True, blank=True)),
            ],
            options={
                'verbose_name_plural': 'Map Sets',
                'permissions': (('view_mappset', 'Can view map mapset'), ('change_mapset_permissions', 'Can change map set permissions')),
            },
        ),
        migrations.AddField(
            model_name='activation',
            name='disaster_type',
            field=models.ForeignKey(to='activation.DisasterType'),
        ),
        migrations.AddField(
            model_name='activation',
            name='regions',
            field=models.ManyToManyField(to='base.Region', null=True, verbose_name=b'Affected Countries', blank=True),
        ),
    ]
