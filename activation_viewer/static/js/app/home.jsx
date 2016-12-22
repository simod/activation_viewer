import React from 'react';
import ReactDOM from 'react-dom';
import {IntlProvider} from 'react-intl';
import injectTapEventPlugin from 'react-tap-event-plugin';
import getMuiTheme from 'material-ui/styles/getMuiTheme';
import ol from 'openlayers';
import MapPanel from 'boundless-sdk/components/MapPanel';
import LatestActivations from './components/ActivationsGrid.jsx';
import ViewerAppBar from './components/ViewerAppBar.jsx';
import CustomTheme from './theme';


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
  }),
  loadTilesWhileAnimating: true
});

map.addInteraction(new ol.interaction.Select({
  condition: ol.events.condition.pointerMove
}));


class App extends React.Component {
  getChildContext() {
    return {
      muiTheme: getMuiTheme(CustomTheme)
    };
  }
  render() {
    return (
      <div id='content'>
        <ViewerAppBar />
        <div id="ec-logo"></div>
        <div id="title">
          <h1>Copernicus EMS Activation Viewer</h1>
          <p>The Activation Viewer helps to use, 
          share and consume the vector data and raster tiles of aerial imagery produced within the Copernicus Emergency Mapping Service.</p>
          <p>This platform belongs to the European Commission, Joint Research Centre and is run by the GEMMA project, Disaster Risk Management Unit.</p>
        </div>
        <MapPanel id='map' map={map} useHistory={false} />
        <LatestActivations map={map} />
      </div>
    );
  }
}

App.childContextTypes = {
  muiTheme: React.PropTypes.object
};

ReactDOM.render(
  <IntlProvider locale="en"><App /></IntlProvider>,
  document.getElementById('main')
); 