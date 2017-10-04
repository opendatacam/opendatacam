import React from 'react';

import Video from '../shared/Video'; 
import Canvas from '../shared/Canvas'; 
import Mask from '../shared/Mask'; 
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
    // TODO ADD <Mask /> component that handles the masking
    // TODO ADD click recorder manager
    return (
      <div className="landing-page">
        <LinkItem link="/" label="Go to home" />
        <Title label="Beat the traffic !" />
        <SettingsControl />
        <Mask />
        <Video />
        <Canvas />
      </div>
    )
  }
}

export default GamePage;
