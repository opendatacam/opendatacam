import React from 'react'
import NoSSR from 'react-no-ssr';
import Video from '../shared/Video'; 
import Canvas from '../shared/Canvas'; 
import SettingsControl from '../shared/SettingsControl';

class Landing extends React.Component {

  constructor(props) {
    super(props);
  }

  render () {
    return (
      <div className="landing-page">
        <SettingsControl />
        <Video />
        <Canvas />
      </div>
    )
  }
}

export default Landing
