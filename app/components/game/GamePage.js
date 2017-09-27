import React from 'react';

import Video from '../shared/Video'; 
import Canvas from '../shared/Canvas'; 
import SettingsControl from '../shared/SettingsControl';

import Title from '../shared/Title';
import LinkItem from '../shared/LinkItem';

import { updateSettings } from '../../statemanagement/app/SettingsStateManagement';

class GamePage extends React.Component {

  constructor(props) {
    super(props);
    props.dispatch(updateSettings({ showDebugUI: false }));
  }

  render () {
    return (
      <div className="landing-page">
        <LinkItem link="/" label="Go to home" />
        <Title label="Beat the traffic !" />
        <SettingsControl />
        <Video />
        <Canvas />
      </div>
    )
  }
}

export default GamePage;
