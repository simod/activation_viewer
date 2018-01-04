from django.conf.urls import patterns, url

from django.views.generic import TemplateView


urlpatterns = patterns('activation_viewer.activation.views',
    url(r'^$', TemplateView.as_view(template_name='activation_list.html'), name='activation_browse'),
    url(r'^download/?$', 'downloadLayers', name='download_layers'),
    url(r'^(?P<activation_id>[^/]*)$', 'activation_detail', name="activation_detail"),
    url(r'^permissions/(?P<activation_id>\w+)$', 'activation_permissions', name='activation_permissions'),    
)
