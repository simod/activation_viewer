import React from 'react';
import {GridList} from 'material-ui/GridList';
import GridTile from './ActivationSnippet.jsx';
import util from 'boundless-sdk/util';
import ol from 'openlayers';

const styles = {
  root: {
    display: 'flex',
    flexWrap: 'wrap',
    justifyContent: 'space-around',
  },
  gridList: {
    width: '100%',
    height: 450,
    overflowY: 'auto',
  },
};

export default class LatestActivations extends React.Component {
  constructor(props){
    super(props);
    this.state = {
      'activations': []
    }
  }
  componentDidMount(){
    var self = this;
    util.doGET(ACTIVATIONS_API, function(xmlhttp){
      self.setState({
        'activations': JSON.parse(xmlhttp.response).objects
      });
    });
  }
  
  render() {
    let selectInteraction = null;
    this.props.map.getInteractions().forEach(interaction => {
      if (interaction instanceof ol.interaction.Select){
        selectInteraction =  interaction; 
      }
    });
    
    return (
      <div id="latest_activations" style={styles.root}>
        <GridList
          cellHeight={180}
          cols={4}
          padding={20}
          style={styles.gridList}
        >
          {this.state.activations.map((activation) => (
            <GridTile
              key={activation.activation_id}
              activation={activation}
              map={this.props.map}
              interaction={selectInteraction}
            > 
            <img src={activation.thumbnail_url} />
            </GridTile>
          ))}
        </GridList>
      </div>
    )
  }
}
