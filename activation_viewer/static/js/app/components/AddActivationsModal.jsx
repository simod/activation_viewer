/*
 * Copyright 2015-present Boundless Spatial Inc., http://boundlessgeo.com
 * Licensed under the Apache License, Version 2.0 (the "License").
 * You may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 * http://www.apache.org/licenses/LICENSE-2.0
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and limitations under the License.
 */

import React from 'react';
import ol from 'openlayers';
import Dialog from 'material-ui/Dialog';
import Snackbar from 'material-ui/Snackbar';
import {defineMessages, injectIntl, intlShape} from 'react-intl';
import IconButton from 'material-ui/IconButton';
import RefreshIcon from 'material-ui/svg-icons/navigation/refresh';
import pureRender from 'pure-render-decorator';
import TextField from 'material-ui/TextField';
import FlatButton from 'material-ui/FlatButton';
import MenuItem from 'material-ui/MenuItem';
import SelectField from 'material-ui/SelectField';
import {List, ListItem} from 'material-ui/List';
import Checkbox from 'material-ui/Checkbox';
import FolderIcon from 'material-ui/svg-icons/file/folder-open';
import LayerIcon from 'material-ui/svg-icons/maps/layers';
import util from 'boundless-sdk/util';
import AppDispatcher from 'boundless-sdk/dispatchers/AppDispatcher';

import classNames from 'classnames';
import getMuiTheme from 'material-ui/styles/getMuiTheme';
import 'boundless-sdk/components/AddLayerModal.css';
import CustomTheme from '../theme';


const messages = defineMessages({
  servertypelabel: {
    id: 'addwmslayermodal.servertypelabel',
    description: 'Label for the combo for server type',
    defaultMessage: 'Type'
  },
  newservername: {
    id: 'addwmslayermodal.newservername',
    description: 'Title for new server name text field',
    defaultMessage: 'Name'
  },
  newserverurl: {
    id: 'addwmslayermodal.newserverurl',
    description: 'Title for new server url text field',
    defaultMessage: 'URL'
  },
  newservermodaltitle: {
    id: 'addwmslayermodal.newservermodaltitle',
    description: 'Modal title for add new server',
    defaultMessage: 'Add Server'
  },
  addserverbutton: {
    id: 'addwmslayermodal.addserverbutton',
    description: 'Text for add server button',
    defaultMessage: 'Add'
  },
  refresh: {
    id: 'addwmslayermodal.refresh',
    description: 'Refresh tooltip',
    defaultMessage: 'Refresh Layers'
  },
  title: {
    id: 'addwmslayermodal.title',
    description: 'Title for the modal Add layer dialog',
    defaultMessage: 'Add Activations'
  },
  nolayertitle: {
    id: 'addwmslayermodal.nolayertitle',
    description: 'Title to show if layer has no title',
    defaultMessage: 'No Title'
  },
  filtertitle: {
    id: 'addwmslayermodal.filtertitle',
    description: 'Title for the filter field',
    defaultMessage: 'Filter'
  },
  errormsg: {
    id: 'addwmslayermodal.errormsg',
    description: 'Error message to show the user when an XHR request fails',
    defaultMessage: 'Error. {msg}'
  },
  corserror: {
    id: 'addwmslayermodal.corserror',
    description: 'Error message to show the user when an XHR request fails because of CORS or offline',
    defaultMessage: 'Could not connect to GeoServer. Please verify that the server is online and CORS is enabled.'
  },
  inputfieldlabel: {
    id: 'addwmslayermodal.inputfieldlabel',
    description: 'Label for input field',
    defaultMessage: '{serviceType} URL'
  },
  connectbutton: {
    id: 'addwmslayermodal.connectbutton',
    description: 'Text for connect button',
    defaultMessage: 'Connect'
  },
  addbutton: {
    id: 'addwmslayermodal.addbutton',
    description: 'Text for the add button',
    defaultMessage: 'Add'
  },
  closebutton: {
    id: 'addwmslayermodal.closebutton',
    description: 'Text for close button',
    defaultMessage: 'Close'
  }
});

/**
 * Modal window to add layers from a WMS or WFS service.
 */
@pureRender
class AddActivationsModal extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      newModalOpen: false,
      sources: this.props.sources,
      filter: null,
      error: false,
      errorOpen: false,
      open: false,
      layerInfo: null
    };
  }
  getChildContext() {
    return {muiTheme: getMuiTheme(CustomTheme)};
  }
  componentWillUnmount() {
    if (this._request) {
      this._request.abort();
    }
  }
  _initFromHash(){
    let hash = global.location.hash.replace('#', '');
    let activations = hash.split('/');
    activations.forEach(activation_id => {
      this._addActivation(activation_id)
    })
  }
  componentDidMount() {
    if (global.location.hash !== ''){
      this._initFromHash();
    }
  }
  _getCaps() {
    var url = this.state.sources.list;
    var filter = this.state.filter || '';
    url = url + '?q=' + filter;
    var me = this;
    const {formatMessage} = this.props.intl;
    var failureCb = function(xmlhttp) {
      delete me._request;
      if (xmlhttp.status === 0) {
        me._setError(formatMessage(messages.corserror));
      } else {
        me._setError(xmlhttp.status + ' ' + xmlhttp.statusText);
      }
    };
    var successCb = function(xmlhttp) {
      delete me._request;
      me.setState({actInfo: JSON.parse(xmlhttp.response)});
    };
    me._request = util.doGET(url, successCb, failureCb);
  }
  _setError(msg) {
    this.setState({
      errorOpen: true,
      error: true,
      actInfo: null,
      msg: msg
    });
  }
  _onFilterChange(proxy, value) {
    this.setState({filter: value});
  }

  componentDidUpdate(prevProps, prevState){
    if(JSON.stringify(prevState.filter) != JSON.stringify(this.state.filter)){
      this._getCaps();
    }
  }

  _addActivation(activation_id) {
    var map = this.props.map;
    var url = this.state.sources.full;

    var successCb = xmlhttp => {
      let act_data = JSON.parse(xmlhttp.response);
      let map_sets = new ol.Collection();
      
      act_data.map_sets.forEach(map_set => {
        let layers = new ol.Collection();
        map_set.layers.forEach(layer => {
          layers.push(
            new ol.layer.Tile({
              title: layer.title,
              source: new ol.source.XYZ({
                url: layer.tms_url
              }),
              EX_GeographicBoundingBox: [
                parseFloat(layer.bbox_x0), 
                parseFloat(layer.bbox_y0), 
                parseFloat(layer.bbox_x1), 
                parseFloat(layer.bbox_y1)
              ],
              isRemovable: true,
              extent: ol.proj.transformExtent([
                parseFloat(layer.bbox_x0), 
                parseFloat(layer.bbox_y0), 
                parseFloat(layer.bbox_x1), 
                parseFloat(layer.bbox_y1)], 
                'EPSG:4326','EPSG:3857')
            })
          );
        });
        map_sets.push(
          new ol.layer.Group({
            title: map_set.name,
            layers: layers,
            EX_GeographicBoundingBox: [
              parseFloat(map_set.bbox_x0), 
              parseFloat(map_set.bbox_y0), 
              parseFloat(map_set.bbox_x1), 
              parseFloat(map_set.bbox_y1)
            ],
            isRemovable: true
          })
        );
      });

      let act_group = new ol.layer.Group({
        title: act_data.activation_id,
        layers: map_sets,
        EX_GeographicBoundingBox: [
          parseFloat(act_data.bbox_x0), 
          parseFloat(act_data.bbox_y0), 
          parseFloat(act_data.bbox_x1), 
          parseFloat(act_data.bbox_y1)
        ],
        isRemovable: true
      });
      act_group.set('act_id', act_data.activation_id);
      map.addLayer(act_group);
      AppDispatcher.dispatch({
        action: {
          type: 'add-activation',
          activation: act_data
       }
      });
    }

    var failureCb = xmlhttp => {
      if (xmlhttp.status === 0) {
        this._setError(formatMessage(messages.corserror));
      } else {
        this._setError(xmlhttp.status + ' ' + xmlhttp.statusText);
      }
    };

    //  only add the activation if is not on the map already
    let act_exists = false;
    map.getLayers().forEach(layer => {
      if (layer.get('act_id') == activation_id){
        act_exists = true;
      }
    });
    if (!act_exists){
      util.doGET(url + activation_id + '/', successCb, failureCb);
    }
  }
  _getActivationMarkup(actInfo) {
    var activations;
    if (actInfo.objects){
      activations = actInfo.objects.map(activation => {
        return (
          <ListItem 
            style={{display: 'block'}}
            leftCheckbox={<Checkbox onCheck={this._onCheck.bind(this, activation)} />} 
            rightIcon={ <FolderIcon />} 
            initiallyOpen={true} 
            key={activation.activation_id} 
            primaryText={
              <div className='layer-title-empty'>{activation.activation_id} - {activation.disaster_type.name} in {activation.region.name}</div>
            }/>
        );
      });
    }
    return activations;
  }
  _onCheck(activation, proxy, checked) {
    if (checked) {
      this._checkedLayers.push(activation);
    } else {
      var idx = this._checkedLayers.indexOf(activation)
      if (idx > -1) {
        this._checkedLayers.splice(idx, 1);
      }
    }
  }
  open() {
    this._getCaps();
    this.setState({open: true});
  }
  close() {
    this.setState({open: false});
  }
  addActivations() {
    for (var i = 0, ii = this._checkedLayers.length; i < ii; ++i) {
      this._addActivation(this._checkedLayers[i].activation_id);
    }
  }
  _handleRequestClose() {
    this.setState({
      errorOpen: false
    });
  }
  closeNewServer() {
    this.setState({newModalOpen: false});
  }  
  render() {
    this._checkedLayers = [];
    const {formatMessage} = this.props.intl;
    var layers;
    if (this.state.actInfo) {
      var actInfo = this._getActivationMarkup(this.state.actInfo);
      layers = <List>{actInfo}</List>;
    }
    var error;
    if (this.state.error === true) {
      error = (<Snackbar
        autoHideDuration={5000}
        style={{transitionProperty : 'none'}}
        bodyStyle={{lineHeight: '24px', height: 'auto'}}
        open={this.state.errorOpen}
        message={formatMessage(messages.errormsg, {msg: this.state.msg})}
        onRequestClose={this._handleRequestClose.bind(this)}
      />);
    }
    var actions = [
      <FlatButton 
        primary={true} 
        label={formatMessage(messages.addbutton)} 
        onTouchTap={this.addActivations.bind(this)} 
        labelStyle={{color: CustomTheme.palette.textColor}}
      />,
      <FlatButton 
        label={formatMessage(messages.closebutton)}
        onTouchTap={this.close.bind(this)} 
        labelStyle={{color: CustomTheme.palette.secondaryTextColor}}
      />
    ];
    return (
      <Dialog className={classNames('sdk-component add-layer-modal', this.props.className)}  actions={actions} autoScrollBodyContent={true} modal={true} title={formatMessage(messages.title)} open={this.state.open} onRequestClose={this.close.bind(this)}>
        <TextField 
          floatingLabelText={formatMessage(messages.filtertitle)} 
          floatingLabelStyle={{color: CustomTheme.palette.primary3Color}} 
          onChange={this._onFilterChange.bind(this)}
        />
        {layers}
        {error}
      </Dialog>
    );
  }
}

AddActivationsModal.propTypes = {
  /**
   * The ol3 map to upload to.
   */
  map: React.PropTypes.instanceOf(ol.Map).isRequired,
  /**
   * Css class name to apply on the dialog.
   */
  className: React.PropTypes.string,
  /**
   * List of api to use for this dialog.
   */
  sources: React.PropTypes.shape({
    list: React.PropTypes.string.isRequired,
    full: React.PropTypes.string.isRequired
  }),
  /**
   * The srs name that the map's view is in.
   */
  srsName: React.PropTypes.string,
  /**
   * i18n message strings. Provided through the application through context.
   */
  intl: intlShape.isRequired
};

AddActivationsModal.childContextTypes = {
  muiTheme: React.PropTypes.object.isRequired
};

export default injectIntl(AddActivationsModal, {withRef: true});
