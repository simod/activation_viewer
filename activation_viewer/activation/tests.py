from django.core.urlresolvers import reverse
from tastypie.test import ResourceTestCase

from geonode.base.populate_test_data import create_models
from geonode.people.models import Profile

from .populate_test_data import create_activation_data
from .models import Activation

class ActivationTest(ResourceTestCase):
    """Activation tests"""

    fixtures = ['bobby']
    
    def setUp(self):
        create_models(type='layer')
        create_activation_data()

    def test_activation_permissions(self):
        bobby = Profile.objects.get(username='bobby')
        act = Activation.objects.get(id=1)
        self.assertFalse(bobby.has_perm('view_activation', activation))


    def test_activations_list_get_api(self):
        response = self.api_client.get(reverse('activation_browse'))
        self.assertValidJSONResponse(resp)
        self.assertEquals(len(self.deserialize(resp)['objects']), 2)

    def test_activations_detail_get_api(self):
        response = self.api_client.get(reverse('activation_details', kwargs={'activation_id': 1}))
        self.assertValidJSONResponse(resp)
        self.assertEquals(response.status_code, 200)

    def test_activation_permission_propagates_to_its_map_products(self):
        pass
