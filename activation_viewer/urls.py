from django.conf.urls import patterns, url, include

from geonode.urls import urlpatterns, api
from django.views.generic import TemplateView

from activation_viewer.activation.api import ActivationResource, ActivationFullResource, \
    DisasterTypeResource, MapSetResource, ActTagResource, ActLayerResource

api.register(ActivationResource())
api.register(DisasterTypeResource())
api.register(MapSetResource())
api.register(ActTagResource())
api.register(ActLayerResource())
api.register(ActivationFullResource())

urlpatterns = patterns('',
    url(r'^/?$',
       TemplateView.as_view(template_name='index_new.html'),
       name='home'),
    url(r'^composer/?$',
       TemplateView.as_view(template_name='map_composer.html'),
       name='composer'),
    url(r'^activations/', include('activation_viewer.activation.urls')),
    url(r'', include(api.urls)),
 ) + urlpatterns

handler403 = 'geonode.views.err403'