'use strict';

(function(){
  angular.module('cart', [])
    .controller('CartList', function($scope, cart){
      $scope.cart = cart;
      $scope.layers_params = '';
  
      $scope.newMap = function(){
        var items = cart.getCart().items;
        var params = '';
        for(var i=0; i<items.length; i++){
          params += 'layer=' + items[i].typename +'&';
        }
        window.open('/maps/new?' + params);
      }
    })

    .directive('resourceCart', [function(){
      return {
        restrict: 'E',
        templateUrl: "/static/js/app/templates/_composerCart.html"
      };
    }])

    .directive('snippetModal', [function(){
      return {
        restrict: 'E',
        templateUrl: "/static/js/app/templates/_act_layers_list.html"
      };
    }])

    .service('cart', function(){
      
      this.init = function(){
        this.$cart = {
          items: []
        };
      };

      this.getCart = function(){
        return this.$cart;
      }

      this.addItem = function(item){
        if(this.getItemById(item.id) === null){
          this.getCart().items.push(item);
        }
      }

      this.removeItem = function(item){
        if(this.getItemById(item.id) !== null){
          var cart = this.getCart();
          angular.forEach(cart.items, function(cart_item, index){
            if(cart_item.id === item.id){
              cart.items.splice(index, 1);
            }
          });
        }
      }

      this.toggleItem = function(item){
        if(this.getItemById(item.id) === null){
          this.addItem(item);
        }else{
          this.removeItem(item);
        }
      }

      this.getItemById = function (itemId) {
        var items = this.getCart().items;
        var the_item = null;
        angular.forEach(items, function(item){
          if(item.id === itemId){
            the_item = item;
          }
        });
        return the_item;
      }

      this.getFaClass = function(id){
        if(this.getItemById(id) === null){
          return 'fa-cart-plus';
        }else{
          return 'fa-remove'
        }
      }
    })

    .run(['cart', function(cart){
      cart.init();
    }])
})();