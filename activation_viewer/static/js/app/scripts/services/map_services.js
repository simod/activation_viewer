'use srtict';

(function(){

  angular.module('map_addons', ['openlayers-directive'])
    .factory('MapAddons', function(ActData){
     
      return {
        zoomFull: function(){
           // Zoom to full extent control
          var control = function(opt_options){
            var options = opt_options || {};
            var self = this;

            var button = document.createElement('button');
            button.innerHTML = 'Z';

            button.addEventListener('click', function(){
              var map = self.getMap();
              var act_bbox = ActData.full_bbox;
              var extent = ol.proj.transformExtent([parseFloat(act_bbox[0]), parseFloat(act_bbox[1]), 
                parseFloat(act_bbox[2]), parseFloat(act_bbox[3])], 'EPSG:4326','EPSG:900913');
              map.getView().fit(extent, map.getSize());
            }, true);

            var element = document.createElement('div');
            element.className = 'ol-control zoom-full';
            element.appendChild(button);
            element.title = "Zoom to full extent"

            ol.control.Control.call(this, {
              element: element,
              target: options.target
            });
          };
          ol.inherits(control, ol.control.Control);
          return new control();
        },
      
        featureInfoControl: function(){
          // Feature info control
          var control = function(opt_options){

            this.active = false;
            var self = this;
            
            var options = opt_options || {};
            
            var button = document.createElement('button');
            button.innerHTML = '?';

            button.addEventListener('click', function(){
              self.active = !self.active;
              if (self.active == true){
                $(button).addClass('active');
              }else{
                $(button).removeClass('active');
              }
              
            }, true);

            var element = document.createElement('div');
            element.className = 'ol-control feature-info';
            element.appendChild(button);
            element.title = "Query map"

            ol.control.Control.call(this, {
              element: element,
              target: options.target
            });
          }
          ol.inherits(control, ol.control.Control);
          return new control();
        }
      }
    });
})();