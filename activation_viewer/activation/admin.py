from django.contrib import admin

from .models import DisasterType, Activation, MapProduct


class ActivationLayerInline(admin.TabularInline):
    model = MapProduct


class ActivationAdmin(admin.ModelAdmin):
    inlines = [ActivationLayerInline, ]


admin.site.register(DisasterType)
admin.site.register(Activation, ActivationAdmin)
admin.site.register(MapProduct)
