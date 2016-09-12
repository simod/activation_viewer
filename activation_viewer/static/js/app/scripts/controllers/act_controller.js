'use strict';

(function(){
  angular.module('activation_controller', ['openlayers-directive', 'activation_services'])

    .controller('ActivationController', function($rootScope, $scope, ActData, olData, ActServices){
      
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

    });
})();
