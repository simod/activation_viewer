from httplib import HTTPConnection, HTTPSConnection

from django.views.generic import TemplateView
from django.conf import settings
from django.http import HttpResponseNotAllowed, HttpResponse

from activation.models import Activation

class ActIndex(TemplateView):

  def get_context_data(self, **kwargs):
        context = super(ActIndex, self).get_context_data(**kwargs)
       
        context['activations_count'] = Activation.objects.count()
        return context


# def getFeatureInfoProxy(request):
#     if not settings.GEOSERVER_BASE_URL in request.GET.get(url):
#         return HttpResponseNotAllowed("Only requests to the local geoserver are allowed.")

#     return 