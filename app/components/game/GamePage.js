import React from 'react';
import { connect } from 'react-redux';

import Video from '../shared/Video'; 
import Loading from '../shared/Loading'; 
import Canvas from '../shared/Canvas'; 
import Mask from './Mask'; 
import Sound from './Sound'; 
import SettingsControl from '../shared/SettingsControl';
import TrackerUI from '../shared/TrackerUI';
import GameIndicators from './GameIndicators';
import GameInstructions from './GameInstructions';
import LevelProgressBar from './LevelProgressBar';
import LevelName from './LevelName';
import Landing from './Landing';

import Title from '../shared/Title';
import VideoSelector from '../shared/VideoSelector';

import { updateSettings } from '../../statemanagement/app/SettingsStateManagement';

import { selectDefaultVideo } from '../../statemanagement/app/AppStateManagement';

import { initViewportListeners } from '../../statemanagement/app/ViewportStateManagement';

class GamePage extends React.Component {

  constructor(props) {
    super(props);

    this.state = {
      clientSide: false
    };

    props.dispatch(updateSettings({ showDebugUI: false }));
  }

  componentDidMount() {
    this.props.dispatch(selectDefaultVideo());
    this.props.dispatch(initViewportListeners());
    this.setState({ clientSide : true});
  }

  render () {
    return (
      <div className="landing-page">
        {process.env.NODE_ENV !== 'production' &&
          <SettingsControl />
        }
        <Landing />
        {/* What about having SSR for other pages like about, level2... ?  
          Do that to priorize image loading from landing
        */}
        {this.state.clientSide && 
          <div>
            {!this.props.isGamePlaying &&
              <GameInstructions />
            }
            {this.props.isGamePlaying &&
              <GameIndicators />
            }
            <Canvas />
            {this.props.isGamePlaying &&
              <Sound />
            }
            <Mask />
            <Video />
            {this.props.isGamePlaying &&
              <LevelName />
            }
            {this.props.isGamePlaying &&
              <LevelProgressBar />
            }
          </div>
        }
      </div>
    )
  }
}

export default connect((state) => {
  return {
    isGamePlaying: state.game.get('isPlaying')
  }
})(GamePage);
