import ReactDOM from 'react-dom';
import ReactTransitionGroup from 'react-addons-transition-group';
import ReactCSSTransitionGroup from 'react-addons-css-transition-group';
import React, {Component, PropTypes} from 'react';
import classNames from 'classnames';
import FlatButton from 'material-ui/FlatButton';
import CustomTheme from '../theme';
import ActivationStore from '../stores/ActivationStore'
import ActivationInfoSnippet from './ActivationInfoSnippet.jsx'

class ActInfo extends Component {

  constructor(){
    super();
    this.state = {
      activations: []
    }
  }

  componentWillUnmount(){
    ActivationStore.removeChangeListener(this._onChangeCb);
  }

  componentWillMount(){
    this._onChangeCb = this._onChange.bind(this);
    ActivationStore.addChangeListener(this._onChangeCb);
    this._onChange();
  }

  _onChange() {
    this.setState({activations: ActivationStore.getActivations()});
  }

  render(){
    return (
      <div id={'infoPanelContent'}>
        {this.state.activations.map((activation) => (
          <ActivationInfoSnippet key={activation.activation_id} activation={activation} />
        ))}
      </div>
    )
  }
}


export default class ActInfoPanel extends Component {

  constructor(props){
    super(props);
    this.state = {
      show: false
    }
  }

  _togglePanel(){
    this.setState({show: !this.state.show});
  }

  render(){
    return (
      <div id={'actInfoPanel'}>
        <FlatButton
          id={'openInfoPanel'}
          primary={true} 
          label={'Toggle Info'}
          onTouchTap={this._togglePanel.bind(this)} 
          labelStyle={{color: CustomTheme.palette.textColor}}
          style={{
            borderTop: '1px solid #BDBDBD',
            borderLeft: '1px solid #BDBDBD',
            borderRight: '1px solid #BDBDBD',
            borderRadius: '3px 3px 0 0',
          }}
          rippleColor={'#faa73f'}
        />
        <ReactCSSTransitionGroup
          transitionName="infoPanelContent"
          transitionEnterTimeout={500}
          transitionLeaveTimeout={300}>
          {this.state.show ? <ActInfo /> : null}
        </ReactCSSTransitionGroup>
      </div>
    )
  }
}
