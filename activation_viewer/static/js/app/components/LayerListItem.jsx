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
import {DragSource, DropTarget} from 'react-dnd';
import ol from 'openlayers';
import Button from 'boundless-sdk/components/Button';
import classNames from 'classnames';
import StyleModal from 'boundless-sdk/components/StyleModal';
import LayerActions from 'boundless-sdk/actions/LayerActions';
import Checkbox from 'material-ui/Checkbox';
import {ListItem} from 'material-ui/List';
import {RadioButton} from 'material-ui/RadioButton';
import IconButton from 'material-ui/IconButton';
import OpenIcon from 'material-ui/svg-icons/navigation/expand-less';
import CloseIcon from 'material-ui/svg-icons/navigation/expand-more';
import {defineMessages, injectIntl, intlShape} from 'react-intl';
import getMuiTheme from 'material-ui/styles/getMuiTheme';
import pureRender from 'pure-render-decorator';
import CustomTheme from '../theme';
import LayerTools from './LayerTools.jsx'

const layerListItemSource = {
  canDrag(props, monitor) {
    return (props.allowReordering && props.layer.get('type') !== 'base' && props.layer.get('type') !== 'base-group');
  },
  beginDrag(props) {
    return {
      index: props.index,
      layer: props.layer,
      group: props.group
    };
  }
};

const layerListItemTarget = {
  hover(props, monitor, component) {
    if (props.layer.get('type') === 'base' || props.layer.get('type') === 'base-group') {
      return;
    }
    var sourceItem = monitor.getItem();
    const dragIndex = sourceItem.index;
    const hoverIndex = props.index;
    // Don't replace items with themselves
    if (dragIndex === hoverIndex) {
      return;
    }

    // Determine rectangle on screen
    var comp = ReactDOM.findDOMNode(component);
    if (!comp) {
      return;
    }
    const hoverBoundingRect = comp.getBoundingClientRect();

    // Get vertical middle
    const hoverMiddleY = (hoverBoundingRect.bottom - hoverBoundingRect.top) / 2;

    // Determine mouse position
    const clientOffset = monitor.getClientOffset();

    // Get pixels to the top
    const hoverClientY = clientOffset.y - hoverBoundingRect.top;

    // Only perform the move when the mouse has crossed half of the items height
    // When dragging downwards, only move when the cursor is below 50%
    // When dragging upwards, only move when the cursor is above 50%

    // Dragging downwards
    if (dragIndex < hoverIndex && hoverClientY < hoverMiddleY) {
      return;
    }

    // Dragging upwards
    if (dragIndex > hoverIndex && hoverClientY > hoverMiddleY) {
      return;
    }

    // Time to actually perform the action
    props.moveLayer(dragIndex, hoverIndex, sourceItem.layer, sourceItem.group);
  }
};

function collect(connect, monitor) {
  return {
    connectDragSource: connect.dragSource()
  };
}

function collectDrop(connect, monitor) {
  return {
    connectDropTarget: connect.dropTarget()
  };
}

const messages = defineMessages({
  closebutton: {
    id: 'layerlist.closebutton',
    description: 'Text for close button',
    defaultMessage: 'Close'
  },
  tablemodaltitle: {
    id: 'layerlist.tablemodaltitle',
    description: 'Title for the table modal',
    defaultMessage: 'Table'
  },
  zoombuttonlabel: {
    id: 'layerlist.zoombuttonlabel',
    description: 'Tooltip for the zoom to layer button',
    defaultMessage: 'Zoom'
  },
  downloadbuttonlabel: {
    id: 'layerlist.downloadbuttonlabel',
    description: 'Tooltip for the download layer button',
    defaultMessage: 'Download layer'
  },
  filterbuttonlabel: {
    id: 'layerlist.filterbuttonlabel',
    description: 'Tooltip for the zoom button',
    defaultMessage: 'Filter layer'
  },
  labelbuttonlabel: {
    id: 'layerlist.labelbuttonlabel',
    description: 'Tooltip for the label button',
    defaultMessage: 'Edit layer label'
  },
  stylingbuttonlabel: {
    id: 'layerlist.stylingbuttonlabel',
    description: 'Tooltip for the style layer button',
    defaultMessage: 'Edit layer style'
  },
  removebuttonlabel: {
    id: 'layerlist.removebuttonlabel',
    description: 'Tooltip for the remove activation button',
    defaultMessage: 'Remove activation'
  },
  editbuttonlabel: {
    id: 'layerlist.editbuttonlabel',
    description: 'Tooltip for the edit layer button',
    defaultMessage: 'Edit layer'
  },
  tablebuttonlabel: {
    id: 'layerlist.tablebuttonlabel',
    description: 'Tooltip for the table button',
    defaultMessage: 'Show table'
  }
});

/**
 * An item in the LayerList component.
 */
@pureRender
class LayerListItem extends React.Component {
  constructor(props) {
    super(props);

    this.formats_ = {
      GeoJSON: {
        format: new ol.format.GeoJSON(),
        mimeType: 'text/json',
        extension: 'geojson'
      },
      KML: {
        format: new ol.format.KML(),
        mimeType: 'application/vnd.google-earth.kml+xml',
        extension: 'kml'
      },
      GPX: {
        format: new ol.format.GPX(),
        mimeType: 'application/gpx+xml',
        extension: 'gpx'
      }
    };
    this.state = {
      tableOpen: false,
      checked: props.layer.getVisible()
    };
  }
  getChildContext() {
    return {muiTheme: getMuiTheme(CustomTheme)};
  }
  componentDidMount() {
    this.props.layer.on('change:visible', this._changeLayerVisible, this);
  }
  _disableGroupEvents(evt) {
    this.setState({disabled: !evt.target.getVisible()});
  }
  _enableGroupEvents(evt) {
    if (!evt.target.getVisible()){
      this.setState({checked: evt.target.getVisible()});
    }
  }
  componentWillUnmount() {
    this.props.layer.un('change:visible', this._changeLayerVisible, this);
    if (this.props.group) {
      if (this.props.group.get('type') === 'base-group') {
        this.props.group.un('change:visible', this._disableGroupEvents, this);
      } else {
        this.props.group.un('change:visible', this._enableGroupEvents, this);
      }
    }
  }
  componentWillMount() {
    this.setState({
      open: this.props.open
    });
    if (this.props.group) {
      if (this.props.group.get('type') === 'base-group') {
        this.props.group.on('change:visible', this._disableGroupEvents, this);
      } else {
        this.props.group.on('change:visible', this._enableGroupEvents, this);
      }
    }
  }
  _changeLayerVisible(evt) {
    this.setState({checked: evt.target.getVisible()});
  }
  _handleChange(event) {
    var visible = event.target.checked;
    var i, ii;
    if (event.target.type === 'radio') {
      var forEachLayer = function(layers, layer) {
        if (layer instanceof ol.layer.Group) {
          layer.getLayers().forEach(function(groupLayer) {
            forEachLayer(layers, groupLayer);
          });
        } else if (layer.get('type') === 'base') {
          layers.push(layer);
        }
      };
      var baseLayers = [];
      forEachLayer(baseLayers, this.props.map.getLayerGroup());
      for (i = 0, ii = baseLayers.length; i < ii; ++i) {
        baseLayers[i].setVisible(false);
      }
      this.props.layer.setVisible(true);
    } else {
      this.props.layer.setVisible(visible);
      if (this.props.layer instanceof ol.layer.Group == false && visible){
        this.props.group.setVisible(true);
      }
      if (this.props.layer instanceof ol.layer.Group) {
        if (this.props.layer.get('type') === 'base-group') {
          if (visible === false) {
            this.props.layer.getLayers().forEach(function(child) {
              if (child.getVisible() === true) {
                this._child = child;
              }
              child.setVisible(visible);
            }, this);
          } else {
            // restore the last visible child of the group
            this._child.setVisible(visible);
            delete this._child;
          }
        } else {
          this.props.layer.getLayers().forEach(function(child) {
            child.setVisible(visible);
          }, this);
        }
      }
    }
  }
  _download() {
    let layer = this.props.layer;
    let storeType = layer.get('storeType');
    let dl = document.createElement('a');
    document.body.appendChild(dl);
    if (storeType == 'dataStore'){
      let url = AW_ZIPFILE_URL + '/' + layer.get('typename').split(':')[1] + '.zip';
      dl.setAttribute('href', url);
    }else if (storeType == 'coverageStore'){
      let url = 'TMS: ' + layer.getSource().getUrls()[0] +
        '\r\nWMS: ' + SITE_URL + 'djmp/' + layer.get('djmpId') + '/map/service';
      dl.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(url));
    }
    dl.setAttribute('download', layer.get('title'));
    dl.click();
  }
  _modifyLatLonBBOX(bbox) {
    bbox[0] = Math.max(-180, bbox[0]);
    bbox[1] = Math.max(-85, bbox[1]);
    bbox[2] = Math.min(180, bbox[2]);
    bbox[3] = Math.min(85, bbox[3]);
    return bbox;
  }
  _toggleNestedHandler() {
    this.setState({open: !this.state.open});
  }
  _zoomTo() {
    var map = this.props.map;
    var view = map.getView();
    var extent = this.props.layer.get('EX_GeographicBoundingBox');
    if (view.getProjection().getCode() === 'EPSG:3857') {
      this._modifyLatLonBBOX(extent);
    }
    extent = ol.proj.transformExtent(extent, 'EPSG:4326', view.getProjection());
    if (!extent) {
      extent = this.props.layer.getSource().getExtent();
    }
    map.getView().fit(
      extent,
      map.getSize()
    );
  }
  _remove() {
    LayerActions.removeLayer(this.props.layer, this.props.group);
  }
  _changeOpacity(evt, value) {
    this.props.layer.setOpacity(value);
  }
  render() {
    const {connectDragSource, connectDropTarget} = this.props;
    const layer = this.props.layer;
    const source = layer.getSource ? layer.getSource() : undefined;

    let showOpacity = (this.props.showOpacity && source && layer.get('type') !== 'base');
    let allowZoomTo = (layer.get('type') !== 'base' && layer.get('type') !== 'base-group'
      && ((source && source.getExtent) || layer.get('EX_GeographicBoundingBox')) && this.props.showZoomTo);
    let allowDownload = (this.props.showDownload && !(layer instanceof ol.layer.Group));
    let allowRemove = (this.props.allowRemove && layer.get('type') !== 'base' && layer.get('isRemovable')
      && layer.get('act_id') !== undefined);

    let layerTools;

    if (layer.get('type') !== 'base' && layer.get('type') !== 'base-group'){
      layerTools = (<LayerTools
        showOpacity={showOpacity}
        opacity={layer.getOpacity()}
        changeOpacity={this._changeOpacity.bind(this)}
        allowZoomTo={allowZoomTo}
        zoomTo={this._zoomTo.bind(this)}
        allowDownload={allowDownload}
        download={this._download.bind(this)}
        allowRemove={allowRemove}
        remove={this._remove.bind(this)}
        ></LayerTools>)
    }

    let input;
    if (layer.get('type') === 'base') {
      input = (<RadioButton disabled={this.state.disabled} checked={this.state.checked} label={this.props.title} value={this.props.title} onCheck={this._handleChange.bind(this)} disableTouchRipple={true}/>);
    } else if(!layer.get('act_id')){
      input = (<Checkbox style={{'display': 'inline-block', 'width': 'calc(100% - 85px)'}} checked={this.state.checked} label={this.props.title} labelStyle={this.props.layer.get('emptyTitle') ? {fontStyle: 'italic'} : undefined} onCheck={this._handleChange.bind(this)} disableTouchRipple={true}/>);
    } else{
      input = (<div style={{'display': 'inline-block'}}><label style={{'position': 'relative', 'top': '-5px'}}>{this.props.title}</label></div>);
    }

    let legend;
    if (this.props.includeLegend && this.props.layer.getVisible() && ((this.props.layer instanceof ol.layer.Tile && this.props.layer.getSource() instanceof ol.source.TileWMS) ||
      (this.props.layer instanceof ol.layer.Image && this.props.layer.getSource() instanceof ol.source.ImageWMS))) {
      legend = <WMSLegend layer={this.props.layer} />;
    }
    // When the layer is an activation reduce the bottom padding
    let innerDivStyle = this.props.layer.get('act_id') == undefined ? {'paddingTop':'8px','paddingBottom':'0px'} : {'paddingTop':'20px','paddingBottom':'0px'};

    let collapseElement = this.props.collapsible ?
            this.state.open ?
               <IconButton style={{'height': 'auto', 'width': 'auto', 'padding': '0px'}} onTouchTap={this._toggleNestedHandler.bind(this)}><OpenIcon /></IconButton> :
               <IconButton style={{'height': 'auto', 'width': 'auto', 'padding': '0px'}} onTouchTap={this._toggleNestedHandler.bind(this)}><CloseIcon /></IconButton>
            : null;

    return connectDragSource(connectDropTarget(
      <div>
        <ListItem
        className={classNames({'sdk-component': true, 'layer-list-item': true}, this.props.className)}
        innerDivStyle={innerDivStyle}
        autoGenerateNestedIndicator={false}
        primaryText={input ? undefined : this.props.title}
        nestedItems={this.props.nestedItems}
        nestedListStyle={{'marginLeft':'40px'}}
        initiallyOpen={true}
        disableTouchRipple={true}
        open={this.state.open}>
          {collapseElement}
          {input}
          {layerTools}
        </ListItem>
      </div>
    ));
  }
}

LayerListItem.propTypes = {
  connectDragSource: React.PropTypes.func,
  connectDropTarget: React.PropTypes.func,
  moveLayer: React.PropTypes.func,
  index: React.PropTypes.number.isRequired,
  /**
   * The map in which the layer of this item resides.
   */
  map: React.PropTypes.instanceOf(ol.Map).isRequired,
  /**
   * The layer associated with this item.
   */
  layer: React.PropTypes.instanceOf(ol.layer.Base).isRequired,
  /**
   * The group layer to which this item might belong.
   */
  group: React.PropTypes.instanceOf(ol.layer.Group),
  /**
   * The feature format to serialize in for downloads.
   */
  downloadFormat: React.PropTypes.oneOf(['GeoJSON', 'KML', 'GPX']),
  /**
   * The title to show for the layer.
   */
  title: React.PropTypes.string.isRequired,
  /**
   * Should we show a button that can open up the feature table?
   */
  showTable:  React.PropTypes.bool,
  /**
   * Should we show a zoom to button for the layer?
   */
  showZoomTo: React.PropTypes.bool,
  /**
   * Should we show allow reordering?
   */
  allowReordering: React.PropTypes.bool,
  /**
   * Should we allow for filtering of features in a layer?
   */
  allowFiltering: React.PropTypes.bool,
  /**
   * Should we allow for removal of layers?
   */
  allowRemove: React.PropTypes.bool,
  /**
   * Should we allow editing of features in a vector layer?
   */
  allowEditing: React.PropTypes.bool,
  /**
   * Should we allow for labeling of features in a layer?
   */
  allowLabeling: React.PropTypes.bool,
  /**
   * Should we allow for styling of features in a vector layer?
   */
  allowStyling: React.PropTypes.bool,
  /**
   * Should we show a download button?
   */
  showDownload: React.PropTypes.bool,
  /**
   * Should we include the legend in the layer list?
   */
  includeLegend: React.PropTypes.bool,
  /**
   * The nested items to show for this item.
   */
  nestedItems: React.PropTypes.array,
  /**
   * Should we show an opacity slider for the layer?
   */
  showOpacity: React.PropTypes.bool,
  /**
   * Called when a modal is opened by this layer list item.
   */
  onModalOpen: React.PropTypes.func,
  /**
   * Called when a modal is closed by this layer list item.
   */
  onModalClose: React.PropTypes.func,
  /**
   * Css class name to apply on the root element of this component.
   */
  className: React.PropTypes.string,
  /**
   * i18n message strings. Provided through the application through context.
   */
  intl: intlShape.isRequired,
  /**
   * When collapsible should show content?
   */
  open: React.PropTypes.bool.isRequired,
  /**
   * is collapsible?
   */
   collapsible: React.PropTypes.bool.isRequired
};

LayerListItem.defaultProps = {
  connectDragSource: function(a) {
    return a;
  },
  connectDropTarget: function(a) {
    return a;
  }
};

LayerListItem.childContextTypes = {
  muiTheme: React.PropTypes.object.isRequired
};

export default injectIntl(DropTarget('layerlistitem', layerListItemTarget, collectDrop)(DragSource('layerlistitem', layerListItemSource, collect)(LayerListItem)));
