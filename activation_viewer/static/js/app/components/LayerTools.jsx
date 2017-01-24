import React from 'react';
import ReactDOM from 'react-dom';
import IconButton from 'material-ui/IconButton';
import DownloadIcon from 'material-ui/svg-icons/file/file-download';
import ZoomInIcon from 'material-ui/svg-icons/action/zoom-in';
import DeleteIcon from 'material-ui/svg-icons/action/delete';
import Popover from 'material-ui/Popover/Popover';
import Slider from 'material-ui/Slider';
import FlatButton from 'material-ui/FlatButton';
import ActionSettings from 'material-ui/svg-icons/action/settings'

export default class LayerTools extends React.Component{
  constructor(props) {
    super(props);
    this.state = {
      open: false,
    };
  }

  handleTouchTap(event) {
    // This prevents ghost click.
    event.preventDefault();

    this.setState({
      open: true,
      anchorEl: event.currentTarget,
    });
  }

  handleRequestClose() {
    this.setState({
      open: false,
    });
  }

  render() {
    const iconStyle = {'paddingTop':'0px', 'paddingBottom':'0px', 'height': 'auto'};
    const tooltipStyle = {'top':'22px'};
    let opacity;
    if (this.props.showOpacity){
      opacity = (<Slider
        style={{width: '150px', marginLeft:'10px', marginRight: '10px'}}
        defaultValue={this.props.opacity}
        onChange={this.props.changeOpacity}
        sliderStyle={{margin: '0px'}} />);
    }
    let zoomTo;
    if (this.props.allowZoomTo){
      zoomTo = (<IconButton
      className='layer-list-item-zoom'
      style={iconStyle}
      onTouchTap={this.props.zoomTo}
      tooltipPosition={'top-left'}
      tooltipStyles={tooltipStyle}
      disableTouchRipple={true}><ZoomInIcon /></IconButton>);
    }
    let download;
    if (this.props.allowDownload) {
      download = (<IconButton
        className='layer-list-item-download'
        style={iconStyle}
        onTouchTap={this.props.download}
        tooltipPosition={'top-left'}
        tooltipStyles={tooltipStyle}
        disableTouchRipple={true}><DownloadIcon /></IconButton>);
    }
    let remove;
    if (this.props.allowRemove){
      remove = (<IconButton
        style={iconStyle}
        className='layer-list-item-remove'
        onTouchTap={this.props.remove}
        tooltipPosition={'top-left'}
        tooltipStyles={tooltipStyle}
        disableTouchRipple={true}><DeleteIcon /></IconButton>);
    }

    return (
      <span className='layer-tools'>
        <FlatButton
          onTouchTap={this.handleTouchTap.bind(this)}
          icon={<ActionSettings />}
          style={{minWidth: 'auto', paddingTop: '0px', height: 'auto', lineHeight: 'auto'}}
          hoverColor={''}
        />
        <Popover
          open={this.state.open}
          anchorEl={this.state.anchorEl}
          anchorOrigin={{horizontal: 'left', vertical: 'bottom'}}
          targetOrigin={{horizontal: 'left', vertical: 'top'}}
          onRequestClose={this.handleRequestClose.bind(this)}
          className={'layer-tools-content'}
        >
          {zoomTo}
          {download}
          {remove}
          {opacity}
        </Popover>
      </span>
    )
  }
}

LayerTools.propTypes = {
  allowZoomTo: React.PropTypes.bool,
  showOpacity: React.PropTypes.bool,
  allowRemove: React.PropTypes.bool,
  allowDownload: React.PropTypes.bool,
  download: React.PropTypes.func,
  remove: React.PropTypes.func,
  zoomTo: React.PropTypes.func,
  opacity: React.PropTypes.number,
  changeOpacity: React.PropTypes.func
}

LayerTools.defaultProps = {
  allowZoomTo: false,
  showOpacity: false,
  allowRemove: false,
  allowDownload: false
};
