from geonode.layers.models import Layer

from .models import Activation, MapProduct, DisasterType

activation_data = [
    {
        'activation_id': 'activ1',
        'bbox_x0': 0,
        'bbox_x1': 1,
        'bbox_y0': 0,
        'bbox_y1': 1,
        'date': "2015-07-17T04:23:12",
        'glide_number': "glide1",
        'disaster_type': 1,
        'service_level': 1, 
    }, 
    {
        'activation_id': 'activ2',
        'bbox_x0': 0,
        'bbox_x1': 1,
        'bbox_y0': 0,
        'bbox_y1': 1,
        'date': "2015-07-17T04:12:21",
        'glide_number': 'glide2',
        'disaster_type': 1,
        'service_level': 1, 
    }
]

map_product_data = [
    {
        'name': 'mp1',
        'activation': 1,
        'layers': [1, 2],
        'type': 'reference'
    },
    {
        'name': 'mp2',
        'activation': 2,
        'layers': [3, 4],
        'type': 'grading'
    }
]

def create_activation_data():

    dtype = DisasterType.objects.create(name='flood', slug='flood')

    for activation in activation_data:
        activation.pop('disaster_type')
        Activation.objects.create(disaster_type=dtype, **activation)

    for mp_data in map_product_data:
        activation = Activation.objects.get(id=mp_data['activation'])
        mp = MapProduct.objects.create(name=mp_data['name'], type=mp_data['type'], activation=activation)
        for l_id in mp_data['layers']:
            mp.layers.add(Layer.objects.get(id=l_id))
