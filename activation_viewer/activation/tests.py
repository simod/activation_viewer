from django.test import TestCase

from geonode.base.populate_test_data import create_models

from .populate_test_data import create_activation_data 

class ActivationTest(TestCase):
    """Activation tests"""

    def setUp(self):
        create_models(type='layer')
        create_activation_data()

    def test_activation_permissions(self):
        pass

    def test_activations_get_api(self):
        pass

    def test_activation_post_api(self):
        pass

    def test_activation_permission_propagates_to_its_layers(self):
        pass
