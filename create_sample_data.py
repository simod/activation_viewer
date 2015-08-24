#!/usr/bin/env python

import os
import sys


if __name__ == "__main__":
    from django.core.management import execute_from_command_line

    os.environ.setdefault("DJANGO_SETTINGS_MODULE", "activation_viewer.settings")
    from activation_viewer.activation.populate_test_data import create_activation_data
    create_activation_data()
