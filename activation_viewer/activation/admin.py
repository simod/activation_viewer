from django.contrib import admin

from .models import DisasterType, Activation, MapProduct, MapSet, ExternalLayer


class ActivationInline(admin.TabularInline):
    model = MapSet


class MapProductInline(admin.TabularInline):
    model = MapProduct
    exclude = ['bbox_x0', 'bbox_x1', 'bbox_y1', 'bbox_y0']
    filter_horizontal = ['layers']


class ActivationAdmin(admin.ModelAdmin):
    exclude = ['bbox_x0', 'bbox_x1', 'bbox_y1', 'bbox_y0']


class DisasterTypeAdmin(admin.ModelAdmin):
    prepopulated_fields = {"slug": ("name",)}


class MapSetAdmin(admin.ModelAdmin):
    inlines = [MapProductInline, ]
    prepopulated_fields = {"slug": ("name",)}

admin.site.register(DisasterType, DisasterTypeAdmin)
admin.site.register(Activation, ActivationAdmin)
admin.site.register(MapProduct)
admin.site.register(MapSet, MapSetAdmin)
admin.site.register(ExternalLayer)
