from django.conf.urls import patterns, url, include

from geonode.urls import urlpatterns, api

from activation_viewer.activation.api import ActivationResource, MapProductResource, \
    DisasterTypeResource, MapSetResource, ActTagResource, ActLayerResource
from .views import ActIndex

api.register(ActivationResource())
api.register(MapProductResource())
api.register(DisasterTypeResource())
api.register(MapSetResource())
api.register(ActTagResource())
api.register(ActLayerResource())

urlpatterns = patterns('',
    url(r'^/?$',
       ActIndex.as_view(template_name='index_new.html'),
       name='home'),
    url(r'^activations/', include('activation_viewer.activation.urls')),
    url(r'', include(api.urls)),
 ) + urlpatterns

handler403 = 'geonode.views.err403'