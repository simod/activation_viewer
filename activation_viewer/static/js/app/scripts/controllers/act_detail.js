'use strict';

(function(){
  angular.module('activation_controller', ['openlayers-directive', 'activation_services'])

    .controller('ActivationController', function($rootScope, $scope, ActData, olData, ActServices){
      
      $scope.has_map = true;
      $scope.has_cart = true;
      
      // Load activation data and fill up the services
      ActServices.query(ActData.activation_id).then(function(data){
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

      $scope.toggleExternalLayer = function(url, layer_name){
        $scope.$broadcast('toggleExternalLayer', url, layer_name);
      }
    });
})();
