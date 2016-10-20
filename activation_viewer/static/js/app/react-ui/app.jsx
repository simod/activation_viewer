import React from 'react';
import ReactDOM from 'react-dom';
import {IntlProvider} from 'react-intl';
import injectTapEventPlugin from 'react-tap-event-plugin';
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import ol from 'openlayers';
import MapPanel from 'boundless-sdk/js/components/MapPanel.jsx';
import LatestActivations from './components/latest_activations.jsx'

injectTapEventPlugin();
  
var map = new ol.Map({
  layers: [
    new ol.layer.Tile({
      type: 'base',
      title: 'OSM Streets',
      source: new ol.source.TileArcGISRest({
        url: 'http://services.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Light_Gray_Base/MapServer'
      })
    })
  ],
  view: new ol.View({
    center: [6237703.28643, 6513410.44128],
    zoom: 4
  })
});

map.addInteraction(new ol.interaction.Select({
  condition: ol.events.condition.pointerMove
}));


class App extends React.Component {
  render() {
    return (
      <div id='content'>
        <div id="ec-logo"></div>
        <div id="title">
          <h1>Copernicus EMS Activation Viewer</h1>
          <p>The Activation Viewer helps to use, 
          share and consume the vector data and raster tiles of aerial imagery produced within the Copernicus Emergency Mapping Service.</p>
          <p>This platform belongs to the European Commission, Joint Research Centre and is run by the GEMMA project, Disaster Risk Management Unit.</p>
        </div>
        <MapPanel id='map' map={map} useHistory={false} />
        <MuiThemeProvider>
          <LatestActivations map={map} />
        </MuiThemeProvider>
      </div>
    );
  }
}

ReactDOM.render(
  <IntlProvider locale="en"><App /></IntlProvider>,
  document.getElementById('main')
); 