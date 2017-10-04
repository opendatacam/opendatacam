import React, { Component } from 'react';

class MaskItem extends Component {

  render() {
    return (
      <rect
        x={mask.x}
        y={mask.y}
        stroke="#000000"
        strokeMiterlimit="10"
        width={mask.w}
        height={mask.h}
      ></rect>
    );
  }
}

export default MaskItem;
