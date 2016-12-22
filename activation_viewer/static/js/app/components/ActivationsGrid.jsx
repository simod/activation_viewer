import React from 'react';
import {GridList} from 'material-ui/GridList';
import GridTile from './ActivationSnippet.jsx';
import ol from 'openlayers';
import 'whatwg-fetch';
import queryString from 'query-string';
import TextField from 'material-ui/TextField';

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
      'activations': [],
      'query': {}
    }
  }

  _prepareQueryString(){
    for (let param in this.state.query){
      if(this.state.query[param] == ''){
        delete this.state.query[param];
      }
    }
    return queryString.stringify(this.state.query);
  }

  _doQuery(){
    let self = this;
    let query_string = this._prepareQueryString();
    let url = query_string === '' ? ACTIVATIONS_API : ACTIVATIONS_API + '?' + query_string;
    fetch(url,{
      credentials: 'same-origin'
    })
    .then(function(response){
      return response.json();
    })
    .then(function(json){
      self.setState({
        'activations': json.objects
      });
    });
  }

  componentWillMount(){
    this._onSearch = this._onSearch.bind(this);
  }

  componentDidMount(){
    this._doQuery();
  }

  componentDidUpdate(prevProps, prevState){
    if(JSON.stringify(prevState.query) != JSON.stringify(this.state.query)){
      this._doQuery();
    }
  }

  _onSearch(event){
    this.setState({
      query: {
        q: event.target.value
      }
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
      <TextField
          id="search-activations"
          hintText="Search"
          floatingLabelText="Search"
          onChange={this._onSearch}
        />
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
  )}
}
