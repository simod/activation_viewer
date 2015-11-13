'use strict';

(function(){
  angular.module('activation_controller', ['openlayers-directive', 'activation_services'])

    .controller('ActivationController', function($rootScope, $scope, ActData, olData, ActServices){
      
      // Load activation data and fill up the services
      ActServices.query(ActData.activation_id).then(function(data){
        $scope.has_map = true;
        $scope.has_cart = true;

        var activation = new ActServices.activation();
        activation.activation = data;
        ActServices.activations.add(activation);
        $scope.activation = activation.activation;
        data.map_sets.forEach(function(map_set, i){
          map_set.map_products.forEach(function(val, i){
            activation.addMapProduct(val);
          });
        });
      })

      var map = olData.getMap();

      $scope.zoomToActivation = function(act_id){
        var activation = ActServices.activations.get(act_id).activation;
        var extent = [activation.bbox_x0, activation.bbox_y0, activation.bbox_x1, activation.bbox_y1];
        $rootScope.$emit('ZoomToExtent', extent);
      };

      $scope.toggleActivationLayers = function(action, act_id){
        if(action == true){
          $scope.$broadcast('addActivationLayers', act_id);
        }else{
          $scope.$broadcast('hideActivationLayers');
        }
      };

      $scope.toggleExternalLayer = function(url, layer_name){
        $scope.$broadcast('toggleExternalLayer', url, layer_name);
      }
    });
})();
