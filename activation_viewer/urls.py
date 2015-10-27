from django.conf.urls import patterns, url, include

from geonode.urls import urlpatterns, api

from activation_viewer.activation.api import ActivationResource, MapProductResource, \
    DisasterTypeResource, MapSetResource, ActTagResource
from .views import ActIndex

api.register(ActivationResource())
api.register(MapProductResource())
api.register(DisasterTypeResource())
api.register(MapSetResource())
api.register(ActTagResource())

urlpatterns = patterns('',
    url(r'^/?$',
       ActIndex.as_view(template_name='site_index.html'),
       name='home'),
    url(r'^activations/', include('activation_viewer.activation.urls')),
    url(r'', include(api.urls)),
 ) + urlpatterns

handler403 = 'geonode.views.err403'