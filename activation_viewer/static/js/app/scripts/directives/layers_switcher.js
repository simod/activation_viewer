'use_strict';

(function(){
  angular.module('layers_switcher_directive', [])
    .directive('layerSwitcher', [function(){
      return {
        restrict: 'E',
        templateUrl: "/static/js/app/templates/_act_layers_list.html"
      };
    }])
})();