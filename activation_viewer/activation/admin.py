from django.contrib import admin

from .models import DisasterType, Activation, MapProduct


class ActivationLayerInline(admin.TabularInline):
    model = MapProduct


class ActivationAdmin(admin.ModelAdmin):
    inlines = [ActivationLayerInline, ]
    exclude = ['bbox_x0', 'bbox_x1', 'bbox_y1', 'bbox_y0']


class MapproductAdmin(admin.ModelAdmin):
     exclude = ['bbox_x0', 'bbox_x1', 'bbox_y1', 'bbox_y0']

admin.site.register(DisasterType)
admin.site.register(Activation, ActivationAdmin)
admin.site.register(MapProduct, MapproductAdmin)
