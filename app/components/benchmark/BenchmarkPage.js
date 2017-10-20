import React from 'react';
import { connect } from 'react-redux';

import Video from '../shared/Video'; 
import Loading from '../shared/Loading'; 
import Canvas from '../shared/Canvas'; 
import SettingsControl from '../shared/SettingsControl';

import VideoSelector from '../shared/VideoSelector';

import { updateSettings } from '../../statemanagement/app/SettingsStateManagement';

import { selectVideo } from '../../statemanagement/app/AppStateManagement';

import { initViewportListeners } from '../../statemanagement/app/ViewportStateManagement';

class BenchmarkPage extends React.Component {

  constructor(props) {
    super(props);
    props.dispatch(updateSettings({ showDebugUI: true }));
  }

  componentDidMount() {
    this.props.dispatch(selectVideo("proto_1_4k30FPS"));
    this.props.dispatch(initViewportListeners());
  }

  render () {
    return (
      <div className="landing-page">
        <SettingsControl />
        <VideoSelector />
        <Canvas />
        <Video />
      </div>
    )
  }
}

export default connect()(BenchmarkPage);
