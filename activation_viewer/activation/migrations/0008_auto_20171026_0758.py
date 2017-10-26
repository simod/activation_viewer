# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('activation', '0007_auto_20171026_0706'),
    ]

    operations = [
        migrations.RenameField(
            model_name='mapsetlayer',
            old_name='display_name',
            new_name='title',
        ),
    ]
