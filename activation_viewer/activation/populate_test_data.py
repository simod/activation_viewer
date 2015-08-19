from geonode.layers.models import Layer

from .models import Activation, ActivationLayer

activation_data = [
    {
        'id': 'activ1',
        'bbox_x0': 0,
        'bbox_x1': 1,
        'bbox_y0': 0,
        'bbox_y1': 1,
        'date': "2015-07-17T04:23:12",
        'glide_number': "glide1",
    }, 
    {
        'id': 'activ2',
        'bbox_x0': 0,
        'bbox_x1': 1,
        'bbox_y0': 0,
        'bbox_y1': 1,
        'date': "2015-07-17T04:12:21",
        'glide_number': 'glide2'
    }
]

activationlayer_data = [
    {
        'layer_type': 'crisis',
        'activation': 1,
        'layer': 1
    },
    {
        'layer_type': 'aoi',
        'activation': 2,
        'layer': 2
    }
]

def create_activation_data():
    for activation in activation_data:
        Activation.objects.get_or_create(defaults=activation)

    for actlayer in activationlayer_data:
        layer = Layer.objects.get(id=actlayer['layer'])
        activation = Activation.objects.get(id=actlayer['activation'])
        ActivationLayer.objects.get_or_create(layer_type=actlayer['layer_type'], layer=layer, activation=activation)
