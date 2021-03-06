from django.conf.urls import patterns, url, include
from django.views.generic import TemplateView

from geonode.urls import urlpatterns, api

from activation_viewer.activation.api import ActivationResource, ActivationFullResource, \
    DisasterTypeResource, MapSetResource, ActTagResource, ActLayerResource, ActMapResource

api.register(ActivationResource())
api.register(DisasterTypeResource())
api.register(MapSetResource())
api.register(ActTagResource())
api.register(ActLayerResource())
api.register(ActivationFullResource())
api.register(ActMapResource())


urlpatterns = patterns('',
    url(r'^/?$',
       TemplateView.as_view(template_name='viewer_index.html'),
       name='home'),
    url(r'^composer/?',
       TemplateView.as_view(template_name='map_composer.html'),
       name='composer'),
   # url(r'^maps/?',
   #    TemplateView.as_view(template_name='maps.html'),
   #    name='maps'),
    url(r'^activations/', include('activation_viewer.activation.urls')),
    url(r'', include(api.urls)),
 ) + urlpatterns

handler403 = 'geonode.views.err403'
