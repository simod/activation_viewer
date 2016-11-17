# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('layers', '0004_auto_20161013_0502'),
        ('activation', '0002_activation_thumbnail_url'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='mapproduct',
            name='layers',
        ),
        migrations.RemoveField(
            model_name='mapproduct',
            name='map_set',
        ),
        migrations.AlterModelOptions(
            name='mapset',
            options={'verbose_name_plural': 'Map Sets', 'permissions': (('view_mappset', 'Can view map mapset'), ('change_mapset_permissions', 'Can change map set permissions'))},
        ),
        migrations.AddField(
            model_name='mapset',
            name='bbox_x0',
            field=models.DecimalField(null=True, max_digits=19, decimal_places=10, blank=True),
        ),
        migrations.AddField(
            model_name='mapset',
            name='bbox_x1',
            field=models.DecimalField(null=True, max_digits=19, decimal_places=10, blank=True),
        ),
        migrations.AddField(
            model_name='mapset',
            name='bbox_y0',
            field=models.DecimalField(null=True, max_digits=19, decimal_places=10, blank=True),
        ),
        migrations.AddField(
            model_name='mapset',
            name='bbox_y1',
            field=models.DecimalField(null=True, max_digits=19, decimal_places=10, blank=True),
        ),
        migrations.AddField(
            model_name='mapset',
            name='layers',
            field=models.ManyToManyField(to='layers.Layer', null=True, blank=True),
        ),
        migrations.DeleteModel(
            name='MapProduct',
        ),
    ]
