import React from 'react';
import ReactDOM from 'react-dom';
import ol from 'openlayers';
import {addLocaleData, IntlProvider, injectIntl, intlShape} from 'react-intl';
import MapPanel from 'boundless-sdk/components/MapPanel';
import getMuiTheme from 'material-ui/styles/getMuiTheme';
import CustomTheme from './theme';
import ToolActions from 'boundless-sdk/actions/ToolActions';
import Zoom from 'boundless-sdk/components/Zoom';
import ActivationsList from './components/ComposerActivationsList.jsx';
import LoadingPanel from 'boundless-sdk/components/LoadingPanel';
import Select from 'boundless-sdk/components/Select';
import HomeButton from 'boundless-sdk/components/HomeButton';
import AddLayer from 'boundless-sdk/components/AddLayer';
import RaisedButton from 'material-ui/RaisedButton';
import {Tabs, Tab} from 'material-ui/Tabs';
import injectTapEventPlugin from 'react-tap-event-plugin';
import AppConfig from './constants/AppConfig.js';
import ViewerAppBar from './components/ViewerAppBar.jsx';
import ActInfoPanel from './components/ComposerActInfoPanel.jsx'
import AppDispatcher from 'boundless-sdk/dispatchers/AppDispatcher';
import Snackbar from 'material-ui/Snackbar';


// Needed for onTouchTap
// Can go away when react 1.0 release
// Check this repo:
// https://github.com/zilverline/react-tap-event-plugin
injectTapEventPlugin();

var map = new ol.Map({
  controls: [],
  layers: [
    new ol.layer.Tile({
      type: 'base',
      title: 'Streets dark',
      source: new ol.source.XYZ({
        url: 'https://cartodb-basemaps-{a-c}.global.ssl.fastly.net/dark_all/{z}/{x}/{y}@2x.png',
        attributions: [
          new ol.Attribution({
            html: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, &copy; <a href="http://cartodb.com/attributions">CartoDB</a>'
          })
        ]
      })
    }),
    new ol.layer.Tile({
      type: 'base',
      title: 'Streets light',
      visible: false,
      source: new ol.source.XYZ({
        url: 'https://cartodb-basemaps-{a-c}.global.ssl.fastly.net/light_all/{z}/{x}/{y}@2x.png',
        attributions: [
          new ol.Attribution({
            html: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, &copy; <a href="http://cartodb.com/attributions">CartoDB</a>'
          })
        ]
      })
    }),
    new ol.layer.Tile({
      type: 'base',
      title: 'Aerial',
      visible: false,
      source: new ol.source.XYZ({
        attributions: [
          new ol.Attribution({
            html:['Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP']
          })
        ],
        url: 'http://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}'
      })
    })
  ],
  view: new ol.View({
    center: [0, 0],
    zoom: 3,
    maxZoom: 21
  }),
  controls: [new ol.control.Attribution({collapsible: false})]
});

var filterBaseLayersIn = lyr => {
  return (lyr.get('type') === 'base-group' || lyr.get('type') === 'base');
};

var filterBaseLayersOut = lyr => {
  return (lyr.get('type') !== 'base-group' && lyr.get('type') !== 'base');
};

class Composer extends React.Component {
  constructor(props){
    super(props);
    this.state = {
     saveOpen: false,
     errorOpen: false
    }
  }

  getChildContext() {
    return {
      muiTheme: getMuiTheme(CustomTheme)
    };
  }

  _hideSaveMsg() {
    this.setState({
      saveOpen: false
    });
  }

  _showSaveMsg() {
   this.setState({
     saveOpen: true
   });
  }

  _hideErrMsg() {
    this.setState({
      errorOpen: false
    });
  }

  _showErrMsg() {
   this.setState({
     errorOpen: true
   });
  }

  render() {
    let save_msg;
    if (this.state.saveOpen){
     save_msg = (<Snackbar
       autoHideDuration={3000}
       style={{transitionProperty : 'none'}}
       bodyStyle={{lineHeight: '24px', height: 'auto'}}
       open={this.state.saveOpen}
       message={'Map correctly saved'}
       onRequestClose={this._hideSaveMsg.bind(this)}
     />)
    }
    let error_msg;
    if (this.state.errorOpen){
     error_msg = (<Snackbar
       autoHideDuration={3000}
       style={{transitionProperty : 'none'}}
       bodyStyle={{lineHeight: '24px', height: 'auto'}}
       open={this.state.saveOpen}
       message={'Ops, something went wrong in saving the map'}
       onRequestClose={this._hideErrMsg.bind(this)}
     />)
    }
    return (
      <div id='content'>
        <ViewerAppBar page={'composer'} />
        <div className='row container'>
          <div className="col tabs" id="tabs-panel">
            <ActivationsList
              className={'overlays'}
              filter={filterBaseLayersOut}
              showOnStart={true}
              addLayer={{sources: {list: AppConfig.LIST_ACTIVATIONS_URL, full: AppConfig.FULL_ACTIVATIONS_URL}}}
              showOpacity={true}
              showDownload={true}
              showGroupContent={true}
              showZoomTo={true}
              allowRemove={true}
              allowReordering={true}
              map={map}
              showSave={this._showSaveMsg.bind(this)}
              showError={this._showErrMsg.bind(this)}/>
          </div>
          <div className="col maps">
            <MapPanel id='map' useHistory={false} map={map} />
            <LoadingPanel map={map} />
            <ActivationsList className={'baselayers'} filter={filterBaseLayersIn} map={map}/>
            <div id='home-button'><HomeButton map={map} /></div>
            <div id='zoom-buttons'><Zoom map={map} /></div>
          </div>
          {save_msg}
          {error_msg}
          <ActInfoPanel />
        </div>
      </div>
    );
  }
}

Composer.propTypes = {
  /**
   * i18n message strings. Provided through the application through context.
   */
  intl: intlShape.isRequired
};

Composer.childContextTypes = {
  muiTheme: React.PropTypes.object
};

Composer = injectIntl(Composer);

ReactDOM.render(<IntlProvider locale='en'><Composer /></IntlProvider>, document.getElementById('main'));
