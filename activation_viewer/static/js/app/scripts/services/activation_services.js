'use strict';

(function(){
  angular.module('activation_services', [])
    .factory('ActServices', function($http){
      return { 
        // Store activations data and layers
        activation: function(){
          return {
            layers: {},
            activation: {},
            map_products: {},
            addLayer: function(layer){
              this.layers[layer.id] = layer;
            },
            hasLayer: function(id){
              return this.layers.hasOwnProperty(id);
            },
            getLayer: function(id){
              if (this.hasLayer(id)){
                return this.layers[id];
              }else{
                return null;
              }
            },
            isLayerOnMap: function(id){
              return this.hasLayer(id) && this.layers[id].getVisible();
            },
            addMapProduct: function(map_product){
              this.map_products[map_product.id] = map_product;
            },
            getMapProduct: function(id){
              return this.map_products[id];
            },
            getMapProducts: function(){
              return this.map_products;
            }
          }
        },

        // Store all activations
        activations: {
          activations: {},
          add: function(activation){
            this.activations[activation.activation.id] = activation;
          },
          get: function(id){
            if(this.hasActivation(id)){
              return this.activations[id];
            }else{
              return null;
            }
          },
          getAll: function(){
            return this.activations;
          },
          hasActivation: function(id){
            return this.activations.hasOwnProperty(id);
          }
        },
        
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