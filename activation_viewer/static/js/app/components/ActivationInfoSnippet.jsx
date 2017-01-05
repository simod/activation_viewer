import ReactDOM from 'react-dom';
import React, {Component, PropTypes} from 'react';
import {Table, TableBody, TableHeader, TableHeaderColumn, TableRow, TableRowColumn} from 'material-ui/Table';


export default class ActivationInfoSnippet extends Component{
  render(){
    let activation = this.props.activation;
    let date = new Date(activation.event_time)
    return (

      <Table selectable={false} wrapperStyle={{maxWidth: '500px', float: 'left', marginRight: '8px'}}>
        <TableHeader displaySelectAll={false}>
          <TableRow>
            <TableHeaderColumn colSpan="2" style={{textAlign: 'center'}}>
              {activation.activation_id} - {activation.disaster_type.name} in {activation.region.name}
            </TableHeaderColumn>
          </TableRow>
        </TableHeader>
        <TableBody displayRowCheckbox={false}>
          <TableRow>
            <TableRowColumn style={{width: '100px'}}>Event time</TableRowColumn>
            <TableRowColumn>{date.toString()}</TableRowColumn>
          </TableRow>
        </TableBody>
      </Table>

    )
  }
}

ActivationInfoSnippet.propTypes = {
  /**
   * Style for the button.
   */
  activation: React.PropTypes.object.isRequired
}