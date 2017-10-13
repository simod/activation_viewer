from optparse import make_option

from django.core.management import call_command
from django.core.management.base import BaseCommand, CommandError

from activation_viewer.loader.tasks import getActivation


class Command(BaseCommand):

    help = 'Load a CEMS activation'

    option_list = BaseCommand.option_list + (
        make_option(
            '-c',
            '--code',
            action='store_true',
            dest='activation_code',
            help='Actiovation\'s code'),
        make_option(
            '-r',
            '--region',
            action='store_true',
            dest='region',
            help='Activation\'s region'),
        make_option(
            '-t',
            '--type',
            action='store_true',
            dest='disaster_type',
            help='The disaster type'))

    def handle(self, *args, **options):
        code = options.get('activation_code')
        region = options.get('region')
        disaster_type = options.get('disaster_type')

        print 'Loading activation %s, %s in %s' % (code, disaster_type, region)
        getActivation.delay(code, disaster_type, region)
