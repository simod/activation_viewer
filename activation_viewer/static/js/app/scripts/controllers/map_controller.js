'use strict';

(function(){
  angular.module('map_controller', ['openlayers-directive', 'map_addons', 'activation_services'])
    .controller('MapCtrl', function ($rootScope, $scope, $http, olData, MapAddons, ActServices) {

      angular.extend($scope, {
        center: {
            lat: MAP_INITIAL_CENTER[0],
            lon: MAP_INITIAL_CENTER[1],
            zoom: 11
        },
        defaults: {
          view: {
            maxZoom: 21
          }
        },
        controls: [
            { name: 'fullscreen', active: true }
        ],
      });
      
      var map = olData.getMap();

      var popup = new ol.Overlay({
        element: document.getElementById('popup')
      });

      var featureInfoControl = new MapAddons.featureInfoControl();
      
      // Initial map config
      map.then(function(map){        
        
        map.addControl(featureInfoControl);
        map.addControl(new MapAddons.zoomFull());
        map.addInteraction(new ol.interaction.MouseWheelZoom());
        
        map.getControls().forEach(function(control){
          if(control instanceof ol.control.Attribution){
            control.setCollapsible(false);
            control.setCollapsed(false);
          }
        });

        map.on('singleclick', function(evt) {
          getLayersInfo(evt);
        });
      });
      
      //Layer event listeners
      $rootScope.$on('createLayer', function(event, activation_id, layer_data){
        var layer = createLayer(layer_data);
        addLayerToMap(layer);
        addLayerToActivation(activation_id, layer);
      });

      $rootScope.$on('addLayer', function(event, layer){
        setLayerVisible(layer);
      });

      $rootScope.$on('removeLayer', function(event, layer){
        setLayerInvisible(layer);
      });

      $rootScope.$on('hideAllLayers', function(event){
        hideAllLayers();
      });

      $rootScope.$on('sortLayer', function(event, act_id, layer_id, offset){
        sortLayer(act_id, layer_id, offset);
      });

      /*
      Listeners functions
      */
      function addLayerToMap(layer){
        map.then(function(map){
           map.addLayer(layer);
        })       
      };

      function setLayerVisible(layer){
        layer.setVisible(true);
      };

      function setLayerInvisible(layer){
        layer.setVisible(false); 
      };

      
      function addLayerToActivation(activation_id, layer){
        /* 
        When created, keep a reference to the layer into the Activaition
        used to work with the layer later on and avoid slow loops.
        */
        ActServices.activations.get(activation_id).addLayer(layer);
      };

      function hideAllLayers(){
        map.then(function(map){
          map.getLayers().forEach(function(layer){
            if(layer.getProperties().name !== 'default'){
              setLayerInvisible(layer);
            }
          })
        });
      };

      
      function sortLayer(activation_id, layer_id, offset){
        /*
        Sort the layer by the offset from the current location
        */
        map.then(function(map){
          var layer = ActServices.activations.get(activation_id).getLayer(layer_id);
          if(layer){
            var layers = map.getLayers();
            for(var i=0;i<layers.getLength();i++){
              if(layers.getArray()[i] == layer){
                layers.removeAt(i);
                var index = i + offset;
                if(index < 1){index = 1};
                if(index > layers.getLength()){index = layers.getLength() -1};
                layers.insertAt(index, layer);
                break;
              }
            }
          }
        });
      }

      //Map state event listeners

      // Zoom to extent
      // @bbox = [minx, miny, maxx, maxy]
      $rootScope.$on('ZoomToExtent', function(event, bbox){
        map.then(function(map){
          var extent = ol.proj.transformExtent([
            parseFloat(bbox[0]), 
            parseFloat(bbox[1]), 
            parseFloat(bbox[2]), 
            parseFloat(bbox[3])], 
            'EPSG:4326','EPSG:900913');
          map.getView().fit(extent, map.getSize());
        });
      });

      $rootScope.$on('updateMapSize', function(){
        map.then(function(map){
          map.updateSize();
        })
      });

      //Used to create the layer only once then is stored the activation service.
      var attribution = new ol.Attribution({
        html: 'Copernicus Emergency Management Service (&copy; 2016 European Union),'+
              '<a href="http://emergency.copernicus.eu/mapping/list-of-components/EMSR177" target="_blank">[EMSR177] Earthquake in Central Italy</a>, '+
              'Aerial Data Provided by <a href="http://www.cgrspa.com" target="_blank">CGR Spa</a>'
      });
      function createLayer(layer_data){
        var layer = new ol.layer.Tile({
          source: new ol.source.XYZ({
            url: layer_data.tms_url,
            attributions: [attribution]
          }),
          extent: ol.proj.transformExtent([
            parseFloat(layer_data.bbox_x0), 
            parseFloat(layer_data.bbox_y0), 
            parseFloat(layer_data.bbox_x1), 
            parseFloat(layer_data.bbox_y1)], 
            'EPSG:4326','EPSG:900913')
        });
        layer.id = layer_data.id;
        layer.title = layer_data.title;
        layer.typename = layer_data.typename;
        return layer;

      };

      // GetFeatureinfo implementation
      function getFeatureInfo(evt){
        map.then(function(map){

          var viewResolution = map.getView().getResolution();
          var map_layers = map.getLayers();
          var layers_typename = '';

          map_layers.forEach(function(layer, index, array){
            if (!(layer.getSource() instanceof ol.source.OSM)){
              layers_typename += layer.typename;
              if(index < array.length -1){
                layers_typename += ',';
              }
            }
          });

          var wmsSource = new ol.source.TileWMS({
            url: GEOSERVER_PUBLIC_URL + 'wms',
            params: {'LAYERS': layers_typename},
            serverType: 'geoserver'
          });

          var url = wmsSource.getGetFeatureInfoUrl(
              evt.coordinate, viewResolution, 'EPSG:3857',
              {'INFO_FORMAT': 'application/json',
                'FEATURE_COUNT': 100});
          
          url = encodeURIComponent(decodeURIComponent(url));

          $http.get('/proxy/?url='+url).then(function(response){
            if(response.data.hasOwnProperty('features')){
              for(var i=0;i<response.data.features.length;i++){
                response.data.features[i]['properties_keys'] = Object.keys(response.data.features[i].properties)
              }
              $scope.feature_info = response.data.features;
            }
          });
        });
      }

      function getLayersInfo(evt){
        var element = popup.getElement();
        if(featureInfoControl.active){
          map.then(function(map){
            // Popup showing the position the user clicked
            
            map.addOverlay(popup);
 
            var coordinate = evt.coordinate;
            var hdms = ol.coordinate.toStringHDMS(ol.proj.transform(
                coordinate, 'EPSG:3857', 'EPSG:4326'));

            $(element).popover('destroy');
            popup.setPosition(coordinate);
            // the keys are quoted to prevent renaming in ADVANCED mode.
            

            var layer_titles = [];
            var layers = map.getLayers();
            layers.forEach(function(layer){
              if (!(layer.getSource() instanceof ol.source.OSM)){
                if(ol.extent.containsCoordinate(layer.getExtent(), evt.coordinate)){
                  layer_titles.push(layer.title);
                }
              }
            });
            if (layer_titles.length > 0){
              var titles_html = '<ul>';
              for(var i=0;i<layer_titles.length;i++){
                titles_html += '<li>'+layer_titles[i]+'</li>'
              }
              titles_html += '</ul>';
              $(element).popover({
                'placement': 'top',
                'animation': false,
                'html': true,
                'content': titles_html
              });
              $(element).popover('show');
            }
            
          });
        }else{
          $(element).popover('destroy');
        }
      }
      // External Layers management
      var external_layers = {};
      
      $scope.$on('toggleExternalLayer', function(event, url, layer_name){
        toggleExternalLayer(url, layer_name);
      });

      function toggleExternalLayer(url, layer_name){
        map.then(function(map){
          if (external_layers.hasOwnProperty(layer_name)){
            var the_layer = external_layers[layer_name];
            if(the_layer.getVisible()){
              setLayerInvisible(the_layer);
            }else{
              setLayerVisible(the_layer);
            }
          }else{
            var new_layer = new ol.layer.Image({
              source: new ol.source.ImageWMS({url: url, params:{layers: layer_name}})
            });
            external_layers[layer_name] = new_layer;
            map.getLayers().setAt(1, new_layer);
          }
        });
      }
    });
})();