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
import LayerActions from 'boundless-sdk/js/actions/LayerActions.js';
import ol from 'openlayers';
import classNames from 'classnames';
import getMuiTheme from 'material-ui/styles/getMuiTheme';
import LayerIdService from 'boundless-sdk/js/services/LayerIdService.js';
import LayerStore from 'boundless-sdk/js/stores/LayerStore.js';
import LayerListItem from 'boundless-sdk/js/components/LayerListItem.jsx';
import Label from 'boundless-sdk/js/components/Label.jsx';
import AddActivationsModal from './AddActivationsModal.jsx';
import RaisedButton from 'material-ui/RaisedButton';
import Button from 'boundless-sdk/js/components/Button.jsx';
import NoteAdd from 'material-ui/svg-icons/action/note-add';
import {List} from 'material-ui/List';
import LayersIcon from 'material-ui/svg-icons/maps/layers';
import {Toolbar, ToolbarGroup} from 'material-ui/Toolbar';
import {defineMessages, injectIntl, intlShape} from 'react-intl';
import pureRender from 'pure-render-decorator';
import 'boundless-sdk/js/components/LayerList.css';


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
    defaultMessage: ' Add Activation '
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
      muiTheme: context.muiTheme || getMuiTheme()
    };
  }
  getChildContext() {
    return {muiTheme: getMuiTheme()};
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
      if (!this.props.filter || this.props.filter(lyr) === true) {
        layerNodes.push(me.getLayerNode(lyr, group, (ii - i)));
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
    if (lyr.get('id') === undefined) {
      lyr.set('id', LayerIdService.generateId());
    }
    if (lyr.get('title') !== null) {
      if (lyr instanceof ol.layer.Group) {
        var children = this.props.showGroupContent ? this.renderLayerGroup(lyr) : [];
        return (
          <LayerListItem index={idx} {...this.props} allowReordering={false} onModalClose={this._onModalClose.bind(this)} onModalOpen={this._onModalOpen.bind(this)} key={lyr.get('id')} layer={lyr} nestedItems={children} title={lyr.get('title')} disableTouchRipple={true}/>
        );
      } else {
        return (
          <LayerListItem index={idx} moveLayer={this.moveLayer.bind(this)} {...this.props} onModalClose={this._onModalClose.bind(this)} onModalOpen={this._onModalOpen.bind(this)} key={lyr.get('id')} layer={lyr} group={group} title={lyr.get('title')} disableTouchRipple={true}/>
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
          <Toolbar><ToolbarGroup><RaisedButton icon={<NoteAdd />} label={formatMessage(messages.addlayertext)} onTouchTap={this._showAddLayer.bind(this)} disableTouchRipple={true}/></ToolbarGroup></Toolbar>
          <AddActivationsModal srsName={this.props.map.getView().getProjection().getCode()} sources={this.props.addLayer.sources} map={this.props.map} ref='addlayermodal'/>
          </article>
      );
    }
    return (
      <div ref='parent' className={classNames(divClass, this.props.className)}>
        <Button tooltipPosition={this.props.tooltipPosition} buttonType='Action' mini={true} style={styles.root} className='layerlistbutton' tooltip={formatMessage(messages.layertitle)} onTouchTap={this._togglePanel.bind(this)}><LayersIcon /></Button>
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
  intl: intlShape.isRequired
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
