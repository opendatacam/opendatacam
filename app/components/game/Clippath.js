import React, { Component } from 'react';

import MaskItem from './MaskItem';

class Clippath extends Component {

  render() {
    return (
      <clipPath id="svgPath">
        {this.props.masks.map((mask) =>
          <MaskItem 
            key={mask.id} 
            mask={mask}
          />
        )}
      </clipPath>
    );
  }
}

export default Clippath;
