import time
import json

from django.db.models import Q, Count

from tastypie.resources import ModelResource
from tastypie import fields
from tastypie.authorization import DjangoAuthorization
from tastypie.exceptions import Unauthorized
from tastypie.constants import ALL, ALL_WITH_RELATIONS
from tastypie.serializers import Serializer
from tastypie.throttle import BaseThrottle
from django.core.serializers.json import DjangoJSONEncoder
from guardian.shortcuts import get_objects_for_user
from taggit.models import Tag

from geonode.api.api import CountJSONSerializer, RegionResource, TagResource
from geonode.layers.models import Layer

from .models import Activation, DisasterType, MapSet, ActivationMaps


class DtypeSerializer(CountJSONSerializer):
    """Disaster type serializer"""
    def get_resources_counts(self, options):

        resources = get_objects_for_user(
            options['user'],
            'activation.view_activation'
        )

        counts = list(resources.values(options['count_type']).annotate(count=Count(options['count_type'])))

        return dict([(c[options['count_type']], c['count']) for c in counts])


class ActAuthorization(DjangoAuthorization):
    """Activation Authorization"""
    def read_list(self, object_list, bundle):
        # permitted_ids = get_objects_for_user(
        #     bundle.request.user,
        #     'activation.view_activation')
        if bundle.request.user.is_superuser:
            return True
        else:
            return object_list.filter(public=True)

    def read_detail(self, object_list, bundle):
        # return bundle.request.user.has_perm(
        #     'view_activation',
        #     bundle.obj)
        if bundle.request.user.is_superuser:
            return True
        else:
            return bundle.obj.public

    def create_list(self, object_list, bundle):
        # TODO implement if needed
        raise Unauthorized()

    def create_detail(self, object_list, bundle):
        return True

    def update_list(self, object_list, bundle):
        # TODO implement if needed
        raise Unauthorized()

    def update_detail(self, object_list, bundle):
        return True

    def delete_list(self, object_list, bundle):
        # TODO implement if needed
        raise Unauthorized()

    def delete_detail(self, object_list, bundle):
        raise Unauthorized()


class MpAuthorization(DjangoAuthorization):
    """Map set Authorization"""

    def read_list(self, object_list, bundle):
        # permitted_ids = get_objects_for_user(
        #     bundle.request.user,
        #     'activation.view_mapset')

        if bundle.request.user.is_superuser:
            return object_list
        else:
            return object_list.filter(activation__public=True)

    def read_detail(self, object_list, bundle):
        if bundle.request.user.is_superuser:
            return True
        else:
            return bundle.obj.activation.public

    def create_list(self, object_list, bundle):
        # TODO implement if needed
        raise Unauthorized()

    def create_detail(self, object_list, bundle):
        raise Unauthorized()

    def update_list(self, object_list, bundle):
        # TODO implement if needed
        raise Unauthorized()

    def update_detail(self, object_list, bundle):
        raise Unauthorized()

    def delete_list(self, object_list, bundle):
        # TODO implement if needed
        raise Unauthorized()

    def delete_detail(self, object_list, bundle):
        raise Unauthorized()


class ActLayerResource(ModelResource):
    """Light layer api for activations"""

    tms_url = fields.CharField()

    def dehydrate_tms_url(self, bundle):
        return bundle.obj.link_set.get(name='Tiles').url

    class Meta:
        queryset = Layer.objects.order_by('-storeType')
        resource_name = 'actlayers'
        excludes = ['abstract', 'abstract_en', 'charset',
                    'constraints_other', 'constraints_other_en', 'csw_anytext',
                    'csw_insert_date', 'csw_mdsource', 'csw_schema',
                    'csw_type', 'csw_typename', 'csw_wkt_geometry',
                    'data_quality_statement', 'data_quality_statement_en', 'date',
                    'date_type', 'distribution_description', 'distribution_description_en',
                    'edition', 'featured',
                    'is_published', 'language', 'maintenance_frequency',
                    'metadata_uploaded', 'metadata_xml', 'popular_count',
                    'purpose', 'purpose_en', 'rating',
                    'share_count', 'supplemental_information', 'supplemental_information_en',
                    'temporal_extent_end', 'temporal_extent_start', 'uuid',
                    ]


class DisasterTypeResource(ModelResource):
    """Disaster Types API"""

    def serialize(self, request, data, format, options={}):
        options['count_type'] = 'disaster_type'
        options['user'] = request.user

        return super(DisasterTypeResource, self).serialize(request, data, format, options)

    class Meta:
        queryset = DisasterType.objects.all()
        resource_name = 'disastertypes'
        serializer = DtypeSerializer()
        filtering = {
            'slug': ALL,
            'name': ALL
        }


class MapSetResource(ModelResource):
    """MapSet api"""

    layers = fields.ToManyField(ActLayerResource, 'layers', full=True)

    class Meta:
        queryset = MapSet.objects.all()
        resource_name = 'mapsets'
        authorization = MpAuthorization()


class ActivationFullResource(ModelResource):
    """Activation api"""
    map_sets = fields.ToManyField(MapSetResource, 'mapset_set', full=True)
    disaster_type = fields.ToOneField(DisasterTypeResource, 'disaster_type', full=True)
    region = fields.ToOneField(RegionResource, 'region', full=True, null=True)
    keywords = fields.ToManyField(TagResource, 'keywords', null=True)

    def build_filters(self, filters={}):
        orm_filters = super(ActivationFullResource, self).build_filters(filters)
        if 'extent' in filters:
            orm_filters.update({'extent': filters['extent']})

        return orm_filters

    def apply_filters(self, request, applicable_filters):
        extent = applicable_filters.pop('extent', None)
        semi_filtered = super(
            ActivationFullResource,
            self).apply_filters(
            request,
            applicable_filters)
        filtered = semi_filtered

        if extent:
            filtered = self.filter_bbox(filtered, extent)
        return filtered

    def filter_bbox(self, queryset, bbox):
        """
        modify the queryset q to limit to data that intersects with the
        provided bbox

        bbox - 4 tuple of floats representing 'southwest_lng,southwest_lat,
        northeast_lng,northeast_lat'
        returns the modified query
        """
        bbox = bbox.split(
            ',')  # TODO: Why is this different when done through haystack?
        bbox = map(str, bbox)  # 2.6 compat - float to decimal conversion

        intersects = ~(Q(bbox_x0__gt=bbox[2]) | Q(bbox_x1__lt=bbox[0]) |
                       Q(bbox_y0__gt=bbox[3]) | Q(bbox_y1__lt=bbox[1]))

        return queryset.filter(intersects)

    class Meta:
        queryset = Activation.objects.distinct().order_by('-activation_time')
        resource_name = 'activations-full'
        authorization = ActAuthorization()
        filtering = {
            'disaster_type': ALL_WITH_RELATIONS,
            'region': ALL_WITH_RELATIONS,
            'activation_id': ALL
        }

class ActivationResource(ModelResource):
    region = fields.ToOneField(RegionResource, 'region', full=True, null=True)
    disaster_type = fields.ToOneField(DisasterTypeResource, 'disaster_type', full=True)

    class Meta:
        queryset = Activation.objects.distinct().order_by('-activation_time')
        resource_name = 'activations'
        authorization = ActAuthorization()
        filtering = {
            'disaster_type': ALL_WITH_RELATIONS,
            'region': ALL_WITH_RELATIONS,
            'activation_id': ALL
        }

    def build_filters(self, filters={}):
        orm_filters = super(ActivationResource, self).build_filters(filters)
        if 'q' in filters:
            orm_filters.update({'q': filters['q']})

        return orm_filters

    def apply_filters(self, request, applicable_filters):
        q = applicable_filters.pop('q', None)
        semi_filtered = super(
            ActivationResource,
            self).apply_filters(
            request,
            applicable_filters)
        filtered = semi_filtered

        if q:
            filtered = filtered.filter(
                Q(activation_id__icontains=q) |
                Q(disaster_type__name__icontains=q) |
                Q(region__name__icontains=q))
        return filtered


class ActFilteredResource(ModelResource):
    """ Activation faceting resource"""

    count = fields.IntegerField()

    def build_filters(self, filters={}):
        self.type_filter = None

        orm_filters = super(ActFilteredResource, self).build_filters(filters)

        self.type_filter = Activation

        return orm_filters

    def serialize(self, request, data, format, options={}):
        options['type_filter'] = getattr(self, 'type_filter', None)
        options['user'] = request.user

        return super(ActFilteredResource, self).serialize(request, data, format, options)


class ActKWSerializer(Serializer):
    """Activation keyword serializer"""
    def get_resources_counts(self, options):

        resources = get_objects_for_user(
            options['user'],
            'activation.view_activation'
        )

        counts = list(resources.values(options['count_type']).annotate(count=Count(options['count_type'])))

        return dict([(c[options['count_type']], c['count']) for c in counts])

    def to_json(self, data, options=None):
        options = options or {}
        data = self.to_simple(data, options)
        counts = self.get_resources_counts(options)
        if 'objects' in data:
            for item in data['objects']:
                item['count'] = counts.get(item['id'], 0)
        # Add in the current time.
        data['requested_time'] = time.time()

        return json.dumps(data, cls=DjangoJSONEncoder, sort_keys=True)


class ActTagResource(ActFilteredResource):
    """Activation Tags api"""

    def serialize(self, request, data, format, options={}):
        options['count_type'] = 'keywords'

        return super(ActTagResource, self).serialize(request, data, format, options)

    class Meta:
        queryset = Tag.objects.all().order_by('name')
        resource_name = 'act-keywords'
        allowed_methods = ['get']
        filtering = {
            'slug': ALL,
        }
        serializer = ActKWSerializer()


class ActMapResource(ModelResource):

    class Meta:
        queryset = ActivationMaps.objects.all()
        resource_name = 'act-maps'
        allowed_methods = ['get', 'post', 'put']
        throttle = BaseThrottle(throttle_at=10, timeframe=1800)
        authorization = DjangoAuthorization()
        always_return_data = True
