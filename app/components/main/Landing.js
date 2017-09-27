import React from 'react'

import NoSSR from 'react-no-ssr';

import Video from '../shared/Video'; 
import Canvas from '../shared/Canvas'; 
import SplashScreen from '../shared/SplashScreen'; 

class Landing extends React.Component {

  constructor(props) {
    super(props);
  }

  render () {
    return (
      <div>
        <NoSSR onSSR={<SplashScreen />}>
          <Video key="video" />
          <Canvas key="canvas" />
        </NoSSR>
      </div>
    )
  }
}

export default Landing
