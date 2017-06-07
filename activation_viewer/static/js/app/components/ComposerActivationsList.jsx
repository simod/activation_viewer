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
import ReactDOM from 'react-dom';
import HTML5Backend from 'react-dnd-html5-backend';
import {DragDropContext} from 'react-dnd';
import LayerActions from 'boundless-sdk/actions/LayerActions';
import ol from 'openlayers';
import debounce from  'debounce';
import classNames from 'classnames';
import getMuiTheme from 'material-ui/styles/getMuiTheme';
import LayerIdService from 'boundless-sdk/services/LayerIdService';
import LayerStore from 'boundless-sdk/stores/LayerStore';
import LayerListItem from './LayerListItem.jsx';
import Label from 'boundless-sdk/components/Label';
import AddActivationsModal from './AddActivationsModal.jsx';
import RaisedButton from 'material-ui/RaisedButton';
import Button from 'boundless-sdk/components/Button';
import NoteAdd from 'material-ui/svg-icons/action/note-add';
import ContentSave from 'material-ui/svg-icons/content/save';
import ContentCopy from 'material-ui/svg-icons/content/content-copy';
import {List} from 'material-ui/List';
import LayersIcon from 'material-ui/svg-icons/maps/layers';
import {Toolbar, ToolbarGroup} from 'material-ui/Toolbar';
import {defineMessages, injectIntl, intlShape} from 'react-intl';
import pureRender from 'pure-render-decorator';
import Divider from 'material-ui/Divider';
import 'boundless-sdk/components/LayerList.css';
import CustomTheme from '../theme';


const messages = defineMessages({
  layertitle: {
    id: 'layerlist.layertitle',
    description: 'List of layers',
    defaultMessage: 'Layers'
  },
  addlayertitle: {
    id: 'layerlist.addlayertitle',
    description: 'Title for Add layers button',
    defaultMessage: 'Add layers'
  },
  addlayertext: {
    id: 'layerlist.addlayertext',
    description: 'Text for Add activations button',
    defaultMessage: 'Add Activation'
  },
  savemaptext: {
    id: 'layerlist.savemap',
    description: 'Text for save map',
    defaultMessage: 'Save'
  },
  savemapcopytext: {
    id: 'layerlist.savemapcopy',
    description: 'Text for save map copy',
    defaultMessage: 'Copy'
  }
});

/**
 * A list of layers in the map. Allows setting visibility and opacity.
 *
 * ```html
 * <div id='layerlist'>
 *   <LayerList allowFiltering={true} showOpacity={true} showDownload={true} showGroupContent={true} showZoomTo={true} allowReordering={true} map={map} />
 * </div>
 * ```
 */
@pureRender
class ActivationsList extends React.Component {
  constructor(props, context) {
    super(props);
    LayerStore.bindMap(this.props.map);
    this.state = {
      muiTheme: context.muiTheme || getMuiTheme(CustomTheme),
      initial_config: this.props.initial_config,
      saved: false
    };
    this.moveLayer = debounce(this.moveLayer, 100);
  }
  getChildContext() {
    return {muiTheme: getMuiTheme(CustomTheme)};
  }
  componentWillMount() {
    this._onChangeCb = this._onChange.bind(this);
    LayerStore.addChangeListener(this._onChangeCb);
    this._onChange();
    if (this.props.showOnStart) {
      this._showPanel();
    }
  }
  componentWillUnmount() {
    LayerStore.removeChangeListener(this._onChangeCb);
  }
  _onChange() {
    this.setState(LayerStore.getState());
  }
  renderLayerGroup(group) {
    return this.renderLayers(group.getLayers().getArray().slice(0).reverse(), group);
  }
  renderLayers(layers, group) {
    var me = this;
    var layerNodes = [];
    for (var i = 0, ii = layers.length; i < ii; ++i) {
      var lyr = layers[i];
      if (lyr.get('act_id') && layerNodes.length > 0){
        layerNodes.push(<Divider inset={true} key={'divider' + i} />);
      }
      if (!this.props.filter || this.props.filter(lyr) === true) {
        layerNodes.push(me.getLayerNode(lyr, group, (ii - i) - 1));
      }
    }
    return layerNodes;
  }
  _showPanel(evt) {
    if (!this.state.visible) {
      this.setState({visible: true});
    }
  }
  _isDescendant(el) {
    var parent = ReactDOM.findDOMNode(this.refs.parent);
    var node = el;
    while (node !== null) {
      if (node == parent) {
        return true;
      }
      node = node.parentNode;
    }
    return false;
  }
  _hidePanel(evt) {
    if (this._modalOpen !== true && !this._isDescendant(evt.relatedTarget)) {
      this.setState({visible: false});
    }
  }
  _togglePanel() {
    var newVisible = !this.state.visible;
    if (newVisible || this._modalOpen !== true) {
      this.setState({visible: newVisible});
    }
  }
  _onModalOpen() {
    this._modalOpen = true;
  }
  _onModalClose() {
    this._modalOpen = false;
  }
  getLayerNode(lyr, group, idx) {
    //  Render layer list items, they differ if groups or not
    if (lyr.get('id') === undefined) {
      lyr.set('id', LayerIdService.generateId());
    }
    if (lyr.get('title') !== null) {
      if (lyr instanceof ol.layer.Group) {
        var children = this.props.showGroupContent ? this.renderLayerGroup(lyr) : [];
        return (
          <LayerListItem
          index={idx}
          moveLayer={this.moveLayer}
          {...this.props}
          allowReordering={false}
          onModalClose={this._onModalClose.bind(this)}
          onModalOpen={this._onModalOpen.bind(this)}
          key={lyr.get('id')}
          group={group}
          layer={lyr}
          nestedItems={children}
          title={lyr.get('title')}
          disableTouchRipple={true}
          open={true}
          collapsible={true}/>
        );
      } else {
        return (
          <LayerListItem
          index={idx}
          moveLayer={this.moveLayer}
          {...this.props}
          onModalClose={this._onModalClose.bind(this)}
          onModalOpen={this._onModalOpen.bind(this)}
          key={lyr.get('id')}
          layer={lyr}
          group={group}
          title={lyr.get('title')}
          disableTouchRipple={true}
          open={true}
          collapsible={false}
          className={'overlay-layer'}/>
        );
      }
    }
  }
  _showAddLayer() {
    this.refs.addlayermodal.getWrappedInstance().open();
  }
  getStyles() {
    const muiTheme = this.state.muiTheme;
    const rawTheme = muiTheme.rawTheme;
    return {
      root: Object.assign(this.props.style || {}, {
        background: rawTheme.palette.primary1Color
      })
    };
  }
  moveLayer(dragIndex, hoverIndex, layer, group) {
    LayerActions.moveLayer(dragIndex, hoverIndex, layer, group);
  }
  _doPOST(url, data, success, failure, scope, csrf, contentType, put) {
    var xmlhttp = new XMLHttpRequest();
    xmlhttp.open((put ? 'PUT' : 'POST'), url, true);
    xmlhttp.setRequestHeader('Content-Type', contentType ? contentType : 'text/xml');
    xmlhttp.setRequestHeader('X-CSRFToken', csrf);
    xmlhttp.onreadystatechange = function() {
      if (xmlhttp.readyState === 4) {
        if (xmlhttp.status === 200 || xmlhttp.status === 201) {
          success.call(scope, xmlhttp);
        } else {
          failure.call(scope, xmlhttp);
        }
      }
    };
    xmlhttp.send(data);
    return xmlhttp;
  }
  _getMapState() {
   /* Serialize the state of the map
   * center: the center of the map's view
   * zoom: current zoom of the map's view
   * activations: array of the activations on the map containning information
   *  of their layers. Only the layers are counted and not the mapsets as they
   *  will be loaded anyway and have no parameters
   */
   let map = this.props.map;

   let map_state = {
     center: map.getView().getCenter(),
     zoom: map.getView().getZoom(),
     activations: []
   };

   let activations = LayerStore.getState().layers;
   // Loop over activations (instance of Grops) to get config
   activations.forEach(act_data => {
    if (act_data instanceof ol.layer.Group){
     let activation = {
      id: act_data.get('act_id'),
      layers: {}
     }
     // Loop over mapsets, we noly need layers config
     act_data.get('layers').forEach(mapset => {
      // Loop over layers
      mapset.get('layers').forEach((layer, index) => {
       // Push layer config in activation
       activation.layers[layer.get('mpId')] = {
        opacity: layer.getOpacity(),
        index: index
       }
      });
     });
     // Push activation config in map_state
     map_state.activations.push(activation);
    }
   });
   return map_state;
  }
  _saveMap(copy) {
    let self = this;
    // Get map state, serialize in Json and send to the server
    let map_state = this._getMapState();

    // If the map is already saved, do a PUT request
    let is_put = copy ? false : this.state.saved;

    let url = is_put ? '/api/act-maps/' + global.location.pathname.split('/')[2] : '/api/act-maps/';
    let csrf;
    for (let cookie in document.cookie.split(';')) {
      if (cookie.indexOf('csrftoken') !== -1){
        csrf = cookie.split('=')[1];
      }
    };
    this._doPOST(url,
     JSON.stringify({config: JSON.stringify(map_state)}),
     function(xmlhttp){
      if (!is_put){
       // update the url with the newly created id
       global.history.replaceState({}, '',
        '/' + global.location.pathname.split('/')[1] + '/' + JSON.parse(xmlhttp.response).id);
       self._setSaved();
      }
      self.props.showSave();
     },
     function(xmlhttp){
       self.props.showErr();
     },
     this,
     csrf,
    'application/json',
     is_put
   )
  }
  _setSaved(){
   this.setState({
    saved: true
   })
  }
  render() {
    const {formatMessage} = this.props.intl;
    const styles = this.getStyles();
    var layers = this.state.layers.slice(0).reverse();
    var divClass = {
      'layer-switcher': true,
      'shown': this.state.visible,
      'sdk-component': true,
      'layer-list': true
    };
    var tipLabel = this.props.tipLabel ? (<div className='layer-list-header'><Label>{this.props.tipLabel}</Label></div>) : undefined;
    var addLayer;
    if (this.props.addLayer) {
      addLayer = (
          <article className="layer-list-add">
            <RaisedButton
              icon={<NoteAdd />}
              label={formatMessage(messages.addlayertext)}
              onTouchTap={this._showAddLayer.bind(this)}
              style={{
                margin: '5px'
              }}/>
            <RaisedButton
              icon={<ContentSave />}
              label={formatMessage(messages.savemaptext)}
              onTouchTap={this._saveMap.bind(this, false)}
              style={{
                margin: '5px'
              }}/>
            <RaisedButton
              icon={<ContentCopy />}
              label={formatMessage(messages.savemapcopytext)}
              onTouchTap={this._saveMap.bind(this, true)}
              style={{
                margin: '5px'
              }}/>
            <AddActivationsModal
              srsName={this.props.map.getView().getProjection().getCode()}
              sources={this.props.addLayer.sources}
              map={this.props.map}
              ref='addlayermodal'
              initial_config={this.state.initial_config}
              setSaved={this._setSaved.bind(this)}/>
          </article>
      );
    }

    return (
      <div ref='parent' className={classNames(divClass, this.props.className)}>
        <Button
          tooltipPosition={this.props.tooltipPosition}
          buttonType='Action' mini={true}
          style={styles.root}
          className='layerlistbutton'
          tooltip={formatMessage(messages.layertitle)}
          onTouchTap={this._togglePanel.bind(this)}><LayersIcon />
        </Button>
        {addLayer}
        <div className='layer-tree-panel clearfix'>
          {tipLabel}
          <List className='layer-list-list'>
            {this.renderLayers(layers)}
          </List>
        </div>
      </div>
    );
  }
}

ActivationsList.propTypes = {
  /**
   * The map whose layers should show up in this layer list.
   */
  map: React.PropTypes.instanceOf(ol.Map).isRequired,
  /**
   * Style for the button.
   */
  style: React.PropTypes.object,
  /**
   * Should we show a button that allows the user to zoom to the layer's extent?
   */
  showZoomTo: React.PropTypes.bool,
  /**
   * Should we allow for reordering of layers?
   */
  allowReordering: React.PropTypes.bool,
  /**
   * Should we allow for filtering of features in a layer?
   */
  allowFiltering: React.PropTypes.bool,
  /**
   * Should we allow for labeling of features in a layer?
   */
  allowLabeling: React.PropTypes.bool,
  /**
   * Should we allow for styling of features in a vector layer?
   */
  allowStyling: React.PropTypes.bool,
  /**
   * Should we allow for editing of features in a vector layer?
   * This does require having a WFST component in your application.
   */
  allowEditing: React.PropTypes.bool,
  /**
   * Should we show the contents of layer groups?
   */
  showGroupContent: React.PropTypes.bool,
  /**
   * Should we show a download button for layers?
   */
  showDownload: React.PropTypes.bool,
  /**
   * The feature format to serialize in for downloads.
   */
  downloadFormat: React.PropTypes.oneOf(['GeoJSON', 'KML', 'GPX']),
  /**
   * Should we show an opacity slider for layers?
   */
  showOpacity: React.PropTypes.bool,
  /**
   * Text to show on top of layers.
   */
  tipLabel: React.PropTypes.string,
  /**
   * Should we show this component on start of the application?
   */
  showOnStart: React.PropTypes.bool,
  /**
   * Should we allow adding layers?
   */
  addLayer: React.PropTypes.shape({
    sources: React.PropTypes.shape({
      list: React.PropTypes.string.isRequired,
      full: React.PropTypes.string.isRequired
    })
  }),
  /**
   * Css class name to apply on the root element of this component.
   */
  className: React.PropTypes.string,
  /**
   * Position of the tooltip.
   */
  tooltipPosition: React.PropTypes.oneOf(['bottom', 'bottom-right', 'bottom-left', 'right', 'left', 'top-right', 'top', 'top-left']),
  /**
   * A filter function to filter out some of the layers by returning false.
   */
  filter: React.PropTypes.func,
  /**
  * i18n message strings. Provided through the application through context.
  */
  intl: intlShape.isRequired,
  /**
  * Function to show a snackbar message that map is saved
  */
  showSave: React.PropTypes.func,
  /**
  * Function to show a snackbar message that map save errored
  */
  showErr: React.PropTypes.func
};

ActivationsList.defaultProps = {
  showZoomTo: false,
  allowReordering: false,
  allowEditing: false,
  allowFiltering: false,
  allowLabeling: false,
  allowRemove: true,
  allowStyling: false,
  showGroupContent: true,
  showDownload: false,
  downloadFormat: 'GeoJSON',
  includeLegend: false,
  showOpacity: false,
  showOnStart: false
};

ActivationsList.contextTypes = {
  muiTheme: React.PropTypes.object
};

ActivationsList.childContextTypes = {
  muiTheme: React.PropTypes.object.isRequired
};

export default injectIntl(DragDropContext(HTML5Backend)(ActivationsList));
