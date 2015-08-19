from tastypie.resources import ModelResource
from tastypie import fields

from geonode.api.resourcebase_api import LayerResource

from .models import Activation, MapProduct


class MapProductResource(ModelResource):
    """ActivationLayer api"""
    layers = fields.ToManyField(LayerResource, 'layers', full=True)

    class Meta:
        queryset = MapProduct.objects.all()
        resource_name = 'mapproducts'
        excludes = ['id']


class ActivationResource(ModelResource):
    """Activation api"""
    map_products = fields.ToManyField(MapProductResource, 'mapproduct_set', full=True)

    class Meta:
        queryset = Activation.objects.distinct().order_by('-date')
        resource_name = 'activations'
        excludes = ['id']
