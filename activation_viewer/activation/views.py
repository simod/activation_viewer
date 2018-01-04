import json
import operator
import StringIO

from zipfile import ZipFile

from django.core.exceptions import PermissionDenied
from django.template import RequestContext
from django.shortcuts import render_to_response
from django.http import HttpResponse
from django.db.models import Q
from django.conf import settings

from taggit.models import Tag
from guardian.shortcuts import get_perms

from geonode.security.views import _perms_info_json
from geonode.maps.models import Map

from .models import Activation, ExternalLayer, MapSetLayer, MapSet

_PERMISSION_MSG_VIEW = "You are not permitted to view this activation"

def _resolve_activation(request, activation_id, permission='activation.view_activation',
                   msg=_PERMISSION_MSG_VIEW):
    """
    Resolve the activation by the provided activation_id and check the optional permission.
    """
    activation = Activation.objects.get(activation_id=activation_id)
    if not request.user.has_perm(permission, activation):
        raise PermissionDenied(msg)

    return activation

def activation_detail(request, activation_id, template="activation_detail.html"):
    activation = _resolve_activation(request, activation_id)
    context_dict = {
        'activation': activation,
        'act_lat': activation.bbox_y0 + abs(activation.bbox_y1  - activation.bbox_y0 )/2,
        'act_lon': activation.bbox_x0 + abs(activation.bbox_x1  - activation.bbox_x0 )/2,
        'perms_list': get_perms(request.user, activation),
        'related_maps': Map.objects.filter(keywords__slug__in=Tag.objects.filter(name=activation.activation_id)),
        'external_layers': ExternalLayer.objects.filter(activation=activation)
    }
    return render_to_response(template, RequestContext(request, context_dict))

def activation_permissions(request, activation_id):
    activation = _resolve_activation(request, activation_id)

    if request.method == 'POST':
        permission_spec = json.loads(request.body)
        activation.set_permissions(permission_spec)

        return HttpResponse(
            json.dumps({'success': True}),
            status=200,
            content_type='text/plain'
        )

    elif request.method == 'GET':
        permission_spec = _perms_info_json(resource)
        return HttpResponse(
            json.dumps({'success': True, 'permissions': permission_spec}),
            status=200,
            content_type='text/plain'
        )
    else:
        return HttpResponse(
            'No methods other than get and post are allowed',
            status=401,
            content_type='text/plain')

def downloadLayers(request):
    if request.method == 'GET':
        query = request.GET.get('query', None)
        if query is not None:
            try:
                query = json.loads(query)
            except:
                return HttpResponse(
                    'No query object could be decoded',
                    status=400,
                    content_type='text/plain'
                )

            to_be_zipped = []
            activations = query.get('activations', [])
            if len(activations) == 0:
                return HttpResponse(
                    'Please select at least one activation',
                    status=400,
                    content_type='text/plain')

            for activation_id in activations:
                activation = Activation.objects.get(activation_id=activation_id)
                map_types = query.get('map_types', [])
                layer_names = query.get('layer_types', [])

                zip_names_filter = Q()
                if len(layer_names) > 0:
                    zip_names_filter = reduce(operator.or_, [Q(zip_name__icontains=s) for s in layer_names])

                to_be_zipped += MapSetLayer.objects.filter(
                    mapset=MapSet.objects.filter(activation=activation)).filter(
                        Q(map_type__in=map_types) | zip_names_filter
                    ).values_list('zip_name', flat=True)

            if len(to_be_zipped) == 0:
                return HttpResponse(
                    'No layers available with requested parameters',
                    status=400,
                    content_type='text/plain')

            s = StringIO.StringIO()
            with ZipFile(s, 'w') as the_zip:
                for zip_name in to_be_zipped:
                    the_zip.write('%s/%s.zip' % (settings.AW_ZIPFILE_LOCATION, zip_name),
                    '%s.zip' % zip_name)

            resp = HttpResponse(s.getvalue(), content_type = "application/x-zip-compressed")
            resp['Content-Disposition'] = 'attachment; filename=%s' % 'EMS_activations_layers.zip'
            return resp

        else:
            return HttpResponse(
                'Query parameter is missing',
                status=400,
                content_type='text/plain')
    else:
        return HttpResponse(
            'Only GET request is accepted',
            status=401,
            content_type='text/plain')
