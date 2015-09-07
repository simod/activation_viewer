from django.core.urlresolvers import reverse
from tastypie.test import ResourceTestCase

from geonode.base.populate_test_data import create_models
from geonode.people.models import Profile

from .populate_test_data import create_activation_data
from .models import Activation


activation_list_url = reverse(
                            'api_dispatch_list',
                            kwargs={
                                'api_name': 'api',
                                'resource_name': 'activations'})

class ActivationTest(ResourceTestCase):
    """Activation tests"""

    fixtures = ['initial_data.json', 'bobby']

    def setUp(self):

        super(ActivationTest, self).setUp()

        create_models(type='layer')
        create_activation_data()
        self.user = 'admin'
        self.passwd = 'admin'

    def test_activation_permissions(self):
        bobby = Profile.objects.get(username='bobby')
        activation = Activation.objects.get(id=1)
        self.assertFalse(bobby.has_perm('view_activation', activation))

    def test_activations_list_get_api_non_auth(self):
        response = self.api_client.get(activation_list_url)
        self.assertValidJSONResponse(response)
        self.assertEquals(len(self.deserialize(response)['objects']), 0)

    def test_activations_list_get_api_auth(self):
        self.api_client.client.login(username=self.user, password=self.passwd)        
        response = self.api_client.get(activation_list_url)
        self.assertValidJSONResponse(response)
        self.assertEquals(len(self.deserialize(response)['objects']), 2)

    def test_activations_detail_get_api(self):
        self.api_client.client.login(username=self.user, password=self.passwd)
        response = self.api_client.get(reverse('activation_detail', 
                kwargs={'activation_id': Activation.objects.all()[0].activation_id}))
        self.assertEquals(response.status_code, 200)

    def test_activation_permission_propagates_to_its_map_products(self):
        pass
