import ReactDOM from 'react-dom';
import React, {Component, PropTypes} from 'react';
import {Table, TableBody, TableHeader, TableHeaderColumn, TableRow, TableRowColumn} from 'material-ui/Table';


export default class ActivationInfoSnippet extends Component{
  render(){
    let activation = this.props.activation;
    let event_time = new Date(activation.event_time);
    let activation_time = new Date(activation.activation_time);

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
            <TableRowColumn>{event_time.toString()}</TableRowColumn>
          </TableRow>
          <TableRow>
            <TableRowColumn style={{width: '100px'}}>Activation time</TableRowColumn>
            <TableRowColumn>{activation_time.toString()}</TableRowColumn>
          </TableRow>
          <TableRow>
            <TableRowColumn style={{width: '100px'}}>Glide number</TableRowColumn>
            <TableRowColumn>{activation.glide_number == '' ? 'Not available' : activation.glide_number}</TableRowColumn>
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