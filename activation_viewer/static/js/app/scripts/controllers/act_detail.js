'use strict';

(function(){
  angular.module('map_controller', ['leaflet-directive'])
    .controller('MapCtrl', function ($scope, leafletData) {
      angular.extend($scope, {
        center: {
            lat: 0,
            lng: 0,
            zoom: 4
        }
      });
      var map = leafletData.getMap('activation-map');
      map.then(function(map){
        // Add fullscreen control
        if (!window.hasOwnProperty('ActiveXObject')){
          new L.control.fullscreen().addTo(map);
        }

        // Hook the enter/exit fullscreen behaviors
        map.on('enterFullscreen', function () {
          $('#map_products').addClass('fullscreen');
          map.zoomIn(1);
          map.panBy(L.point(2, 2));
        });
        map.on('exitFullscreen', function () {
          $('#map_products').removeClass('fullscreen');
          map.zoomOut(1);
        });
      })
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
  angular.module('activation_controller', ['query_activation', 'leaflet-directive'])
    .controller('ActivationController', function($scope, QueryActivation, ActData, leafletData){
      QueryActivation.query(ActData.activation_id).then(function(data){
        $scope.map_products = {}
        data.map_products.forEach(function(val, i){
          $scope.map_products[val['id']] = val;
        });
      });
      var map = leafletData.getMap('activation-map');

      var layers = {};

      function add_layer_to_map(map, mp_id, layer_id, button){
        var layer_info = get_or_create_layer(mp_id, layer_id);
        if(!map.hasLayer(layer_info[0])){
          layer_info[0].addTo(map);
          button.addClass('on-map');
          button.html('Remove from map');
        }
        return layer_info[1];
      }

      function remove_layer_from_map(map, mp_id, layer_id, button){
        var layer_info = get_or_create_layer(mp_id, layer_id);
        if(map.hasLayer(layer_info[0])){
          map.removeLayer(layer_info[0]);
          button.removeClass('on-map');
          button.html('Add to map');
        }
      }

      $scope.toggle_layer = function(mp_id, layer_id, event){
        var button = $(event.target);
        map.then(function(map){
          if(button.hasClass('on-map')){
            remove_layer_from_map(map, mp_id, layer_id, button);
          }else{
            var layer = add_layer_to_map(map, mp_id, layer_id, button);
            var bounds = L.latLngBounds(L.latLng(layer.bbox_y0, layer.bbox_x0), L.latLng(layer.bbox_y1, layer.bbox_x1));
            map.fitBounds(bounds);
          }
        });
      }

      function get_or_create_layer(mp_id, layer_id){
        // gets or creates a leaflet layer
        var layer_data = null;
        var mp = $scope.map_products[mp_id];
        for(var i=0; i<mp.layers.length; i++){
          if(mp.layers[i].id == layer_id){
            layer_data = mp.layers[i];
            break
          }
        };
        if(!layers.hasOwnProperty(layer_id)){
          if(layer_data != null){
            layers[layer_id] = new L.tileLayer.wms(GEOSERVER_PUBLIC_URL + 'wms',{
              layers: decodeURIComponent(layer_data.detail_url.split('/')[2]),
              format: 'image/png',
              transparent: true
            });
          }else{
            throw('Layer not found in the map_product');
          }
        }
        return [layers[layer_id], layer_data];
      };

      $scope.zoom_to_mp = function(mp_id){
        map.then(function(map){
          var mp = $scope.map_products[mp_id];
          map.fitBounds(L.latLngBounds(L.latLng(mp.bbox_y0, mp.bbox_x0), L.latLng(mp.bbox_y1, mp.bbox_x1)));
        });
      }

      $scope.add_mp_layers = function(mp_id){
        map.then(function(map){
          var mp = $scope.map_products[mp_id];
          for(var i=0; i<mp.layers.length; i++){
            var layer_id = mp.layers[i].id;
            add_layer_to_map(map, mp_id, layer_id, $('#layer_'+layer_id));
          }
          $scope.zoom_to_mp(mp_id);
        })
      };
    });
})();
