import AppBar from 'material-ui/AppBar';
import {Tabs, Tab} from 'material-ui/Tabs';
import React from 'react';

export default class ViewerAppBar extends React.Component{
  componentWillMount() {
    this.setState({
      'activeTab': this.props.page
    });
  }
  render() {
    const appBarMenu = (
      <Tabs className={'appBarMenu'} value={this.state.activeTab}>
        <Tab label='Activations' value={'activations'} className={'appBarTab'} href='/activations'>
        </Tab>
        <Tab label='Maps' value={'maps'} className={'appBarTab'} href='/maps'>
        </Tab>
        <Tab label='Map Composer' value={'composer'} className={'appBarTab'} href='/composer'>
        </Tab>
      </Tabs>
    );
    return (
      <AppBar className={'appBar'} 
          title='Copernicus EMS Activation Viewer' 
          onTitleTouchTap={() => window.location = '/'}
          showMenuIconButton={false}
          children={appBarMenu} />
    );
  }
}


ViewerAppBar.propTypes = {
  /**
   * i18n message strings. Provided through the application through context.
   */
  page: React.PropTypes.string
};

ViewerAppBar.defaultProps = {
  page: undefined
};
