from django.core.management.base import BaseCommand
from optparse import make_option

from activation_viewer.activation.models import Activation, MapProduct, DisasterType

class Command(BaseCommand):
    help = ("Ingest a new Activation into the system."
            " Map Products are added as well.")

    