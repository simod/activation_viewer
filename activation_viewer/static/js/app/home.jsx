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
      title: 'base',
      source: new ol.source.XYZ({
        url: 'https://cartodb-basemaps-{a-c}.global.ssl.fastly.net/dark_nolabels/{z}/{x}/{y}@2x.png',
        attributions: [
          new ol.Attribution({
            html: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, &copy; <a href="http://cartodb.com/attributions">CartoDB</a>'
          })
        ]
      })
    })
  ],
  view: new ol.View({
    center: [6237703.28643, 6513410.44128],
    zoom: 4,
    maxZoom: 18
  }),
  loadTilesWhileAnimating: true,
  controls: [new ol.control.Attribution({collapsible: false})],
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
          <p>The Activation Viewer is a platform for fast visualization and distribution of images used and crisis information layers which were produced within the Mapping component of the Copernicus Emergency Management Service.</p>
          <p>The platform was developed by the Joint Research Centre, Disaster Risk Management Unit</p>
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
