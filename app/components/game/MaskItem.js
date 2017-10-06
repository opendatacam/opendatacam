import React, { Component } from 'react';

class MaskItem extends Component {

  render() {
    return (
      <rect
        x={this.props.mask.x}
        y={this.props.mask.y}
        stroke="#000000"
        strokeMiterlimit="10"
        width={this.props.mask.w}
        height={this.props.mask.h}
      ></rect>
    );
  }
}

export default MaskItem;
