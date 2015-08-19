import datetime

from django.db import models

from geonode.security.models import PermissionLevelMixin
from geonode.layers.models import Layer


class DisasterType(models.Model):
    """Disaster types"""
    slug = models.CharField(max_length=5)
    name = models.CharField(max_length=128)

    def __unicode__(self):
        return self.name


class Activation(models.Model, PermissionLevelMixin):
    """Activation model"""
    
    activation_id = models.CharField(max_length=7)
    bbox_x0 = models.DecimalField(max_digits=19, decimal_places=10, blank=True, null=True)
    bbox_x1 = models.DecimalField(max_digits=19, decimal_places=10, blank=True, null=True)
    bbox_y0 = models.DecimalField(max_digits=19, decimal_places=10, blank=True, null=True)
    bbox_y1 = models.DecimalField(max_digits=19, decimal_places=10, blank=True, null=True)
    glide_number = models.CharField(max_length=20, blank=True, null=True)
    disaster_type = models.ForeignKey(DisasterType)
    service_level = models.IntegerField(choices=((1,1), (5,5)))
    date = models.DateTimeField('date', default=datetime.datetime.now)

    def __unicode__(self):
        return '%s, %s' % (self.activation_id, self.disaster_type)

    class Meta:
        # custom permissions,
        # add, change and delete are standard in django-guardian
        permissions = (
            ('view_activation', 'Can view resource'),
            ('change_activation_permissions', 'Can change resource permissions'),
        )


class MapProduct(models.Model):
    """Map Products of the activations"""

    name = models.CharField(max_length=128)
    activation = models.ForeignKey(Activation)
    layers = models.ManyToManyField(Layer, blank=True, null=True)
    bbox_x0 = models.DecimalField(max_digits=19, decimal_places=10, blank=True, null=True)
    bbox_x1 = models.DecimalField(max_digits=19, decimal_places=10, blank=True, null=True)
    bbox_y0 = models.DecimalField(max_digits=19, decimal_places=10, blank=True, null=True)
    bbox_y1 = models.DecimalField(max_digits=19, decimal_places=10, blank=True, null=True)
    type = models.CharField(max_length=50, choices=[['reference', 'Reference'],['delineation',' Delineation'],['grading', 'Grading']])

    def __unicode__(self):
        return '%s, %s' % (self.activation.activation_id, self.type)

    class Meta:
        verbose_name_plural = 'Map Products'
