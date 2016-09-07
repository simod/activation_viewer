'use strict';

(function(){
  angular.module('actications_list_controller', ['activation_services'])
    .controller('ActivationListController', function($rootScope, $scope, ActServices){
      $scope.has_map = false;
      $scope.has_cart = true;

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

      $('#full-map-composer').on('shown.bs.modal', function(){
        $scope.has_map = true;
        $scope.has_cart = false;
        $rootScope.$broadcast('updateMapSize');
        $('#activations-list').detach().appendTo('#activations-list-modal');
      });

      $('#full-map-composer').on('hidden.bs.modal', function(){
        $scope.has_map = false;
        $scope.has_cart = true;
        $rootScope.$broadcast('updateMapSize');
        $('#activations-list').detach().appendTo('#activations-list-container');
      });

      $scope.$on('updateActivationsData', function(event, activations_data){
        activations_data.forEach(function(activation_data, i){

          var activation = new ActServices.activation();
          activation.activation = activation_data;
          ActServices.activations.add(activation);
          activation_data.map_sets.forEach(function(map_set, i){
            map_set.map_products.forEach(function(val, i){
              activation.addMapProduct(val);
            });
          });
        });

      });

    });
})();