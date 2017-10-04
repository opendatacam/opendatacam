import React from 'react';
import { connect } from 'react-redux';
import Video from '../shared/Video'; 
import Canvas from '../shared/Canvas'; 
import SettingsControl from '../shared/SettingsControl';

import Title from '../shared/Title';
import LinkItem from '../shared/LinkItem';
import VideoSelector from '../shared/VideoSelector';

import { selectDefaultVideo } from '../../statemanagement/app/AppStateManagement';

class Landing extends React.Component {

  constructor(props) {
    super(props);
  }

  componentDidMount() {
    this.props.dispatch(selectDefaultVideo());
  }

  render () {
    return (
      <div className="landing-page">
        <VideoSelector />
        <Title label="Traffic Cam Landing" />
        <SettingsControl />
        <Video />
        <Canvas />
      </div>
    )
  }
}

export default connect()(Landing)
