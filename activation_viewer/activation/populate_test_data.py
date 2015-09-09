from geonode.layers.models import Layer

from .models import Activation, MapProduct, DisasterType

def create_activation_data():

    activation_data = [
        {
            'activation_id': 'activ1',
            'bbox_x0': 20,
            'bbox_x1': 30,
            'bbox_y0': 20,
            'bbox_y1': 30,
            'date': "2015-07-17T04:23:12",
            'glide_number': "glide1",
            'service_level': 1, 
        }, 
        {
            'activation_id': 'activ2',
            'bbox_x0': 40,
            'bbox_x1': 40,
            'bbox_y0': 40,
            'bbox_y1': 40,
            'date': "2015-07-17T04:12:21",
            'glide_number': 'glide2',
            'service_level': 1, 
        }
    ]

    map_product_data = [
        {
            'name': 'mp1',
            'activation': 1,
            'layers': [1, 2],
            'type': 'reference',
            'bbox_x0': 25,
            'bbox_x1': 27,
            'bbox_y0': 25,
            'bbox_y1': 27,
        },
        {
            'name': 'mp2',
            'activation': 2,
            'layers': [3, 4],
            'type': 'grading',
            'bbox_x0': 24,
            'bbox_x1': 29,
            'bbox_y0': 24,
            'bbox_y1': 29,
        }
    ]

    flood = DisasterType.objects.create(name='Flood', slug='flood')
    eq = DisasterType.objects.create(name='Earthquake', slug='eq')

    for activation in activation_data:
        Activation.objects.create(disaster_type=flood, **activation)

    for mp_data in map_product_data:
        activation = Activation.objects.get(id=mp_data['activation'])
        mp_data.pop('activation')
        layers = mp_data.pop('layers')
        mp = MapProduct.objects.create(activation=activation, **mp_data)
        for l_id in layers:
            mp.layers.add(Layer.objects.get(id=l_id))
