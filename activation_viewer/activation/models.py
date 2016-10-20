import datetime

from django.db import models
from django.db.models import signals
from django.contrib.auth.models import Group, Permission
from django.contrib.auth import get_user_model
from django.contrib.contenttypes.models import ContentType
from taggit.managers import TaggableManager
from guardian.shortcuts import assign_perm, get_groups_with_perms, get_users_with_perms

from geonode.layers.models import Layer
from geonode.base.models import Region


class DisasterType(models.Model):
    """Disaster types"""
    name = models.CharField(max_length=128)
    slug = models.SlugField()

    def __unicode__(self):
        return self.name


class MapSet(models.Model):
    "MapSet"
    name = models.CharField(max_length=128)
    activation = models.ForeignKey('Activation')
    slug = models.SlugField()

    def __unicode__(self):
        return self.name


class Activation(models.Model):
    """Activation model"""
    
    activation_id = models.CharField(max_length=7, unique=True)
    bbox_x0 = models.DecimalField(max_digits=19, decimal_places=10, blank=True, null=True)
    bbox_x1 = models.DecimalField(max_digits=19, decimal_places=10, blank=True, null=True)
    bbox_y0 = models.DecimalField(max_digits=19, decimal_places=10, blank=True, null=True)
    bbox_y1 = models.DecimalField(max_digits=19, decimal_places=10, blank=True, null=True)
    glide_number = models.CharField(max_length=20, blank=True, null=True)
    disaster_type = models.ForeignKey(DisasterType)
    event_time = models.DateTimeField('Event Time', blank=True, null=True)
    event_time_utc = models.DateTimeField('Event Time UTC', blank=True, null=True)
    activation_time = models.DateTimeField('Activation Time', blank=True, null=True)
    regions = models.ManyToManyField(Region, verbose_name='Affected Countries', blank=True, null=True)
    keywords = TaggableManager('keywords', blank=True)
    thumbnail_url = models.CharField(max_length=256, blank=True, null=True)

    def __unicode__(self):
        return '%s, %s' % (self.activation_id, self.disaster_type)

    class Meta:
        # custom permissions,
        # add, change and delete are standard in django-guardian
        permissions = (
            ('view_activation', 'Can view activation'),
            ('change_activation_permissions', 'Can change activation permissions'),
        )

    def set_permissions(self, perm_spec):
        """
        Sets an object's the permission levels based on the perm_spec JSON.


        the mapping looks like:
        {
            'users': {
                'AnonymousUser': ['view'],
                <username>: ['perm1','perm2','perm3'],
                <username2>: ['perm1','perm2','perm3']
                ...
            }
            'groups': [
                <groupname>: ['perm1','perm2','perm3'],
                <groupname2>: ['perm1','perm2','perm3'],
                ...
                ]
        }
        """

        from guardian.models import UserObjectPermission, GroupObjectPermission
        UserObjectPermission.objects.filter(content_type=ContentType.objects.get_for_model(self),
                                        object_pk=self.id).delete()
        GroupObjectPermission.objects.filter(content_type=ContentType.objects.get_for_model(self),
                                         object_pk=self.id).delete()

        if 'users' in perm_spec and "AnonymousUser" in perm_spec['users']:
            anonymous_group = Group.objects.get(name='anonymous')
            for perm in perm_spec['users']['AnonymousUser']:
                assign_perm(perm, anonymous_group, self)

        # TODO refactor code here
        if 'users' in perm_spec:
            for user, perms in perm_spec['users'].items():
                user = get_user_model().objects.get(username=user)
                for perm in perms:
                    assign_perm(perm, user, self)

        if 'groups' in perm_spec:
            for group, perms in perm_spec['groups'].items():
                group = Group.objects.get(name=group)
                for perm in perms:
                    assign_perm(perm, group, self)

    def get_all_level_info(self):

        info = {
            'users': get_users_with_perms(
                self),
            'groups': get_groups_with_perms(
                self,
                attach_perms=True)}

        return info

    def set_bbox_from_mapproducts(self):
        x0 = x1 = y0 = y1 = None
        for mapset in self.mapset_set.all():
            mapproducts = mapset.mapproduct_set.all()
            for i in range(mapproducts.count()):
                mpp = mapproducts[i]
                if not x0:
                    x0, x1, y0, y1 = mpp.bbox_x0, mpp.bbox_x1, mpp.bbox_y0, mpp.bbox_y1
                else:
                    if mpp.bbox_x0 < x0: x0 = mpp.bbox_x0
                    if mpp.bbox_x1 > x1: x1 = mpp.bbox_x1
                    if mpp.bbox_y0 < y0: y0 = mpp.bbox_y0
                    if mpp.bbox_y1 > y1: y1 = mpp.bbox_y1
        Activation.objects.filter(id=self.id).update(bbox_x0=x0, bbox_x1=x1, bbox_y0=y0, bbox_y1=y1)



class MapProduct(models.Model):
    """Map Products of the activations"""

    map_set = models.ForeignKey(MapSet)
    service_level = models.IntegerField(choices=((1,1), (5,5)))
    type = models.CharField(max_length=50, choices=[['reference', 'Reference'],['delineation',' Delineation'],['grading', 'Grading']])
    layers = models.ManyToManyField(Layer, blank=True, null=True)
    bbox_x0 = models.DecimalField(max_digits=19, decimal_places=10, blank=True, null=True)
    bbox_x1 = models.DecimalField(max_digits=19, decimal_places=10, blank=True, null=True)
    bbox_y0 = models.DecimalField(max_digits=19, decimal_places=10, blank=True, null=True)
    bbox_y1 = models.DecimalField(max_digits=19, decimal_places=10, blank=True, null=True)

    def __unicode__(self):
        return '%s_%s' % (self.map_set.activation.activation_id, self.type)

    def set_bbox_from_layers(self):
        x0 = x1 = y0 = y1 = 0
        layers = self.layers.all()
        for i in range(layers.count()):
            layer = layers[i]
            if i == 0:
                x0, x1, y0, y1 = layer.bbox_x0, layer.bbox_x1, layer.bbox_y0, layer.bbox_y1
            else:
                if layer.bbox_x0 < x0: x0 = layer.bbox_x0
                if layer.bbox_x1 > x1: x1 = layer.bbox_x1
                if layer.bbox_y0 < y0: y0 = layer.bbox_y0
                if layer.bbox_y1 > y1: y1 = layer.bbox_y1

        MapProduct.objects.filter(id=self.id).update(bbox_x0=x0, bbox_x1=x1, bbox_y0=y0, bbox_y1=y1)

    class Meta:
        verbose_name_plural = 'Map Products'
        permissions = (
            ('view_mapproduct', 'Can view map product'),
            ('change_mapproduct_permissions', 'Can change map product permissions'),
        )


class ExternalLayer(models.Model):
    """External layers related to an activation"""

    title = models.CharField(max_length=128)
    layer_name = models.CharField(max_length=128)
    url = models.URLField()
    activation = models.ForeignKey(Activation)

    def __unicode__(self):
        return self.title


def mapproduct_layers_changed(instance, *args, **kwargs):
    instance.set_bbox_from_layers()
    instance.map_set.activation.set_bbox_from_mapproducts()

signals.m2m_changed.connect(mapproduct_layers_changed, sender=MapProduct.layers.through)
