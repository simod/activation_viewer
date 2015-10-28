'use strict';

(function(){
  angular.module('map_controller', ['openlayers-directive'])
    .controller('MapCtrl', function ($rootScope, $scope, $http, olData, ActData) {

      var featureInfoActive = false;
      angular.extend($scope, {
        center: {
            lat: ACTIVATION_CENTER[0],
            lon: ACTIVATION_CENTER[1],
            zoom: 4
        },
        controls: [
            { name: 'fullscreen', active: true }
        ]
      });
      var map = olData.getMap();

      $rootScope.zoom_full = function(){
        map.then(function(map){
          var act_bbox = ActData.activation_bbox;
          var extent = ol.proj.transformExtent([parseFloat(act_bbox[0]), parseFloat(act_bbox[1]), 
            parseFloat(act_bbox[2]), parseFloat(act_bbox[3])], 'EPSG:4326','EPSG:900913');
          map.getView().fit(extent, map.getSize());
        });
      };

      // Zoom to full extent control
      var zoomFull = function(opt_options){
        var options = opt_options || {};
        
        var button = document.createElement('button');
        button.innerHTML = 'Z';

        button.addEventListener('click', function(){ 
          $rootScope.zoom_full();
        }, true);

        var element = document.createElement('div');
        element.className = 'ol-control zoom-full';
        element.appendChild(button);
        element.title = "Zoom to activation extent"

        ol.control.Control.call(this, {
          element: element,
          target: options.target
        });
      };
      ol.inherits(zoomFull, ol.control.Control);

      // Feature info control
      var featureInfoControl = function(opt_options){
        var options = opt_options || {};
        
        var button = document.createElement('button');
        button.innerHTML = '?';

        button.addEventListener('click', function(){
          featureInfoActive = !featureInfoActive;
          if (featureInfoActive == true){
            $(button).addClass('active');
          }else{
            $(button).removeClass('active');
          }
          
        }, true);

        var element = document.createElement('div');
        element.className = 'ol-control feature-info';
        element.appendChild(button);
        element.title = "Query map"

        ol.control.Control.call(this, {
          element: element,
          target: options.target
        });
      }
      ol.inherits(featureInfoControl, ol.control.Control);

      map.then(function(map){        
        map.on('singleclick', function(evt) {
          if(featureInfoActive == true){
            getFeatureInfo(map, evt);
          }
        });
        map.addControl(new featureInfoControl());
        map.addControl(new zoomFull());
        // workaround for chrome fullscreen
        document.addEventListener("webkitfullscreenchange", function(evt) {
          var viewport = $('.angular-openlayers-map').first();
          if(viewport.hasClass('map-fullscreen')){
            viewport.removeClass('map-fullscreen');
            $('#map_products').removeClass('fullscreen');
          }else{
            viewport.addClass('map-fullscreen');
            $('#map_products').addClass('fullscreen');
          }
        });
      });
      
      function getFeatureInfo(map, evt){
        var viewResolution = map.getView().getResolution();
          var map_layers = map.getLayers();
          var layers_typename = '';
          map_layers.forEach(function(layer, index, array){
            var source = layer.getSource();
            if(source instanceof ol.source.TileWMS){
              layers_typename += source.getParams()['LAYERS'];
              if(index < array.length -1){
                layers_typename += ',';
              }
            }
          });  
          var wmsSource = new ol.source.TileWMS({
            url: GEOSERVER_PUBLIC_URL + 'wms',
            params: {'LAYERS': layers_typename},
            serverType: 'geoserver'
          });
          var url = wmsSource.getGetFeatureInfoUrl(
              evt.coordinate, viewResolution, 'EPSG:3857',
              {'INFO_FORMAT': 'application/json',
                'FEATURE_COUNT': 100});
          
        url = encodeURIComponent(decodeURIComponent(url));

        $http.get('/proxy/?url='+url).then(function(response){
          for(var i=0;i<response.data.features.length;i++){
              response.data.features[i]['properties_keys'] = Object.keys(response.data.features[i].properties)
            }
          $scope.feature_info = response.data.features;
        });
      }
    });
})();


(function(){
  angular.module('query_activation',[])
    .factory('QueryActivation', function($http){
    return {
      query: function(activation_id){
        var promise = $http.get('/api/activations/'+activation_id)
          .then(function(response){
            return response.data;
          });
        return promise;
      }
    }
  });
})();

(function(){
  angular.module('activation_controller', ['query_activation', 'openlayers-directive'])

    .controller('ActivationController', function($scope, QueryActivation, ActData, olData){
      QueryActivation.query(ActData.activation_id).then(function(data){
        $scope.map_products = {}
        $scope.item = data;
        $scope.detail_page = true;
        data.map_sets.forEach(function(map_set, i){
          map_set.map_products.forEach(function(val, i){
            $scope.map_products[val['id']] = val;
          });
        });
      })

      var map = olData.getMap();
      var layers = {};

      $scope.getFaClass = function(id){
        //Returns the correct font awesone icon checking if the layer is on the map or not.
        if(layers.hasOwnProperty(id) && layers[id].is_on_map == true){
          return ("fa-map-o");
        }else{
          return ("fa-map")
        }
      }

      function add_layer_to_map(map, layer){
        map.addLayer(layer);
        layer.is_on_map = true;
      }

      function remove_layer_from_map(map, layer){
        map.removeLayer(layer);
        layer.is_on_map = false;
      }

      $scope.toggle_layer = function(mp_id, layer_id, event){
        map.then(function(map){
          var layer = get_or_create_layer(mp_id, layer_id);
          if(layer.is_on_map == true){
            remove_layer_from_map(map, layer);
          }else{
            add_layer_to_map(map, layer);
          }
        });
      }

      function get_or_create_layer(mp_id, layer_id){
        // gets or creates a leaflet layer
        var layer_data = null;
        var mp = $scope.map_products[mp_id];

        // search the layer info from map products
        for(var i=0; i<mp.layers.length; i++){
          if(mp.layers[i].id == layer_id){
            layer_data = mp.layers[i];
            break
          }
        };

        // Only attempt to create a layer if is not already available in the layers list
        if(!layers.hasOwnProperty(layer_id)){

          //make sure that the layer_data is not empty
          if(layer_data != null){

            layers[layer_id] = new ol.layer.Tile({
              source: new ol.source.TileWMS({
                url: GEOSERVER_PUBLIC_URL + 'wms',
                params: {'LAYERS': decodeURIComponent(layer_data.detail_url.split('/')[2])},
                serverType: 'geoserver',
                transparent: true,
                format: 'image/png'
              })
            });

          }else{
            throw('Layer not found in the map_product');
          }
        }
        return layers[layer_id];
      };

      $scope.zoom_to_mp = function(mp_id){
        // Zoom to a map product
        map.then(function(map){
          var mp = $scope.map_products[mp_id];
          var extent = ol.proj.transformExtent([parseFloat(mp.bbox_x0), parseFloat(mp.bbox_y0), parseFloat(mp.bbox_x1), parseFloat(mp.bbox_y1)], 'EPSG:4326','EPSG:900913');
          map.getView().fit(extent, map.getSize());
        });
      }

      $scope.add_mp_layers = function(mp_id){
        // Add all the layers of a map product to the map
        map.then(function(map){
          var mp = $scope.map_products[mp_id];

          for(var i=0; i<mp.layers.length; i++){

            var layer_id = mp.layers[i].id;
            var layer = get_or_create_layer(mp_id, layer_id);

            if(!layer.is_on_map == true){
              add_layer_to_map(map, layer);
            }
          }
          //$scope.zoom_to_mp(mp_id);
        })
      };

      function add_all_layers(){
        $.each($scope.map_products, function(mp_id){
          // mp is the id
          $scope.add_mp_layers(mp_id);
        });
      }

      function remove_all_layers(){
        map.then(function(map){
          $.each(layers, function(layer_id){
            // layer is the id
            remove_layer_from_map(map, layers[layer_id]);
          })
        })
      }

      $scope.toggleLayers = function(action){
        if(action == true){
          add_all_layers();
        }else{
          remove_all_layers();
        }
      }

      var external_layers = {};
      $scope.toggle_external_layer = function(url, layer_name){
        map.then(function(map){
          if (external_layers.hasOwnProperty(layer_name)){
            var the_layer = external_layers[layer_name];
            if(the_layer.is_on_map == true){
              map.removeLayer(the_layer);
              the_layer.is_on_map = false;
            }else{
              map.addLayer(the_layer);
              the_layer.is_on_map = true;
            }
          }else{
            var new_layer = new ol.layer.Image({
              source: new ol.source.ImageWMS({url: url, params:{layers: layer_name}})
            });
            external_layers[layer_name] = new_layer;
            new_layer.is_on_map = true;
            map.addLayer(new_layer);
          }
        });
      }
    });
})();
