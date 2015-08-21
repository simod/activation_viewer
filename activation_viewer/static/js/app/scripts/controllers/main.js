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
  angular.module('act_snippet_controller',['leaflet-directive'])
    .controller('ActSnippetCtrl', function ($scope, leafletData) {
      var map = leafletData.getMap('activation-map');
      $scope.toggle_layer = function(url, id, event){
        var article = $($('[resource_id='+id+']')[0]);
        map.then(function(map){
          
          // Article handling
          if(article.hasClass('on-map')){
            map.removeLayer(map._layers[id]);
            article.removeClass('on-map');
            $(event.target).html('Add to map');

          }else{
            var layer = new L.tileLayer.wms('http://localhost:8080/geoserver/wms',{
              layers: decodeURIComponent(url.split('/')[2]),
              format: 'image/png8',
              transparent: true
            });
            layer._leaflet_id = id;
            layer.addTo(map);
            article.addClass('on-map');
            $(event.target).html('Remove from map');  
          }    
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
  angular.module('activation_controller', ['query_activation', 'leaflet-directive'])
    .controller('ActivationController', function($scope, QueryActivation, ActData, leafletData){
      QueryActivation.query(ActData.activation_id).then(function(data){
        $scope.map_products = data.map_products
      });
      var map = leafletData.getMap('activation-map');
      $scope.toggle_layer = function(id, detail_url, bbox, event){
        map.then(function(map){
          var article = $(event.target);
          // Article handling
          if(article.hasClass('on-map')){
            map.removeLayer(map._layers[id]);
            article.removeClass('on-map');
            $(event.target).html('Add to map');

          }else{
            var layer = new L.tileLayer.wms('http://localhost:8080/geoserver/wms',{
              layers: decodeURIComponent(detail_url.split('/')[2]),
              format: 'image/png8',
              transparent: true
            });
            layer._leaflet_id = id;
            layer.addTo(map);
            var bounds = L.latLngBounds(L.latLng(bbox[1], bbox[0]), L.latLng(bbox[3], bbox[2]));
            map.fitBounds(bounds);
            article.addClass('on-map');
            $(event.target).html('Remove from map');  
          }    
        });
      }
      $scope.zoom_to_mp = function(event){
        map.then(function(map){
          var bbox = $(event.target).attr('data-bbox').split(',');
          map.fitBounds(L.latLngBounds(L.latLng(bbox[0], bbox[1]), L.latLng(bbox[2], bbox[3])));
        });
      }
    });
})();
