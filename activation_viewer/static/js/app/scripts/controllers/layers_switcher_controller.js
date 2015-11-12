'use strict';

(function(){

  // Handle maps set icons
  $(document).on('hidden.bs.collapse shown.bs.collapse', '.map-set', function(evt){
    if($(evt.target).hasClass('ms-tabpanel')){
      var elem = $($(evt.currentTarget).find('.ms-title')[0]);
      if (elem.hasClass('fa-chevron-right')){
        elem.removeClass('fa-chevron-right');
        elem.addClass('fa-chevron-down');
      }else{
        elem.removeClass('fa-chevron-down');
        elem.addClass('fa-chevron-right');
      }
    }
  });

  angular.module('layers_switcher_controller', ['activation_services'])
    .controller('LayerSwitcherController', function($rootScope, $scope, ActServices){

      $scope.getFaClass = function(act_id, layer_id){
        //Returns the correct font awesone icon checking if the layer is on the map or not.
        var activation = ActServices.activations.get(act_id);
        if(activation.isLayerOnMap(layer_id)){
          return ("fa-map-o");
        }else{
          return ("fa-map");
        }
      }

      $scope.toggleLayer = function(act_id, layer_data){
        var activation = ActServices.activations.get(act_id);
        var layer = activation.getLayer(layer_data.id);

        if(!layer || !layer.getVisible()){
          addLayer(layer, act_id, layer_data);
        }else{
          removeLayer(layer);
        }
      };

      $scope.zoomToMapProduct = function(act_id, mapproduct_id){
        var activation = ActServices.activations.get(act_id);
        var map_product = activation.getMapProduct(mapproduct_id);
        var extent = [map_product.bbox_x0, map_product.bbox_y0, map_product.bbox_x1, map_product.bbox_y1];
        $rootScope.$emit('ZoomToExtent', extent);
      };

      $scope.toggleMapProductLayers = function(action, act_id, mapproduct_id){
        if(action){
          showMapProductLayers(act_id, mapproduct_id);
        }else{
          hideMapProductLayers(act_id, mapproduct_id);
        }
      };

      $scope.$on('addActivationLayers', function(event, act_id){
        $.each(ActServices.activations.get(act_id).getMapProducts(), function(mapproduct_id){
          $scope.showMapProductLayers(act_id, mapproduct_id);
        });
      });

      $scope.$on('hideActivationLayers', function(event){
        $rootScope.$emit('hideAllLayers');
      });

      function showMapProductLayers(act_id, mapproduct_id){
        var activation = ActServices.activations.get(act_id);
        var map_product = activation.getMapProduct(mapproduct_id);
        $.each(map_product.layers, function(index, layer_data){
          addLayer(activation.getLayer(layer_data.id), act_id, layer_data);
        });
      };

      function hideMapProductLayers(act_id, mapproduct_id){
        var activation = ActServices.activations.get(act_id);
        var map_product = activation.getMapProduct(mapproduct_id);
        $.each(map_product.layers, function(index, layer_data){
          removeLayer(activation.getLayer(layer_data.id));
        });
      };

      function addLayer(layer, act_id, layer_data){
        if(!layer){
          $rootScope.$emit('createLayer', act_id, layer_data);
        }else if(!layer.getVisible()){
          $rootScope.$emit('addLayer', layer);
        }
      };

      function removeLayer(layer){
        $rootScope.$emit('removeLayer', layer);
      };
    })
})();