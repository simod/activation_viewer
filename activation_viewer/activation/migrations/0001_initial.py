# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import migrations, models
import taggit.managers


class Migration(migrations.Migration):

    dependencies = [
        ('taggit', '0002_auto_20150616_2121'),
        ('layers', '0004_auto_20161013_0502'),
        ('base', '0006_auto_20161013_0502'),
    ]

    operations = [
        migrations.CreateModel(
            name='Activation',
            fields=[
                ('id', models.AutoField(verbose_name='ID', serialize=False, auto_created=True, primary_key=True)),
                ('activation_id', models.CharField(unique=True, max_length=7)),
                ('bbox_x0', models.DecimalField(null=True, max_digits=19, decimal_places=10, blank=True)),
                ('bbox_x1', models.DecimalField(null=True, max_digits=19, decimal_places=10, blank=True)),
                ('bbox_y0', models.DecimalField(null=True, max_digits=19, decimal_places=10, blank=True)),
                ('bbox_y1', models.DecimalField(null=True, max_digits=19, decimal_places=10, blank=True)),
                ('glide_number', models.CharField(max_length=20, null=True, blank=True)),
                ('event_time', models.DateTimeField(null=True, verbose_name=b'Event Time', blank=True)),
                ('event_time_utc', models.DateTimeField(null=True, verbose_name=b'Event Time UTC', blank=True)),
                ('activation_time', models.DateTimeField(null=True, verbose_name=b'Activation Time', blank=True)),
            ],
            options={
                'permissions': (('view_activation', 'Can view activation'), ('change_activation_permissions', 'Can change activation permissions')),
            },
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
            name='MapProduct',
            fields=[
                ('id', models.AutoField(verbose_name='ID', serialize=False, auto_created=True, primary_key=True)),
                ('service_level', models.IntegerField(choices=[(1, 1), (5, 5)])),
                ('type', models.CharField(max_length=50, choices=[[b'reference', b'Reference'], [b'delineation', b' Delineation'], [b'grading', b'Grading']])),
                ('bbox_x0', models.DecimalField(null=True, max_digits=19, decimal_places=10, blank=True)),
                ('bbox_x1', models.DecimalField(null=True, max_digits=19, decimal_places=10, blank=True)),
                ('bbox_y0', models.DecimalField(null=True, max_digits=19, decimal_places=10, blank=True)),
                ('bbox_y1', models.DecimalField(null=True, max_digits=19, decimal_places=10, blank=True)),
                ('layers', models.ManyToManyField(to='layers.Layer', null=True, blank=True)),
            ],
            options={
                'verbose_name_plural': 'Map Products',
                'permissions': (('view_mapproduct', 'Can view map product'), ('change_mapproduct_permissions', 'Can change map product permissions')),
            },
        ),
        migrations.CreateModel(
            name='MapSet',
            fields=[
                ('id', models.AutoField(verbose_name='ID', serialize=False, auto_created=True, primary_key=True)),
                ('name', models.CharField(max_length=128)),
                ('slug', models.SlugField()),
                ('activation', models.ForeignKey(to='activation.Activation')),
            ],
        ),
        migrations.AddField(
            model_name='mapproduct',
            name='map_set',
            field=models.ForeignKey(to='activation.MapSet'),
        ),
        migrations.AddField(
            model_name='activation',
            name='disaster_type',
            field=models.ForeignKey(to='activation.DisasterType'),
        ),
        migrations.AddField(
            model_name='activation',
            name='keywords',
            field=taggit.managers.TaggableManager(to='taggit.Tag', through='taggit.TaggedItem', blank=True, help_text='A comma-separated list of tags.', verbose_name=b'keywords'),
        ),
        migrations.AddField(
            model_name='activation',
            name='regions',
            field=models.ManyToManyField(to='base.Region', null=True, verbose_name=b'Affected Countries', blank=True),
        ),
    ]
