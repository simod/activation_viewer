import React, {Component, PropTypes} from 'react';
import FlatButton from 'material-ui/FlatButton';
import ol from 'openlayers';
import Popover from 'material-ui/Popover';
import AppConfig from '../constants/AppConfig.js';

var featureSelectedColors = {
  fill: 'rgba(250, 167, 63, 0.6)',
  stroke: 'rgba(250, 167, 63, 0.3)'
}

var featureDeselectedColors = {
  fill: 'rgba(250, 167, 63, 0.4)',
  stroke: 'rgba(250, 167, 63, 0.1)'
}

function getFeatureStyle(lable, selected){
  return new ol.style.Style({
    fill: new ol.style.Fill({
      color: selected ? featureSelectedColors.fill : featureDeselectedColors.fill
    }),
    stroke: new ol.style.Stroke({
      color: selected ? featureSelectedColors.stroke : featureDeselectedColors.stroke,
      width: 2,
      lineJoin: 'round'
    }),
    text: new ol.style.Text({
      text: lable,
      fill: new ol.style.Fill({
        color: '#989898'
      }),
      font: '12px sans-serif'
    })
  })
}

function getStyles(props, context) {
  const {
    baseTheme,
    gridTile,
  } = context.muiTheme;

  const actionPos = props.actionIcon && props.actionPosition;

  const styles = {
    root: {
      position: 'relative',
      display: 'block',
      height: '200px',
      width: '324px',
      overflow: 'hidden',
    },
    titleBar: {
      position: 'absolute',
      left: 0,
      right: 0,
      [props.titlePosition]: 0,
      height: props.subtitle ? 68 : 48,
      background: props.titleBackground,
      display: 'flex',
      alignItems: 'center',
    },
    titleWrap: {
      flexGrow: 1,
      marginLeft: actionPos !== 'left' ? baseTheme.spacing.desktopGutterLess : 0,
      marginRight: actionPos === 'left' ? baseTheme.spacing.desktopGutterLess : 0,
      color: gridTile.textColor,
      overflow: 'hidden',
    },
    title: {
      fontSize: '16px',
      textOverflow: 'ellipsis',
      overflow: 'hidden',
      whiteSpace: 'nowrap',
    },
    subtitle: {
      fontSize: '12px',
      textOverflow: 'ellipsis',
      overflow: 'hidden',
      whiteSpace: 'nowrap',
    },
    actionIcon: {
      order: actionPos === 'left' ? -1 : 1,
    },
    childImg: {
      height: '100%',
      transform: 'translateX(-50%)',
      position: 'relative',
      left: '50%',
    },
    viewerButton: {
      position: 'absolute',
      top: 0,
      right: 0,
      background: props.titleBackground,
      display: 'flex',
      alignItems: 'center',
    },
    viewerButtonLabel: {
      fontSize: '11px',
      padding: 0,
      color: 'white'
    }
  };
  return styles;
}


class ActSnippet extends Component {
  constructor(props){
    super();
    this.onMouseEnterHandler = this.onMouseEnterHandler.bind(this);
    this.onMouseLeaveHandler = this.onMouseLeaveHandler.bind(this);
    this.state = {
      selectClass: ''
    };
  }

  _onInteractionSelect(e){
    let thisFeature = this.state.layer.getSource().getFeatures()[0];
    if (e.selected[0] == thisFeature){
      this._selectComponent();
    }else if(e.deselected[0] == thisFeature){
      this._deselectComponent();
    }
  }

  componentDidMount() {
    this.ensureImageCover();
    this._addBBoxToMap();
    this.props.interaction.on('select', this._onInteractionSelect, this);
  }

  componentWillUnmount(){
    this.props.interaction.un('select', this._onInteractionSelect, this);
    this._removeBboxFromMap();
  }

  onMouseEnterHandler(){
    let features = this.props.interaction.getFeatures();
    let thisFeature = this.state.layer.getSource().getFeatures()[0];
    let self = this;
    if (features.getLength() == 0){
      features.push(thisFeature);
    }else{
      features.forEach(feature => {
        let matched = false;
        if (feature == thisFeature){
          matched = true;
        }
        if (!matched){
          features.push(thisFeature);
        }
      });
    }
    this._selectComponent();
    let view = this.props.map.getView();

    let viewExtent = view.calculateExtent(this.props.map.getSize());
    let layerExtent = this._getActivationGeometry().getExtent();

    if (ol.extent.containsExtent(viewExtent, layerExtent)){

      view.fit(this._getActivationGeometry(), 
        this.props.map.getSize(), 
        {
          maxZoom: 10, 
          center: ol.extent.getCenter(self._getActivationGeometry().getExtent()),
          duration: 300
        }
      );

    }else{

      view.animate({
        zoom: 3,
        duration: 500
      });

      setTimeout(function(){
        view.animate({
          duration: 800, 
          center: ol.extent.getCenter(layerExtent)
        });
      }, 100);

      setTimeout(function(){
        view.animate({
          zoom: 7,
          duration: 500
        });
      }, 700);
    }
  }

  onMouseLeaveHandler(){
    let features = this.props.interaction.getFeatures();
    let thisFeature = this.state.layer.getSource().getFeatures()[0];
    features.forEach(feature => {
      if (feature == thisFeature){
        features.remove(feature);
      }
    });
    this._deselectComponent();
  }

  _selectComponent(){
    let thisFeature = this.state.layer.getSource().getFeatures()[0];
    this.setState({
      selectClass: 'act_snippet_selected'
    });
    thisFeature.setStyle(getFeatureStyle(this.props.activation.activation_id, true));
  }

  _deselectComponent(){
    let thisFeature = this.state.layer.getSource().getFeatures()[0];
    this.setState({
      selectClass: ''
    });
    thisFeature.setStyle(getFeatureStyle(this.props.activation.activation_id, false));
  }

  _getActivationGeometry(){
    let bbox = [
      parseFloat(this.props.activation.bbox_x0),
      parseFloat(this.props.activation.bbox_y0),
      parseFloat(this.props.activation.bbox_x1),
      parseFloat(this.props.activation.bbox_y1)
    ];
    let geometry = ol.geom.Polygon.fromExtent(bbox);
    geometry.transform('EPSG:4326', 'EPSG:3857');
    return geometry;
  }

  _addBBoxToMap(){
    var layer = this._buildOlBoxOverlay(this._getActivationGeometry(), this.props.activation.activation_id);
    this.props.map.addLayer(layer);
    this.setState({
      layer: layer
    });
  }

  _removeBboxFromMap(){
    this.props.map.removeLayer(this.state.layer);
  }

  _buildOlBoxOverlay(geometry, lable){
    return new ol.layer.Vector({
      source: new ol.source.Vector({
        features: [new ol.Feature({
          geometry: geometry
        })]
      }),
      style: getFeatureStyle(lable, false)
    });
  }

  componentDidUpdate() {
    this.ensureImageCover();
  }

  ensureImageCover() {
    let imgEl = this.refs.img;

    if (imgEl) {
      const fit = () => {
        if (imgEl.offsetWidth < imgEl.parentNode.offsetWidth) {
          const {isRtl} = this.context.muiTheme;
          imgEl.style.height = 'auto';
          if (isRtl) {
            imgEl.style.right = '0';
          } else {
            imgEl.style.left = '0';
          }
          imgEl.style.width = '100%';
          imgEl.style.top = '50%';
          imgEl.style.transform = imgEl.style.WebkitTransform = 'translateY(-50%)';
        }
        imgEl.removeEventListener('load', fit);
        imgEl = null; // prevent closure memory leak
      };
      if (imgEl.complete) {
        fit();
      } else {
        imgEl.addEventListener('load', fit);
      }
    }
  }

  render() {
    const {
      title,
      subtitle,
      titlePosition, // eslint-disable-line no-unused-vars
      titleBackground, // eslint-disable-line no-unused-vars
      actionIcon, // eslint-disable-line no-unused-vars
      actionPosition, // eslint-disable-line no-unused-vars
      style,
      children,
      containerElement,
      viewerButton,
      map,
      activation,
      interaction,
      ...other,
    } = this.props;

    const {prepareStyles} = this.context.muiTheme;
    const styles = getStyles(this.props, this.context);
    const mergedRootStyles = Object.assign(styles.root, style);


    let titleBar = (
      <div key="titlebar" className={'snippetTitle'} style={prepareStyles(styles.titleBar)} onClick={function(){window.location=AppConfig.COMPOSER_URL + '#' + activation.activation_id}}>
        <div style={prepareStyles(styles.titleWrap)}>
          <div style={prepareStyles(styles.title)}>{this.props.activation.activation_id}</div>
          <div style={prepareStyles(styles.subtitle)}>
          {this.props.activation.disaster_type.name} in {this.props.activation.region.name}
          </div>
        </div>
        {actionIcon ? (<div style={prepareStyles(styles.actionIcon)}>{actionIcon}</div>) : null}
      </div>
    );

    let viewerButtonContainer = null;
    if (viewerButton){
      viewerButtonContainer = (
        <div key="viewerButtonContainer" id='viewerButton' style={prepareStyles(styles.viewerButton)}>
          <FlatButton
            labelStyle={styles.viewerButtonLabel}
            label="Open map"
            href={AppConfig.COMPOSER_URL + '#' + activation.activation_id} />
        </div>
        )
    }

    let newChildren = children;

    // if there is a single image passed as children
    // clone it and add our styles
    if (React.Children.count(children) === 1) {
      newChildren = React.Children.map(children, (child) => {
        if (child.type === 'img') {
          return React.cloneElement(child, {
            key: 'img',
            ref: 'img',
            style: prepareStyles(Object.assign({}, styles.childImg, child.props.style)),
          });
        } else {
          return child;
        }
      });
    }

    const containerProps = {
      style: prepareStyles(mergedRootStyles),
      onMouseEnter: this.onMouseEnterHandler,
      onMouseLeave: this.onMouseLeaveHandler,
      className: this.state.selectClass,
      ...other,
    };

    return React.isValidElement(containerElement) ?
      React.cloneElement(containerElement, containerProps, [newChildren, titleBar, viewerButtonContainer]) :
      React.createElement(containerElement, containerProps, [newChildren, titleBar, viewerButtonContainer]);
  }
}

ActSnippet.propTypes = {
  /**
   * An IconButton element to be used as secondary action target
   * (primary action target is the tile itself).
   */
  actionIcon: PropTypes.element,
  /**
   * Position of secondary action IconButton.
   */
  actionPosition: PropTypes.oneOf(['left', 'right']),
  /**
   * Theoretically you can pass any node as children, but the main use case is to pass an img,
   * in whichcase ActSnippet takes care of making the image "cover" available space
   * (similar to background-size: cover or to object-fit:cover).
   */
  children: PropTypes.node,
  /**
   * Width of the tile in number of grid cells.
   */
  cols: PropTypes.number,
  /**
   * Either a string used as tag name for the tile root element, or a ReactElement.
   * This is useful when you have, for example, a custom implementation of
   * a navigation link (that knows about your routes) and you want to use it as the primary tile action.
   * In case you pass a ReactElement, please ensure that it passes all props,
   * accepts styles overrides and render it's children.
   */
  containerElement: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.element,
  ]),
  /**
   * Height of the tile in number of grid cells.
   */
  rows: PropTypes.number,
  /**
   * Override the inline-styles of the root element.
   */
  style: PropTypes.object,
  /**
   * String or element serving as subtitle (support text).
   */
  subtitle: PropTypes.node,
  /**
   * Title to be displayed on tile.
   */
  title: PropTypes.node,
  /**
   * Style used for title bar background.
   * Useful for setting custom gradients for example
   */
  titleBackground: PropTypes.string,
  /**
   * Position of the title bar (container of title, subtitle and action icon).
   */
  titlePosition: PropTypes.oneOf(['top', 'bottom']),

  viewerButton: PropTypes.bool,

  map: PropTypes.instanceOf(ol.Map),

  activation: PropTypes.object,

  interaction: PropTypes.instanceOf(ol.interaction.Select),

};

ActSnippet.defaultProps = {
  titlePosition: 'bottom',
  titleBackground: 'rgba(0, 0, 0, 0.4)',
  actionPosition: 'right',
  cols: 1,
  rows: 1,
  containerElement: 'div',
  viewerButton: true,
};

ActSnippet.contextTypes = {
  muiTheme: PropTypes.object.isRequired,
};

export default ActSnippet;