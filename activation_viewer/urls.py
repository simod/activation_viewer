from django.conf.urls import patterns, url
from django.views.generic import TemplateView

from geonode.urls import *

from activation_viewer.activation.api import ActivationResource, MapProductResource

api.register(ActivationResource())
api.register(MapProductResource())

urlpatterns = patterns('',
    url(r'^/?$',
       TemplateView.as_view(template_name='site_index.html'),
       name='home'),
    url(r'^activations/', include('activation_viewer.activation.urls')),
    url(r'', include(api.urls)),
 ) + urlpatterns
