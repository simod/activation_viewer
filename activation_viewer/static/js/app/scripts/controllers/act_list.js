'use strict';

(function(){
  angular.module('actications_list_controller', ['activation_services'])
    .controller('ActivationListController', function($rootScope, $scope, ActServices){
      $scope.has_map = false;
      $scope.has_cart = true;

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