import React from 'react'

import Video from '../shared/Video'; 
import Canvas from '../shared/Canvas'; 

class Landing extends React.Component {

  constructor(props) {
    super(props);
  }

  render () {
    return (
      <div className="landing-page">
        <Video />
        <Canvas />
      </div>
    )
  }
}

export default Landing
