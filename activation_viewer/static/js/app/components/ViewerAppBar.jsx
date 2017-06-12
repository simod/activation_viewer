import AppBar from 'material-ui/AppBar';
import {Tabs, Tab} from 'material-ui/Tabs';
import React from 'react';


export default class ViewerAppBar extends React.Component{
  componentWillMount() {
    this.setState({
      'activeTab': this.props.page
    });
  }
  onChange(value) {
    window.location = value;
  }
  render() {
    const appBarMenu = (
      <Tabs inkBarStyle={{'backgroundColor': 'rgba(255, 166, 77, 1)'}} className={'appBarMenu'} value={this.state.activeTab}
          onChange={this.onChange}>
        <Tab label='Activations' value={'/'} className={'appBarTab'}>
        </Tab>
        <Tab label='Map Composer' value={'composer'} className={'appBarTab'}>
        </Tab>
        {/* <Tab label='Maps' value={'maps'} className={'appBarTab'} href='/maps'>
         </Tab>*/}
      </Tabs>
    );
    return (
      <AppBar className={'appBar'}
          title='Copernicus EMS Mapping - Activation Viewer'
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
