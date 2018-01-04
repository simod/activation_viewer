import React from 'react';
import Dialog from 'material-ui/Dialog';
import {defineMessages, injectIntl, intlShape} from 'react-intl';
import classNames from 'classnames';
import pureRender from 'pure-render-decorator';
import FlatButton from 'material-ui/FlatButton';
import TextField from 'material-ui/TextField';
import util from 'boundless-sdk/util';
import {List, ListItem} from 'material-ui/List';
import Checkbox from 'material-ui/Checkbox';
import FolderIcon from 'material-ui/svg-icons/file/folder-open';
import Subheader from 'material-ui/Subheader';
import CustomTheme from '../theme';


const map_types = [{
  name: 'Reference',
  key: 'REF'},
  {name: 'Delineation',
  key: 'DEL'},
  {name: 'Grading',
  key: 'GRA'}];


const layer_types = [{
  name: 'Facilities',
  key: 'facilities'
},{
  name: 'Hydrography',
  key: 'hydrography'
},{
  name: 'Transportation',
  key: 'transportation'
},{
  name: 'Physiography',
  key: 'physiography'
},{
  name: 'Built up',
  key: 'built_up'
},{
  name: 'Settlements',
  key: 'settlements'
},{
  name: 'Utilities',
  key: 'utilities'
},{
  name: 'General Information',
  key: 'general_information'
}];


@pureRender
class DownloadLayersModal extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      sources: this.props.sources,
      filter: null,
      open: false,
      error: false
    }
  }
  _getCaps() {
    var url = this.state.sources.list;
    var filter = this.state.filter || '';
    url = url + '?q=' + filter;
    var self = this;
    const {formatMessage} = this.props.intl;
    var failureCb = function(xmlhttp) {
      delete self._request;
      if (xmlhttp.status === 0) {
        self._setError(formatMessage(messages.corserror));
      } else {
        self._setError(xmlhttp.status + ' ' + xmlhttp.statusText);
      }
    };
    var successCb = function(xmlhttp) {
      delete self._request;
      self.setState({actInfo: JSON.parse(xmlhttp.response)});
    };
    self._request = util.doGET(url, successCb, failureCb);
  }

  _onFilterChange(proxy, value) {
    this.setState({filter: value});
  }

  componentDidUpdate(prevProps, prevState){
    if(JSON.stringify(prevState.filter) != JSON.stringify(this.state.filter)){
      this._getCaps();
    }
  }

  _setError(msg) {
    this.setState({
      errorOpen: true,
      error: true,
      actInfo: null,
      msg: msg
    });
  }

  close() {
    this.setState({open: false});
  }

  open() {
    this._getCaps();
    this.setState({open: true});
    this.query = {
      activations: [],
      map_types: [],
      layer_types: []
    };
  }

  _onCheck(obj_type, obj_id, proxy, checked) {
    if (checked) {
      this.query[obj_type].push(obj_id);
    } else {
      this.query[obj_type] = this.query[obj_type].filter(e => e!=obj_id);
    }
  }

  download() {
    let self = this;
    let url = '/activations/download?query=' + JSON.stringify(this.query);
    util.doGET(url,
    function(xmlhttp){
      let dl = document.createElement('a');
      dl.setAttribute('href', url);
      dl.setAttribute('download', 'EMS_activations_layers.zip');
      dl.click();
    },
    function(xmlhttp){
      self.props.showError(xmlhttp.responseText);
    });
  }

  getActivationMarkup(actInfo) {
    var activations;
    if (actInfo.objects){
      activations = actInfo.objects.map(activation => {
        return (
          <ListItem
            style={{float: 'left', padding: '16px 16px 16px 50px'}}
            leftCheckbox={<Checkbox onCheck={this._onCheck.bind(this, 'activations', activation.activation_id)} />}
            key={activation.activation_id}
            primaryText={
              <div className='layer-title-empty'>{activation.activation_id} - {activation.disaster_type.name} in {activation.region.name}</div>
            }/>
        );
      });
    }
    return activations;
  }


  getMapTypeList() {
    return map_types.map(type => {
      return (
        <ListItem
          style={{float: 'left', padding: '16px 16px 16px 50px'}}
          leftCheckbox={<Checkbox onCheck={this._onCheck.bind(this, 'map_types', type.key)} />}
          key={type.key}
          primaryText={
            <div className='layer-title-empty'>{type.name}</div>
          }/>
      );
    });
  }

  getLayersList() {
    return layer_types.map(type => {
      return (
        <ListItem
          style={{float: 'left', padding: '16px 16px 16px 50px'}}
          leftCheckbox={<Checkbox onCheck={this._onCheck.bind(this, 'layer_types', type.key)} />}
          key={type.key}
          primaryText={
            <div className='layer-title-empty'>{type.name}</div>
          }/>
      );
    });
  }

  render() {

    let activations;
    if (this.state.actInfo) {
      activations = this.getActivationMarkup(this.state.actInfo);
    }
    let map_types = this.getMapTypeList();
    let layer_types = this.getLayersList();

    let actions = [
      <FlatButton
        primary={true}
        label={'Download'}
        onTouchTap={this.download.bind(this)}
        labelStyle={{color: CustomTheme.palette.textColor}}
      />,
      <FlatButton
        label={'Close'}
        onTouchTap={this.close.bind(this)}
        labelStyle={{color: CustomTheme.palette.secondaryTextColor}}
      />
    ];
    return (
      <Dialog
        className={classNames('sdk-component download-layer-modal', this.props.className)}
        actions={actions}
        autoScrollBodyContent={true}
        modal={true}
        title={'Download layers'}
        open={this.state.open}
        onRequestClose={this.close.bind(this)}>
        <TextField
          floatingLabelText={'Filter activations'}
          floatingLabelStyle={{color: CustomTheme.palette.primary3Color}}
          onChange={this._onFilterChange.bind(this)}
        />
        <List>
        <Subheader style={{float: 'left'}}>Select activations</Subheader>
        {activations}
        <Subheader style={{float: 'left'}}>Filter by map type</Subheader>
        {map_types}
        <Subheader style={{float: 'left'}}>Filter by layer type</Subheader>
        <ListItem
          style={{float: 'left', padding: '16px 16px 16px 50px', marginRight: '500px'}}
          leftCheckbox={<Checkbox onCheck={this._onCheck.bind(this, 'layer_types', 'observed_event')} />}
          key='observed_event'
          primaryText={
            <div className='layer-title-empty'>Crisis information</div>
          }/>
        {layer_types}
        </List>
      </Dialog>
    );
  }
}

DownloadLayersModal.propTypes = {
  className: React.PropTypes.string,
  intl: intlShape.isRequired,
  sources: React.PropTypes.shape({
    list: React.PropTypes.string.isRequired,
    full: React.PropTypes.string.isRequired
  }),
  showError: React.PropTypes.func,
}

DownloadLayersModal.childContextTypes = {
  muiTheme: React.PropTypes.object.isRequired
};

export default injectIntl(DownloadLayersModal, {withRef: true});
