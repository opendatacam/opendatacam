import React from 'react'

import Video from '../shared/Video'; 
import Canvas from '../shared/Canvas'; 

class Landing extends React.Component {

  constructor(props) {
    super(props);
  }

  render () {
    return [
      <Video key="video" />,
      <Canvas key="canvas" />
    ]
  }
}

export default Landing
