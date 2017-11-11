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
      clientSide: false,
      landingAnimFinished: false
    };

    props.dispatch(updateSettings({ showDebugUI: false }));
    props.dispatch(selectDefaultVideo());
  }

  componentDidMount() {
    this.props.dispatch(initViewportListeners());
    this.setState({ clientSide : true});

    if(this.props.levelNb === 1) {
      // Trick because the landing animation run without javascript so we have
      // no hook to know when it finishes
      
      const timeSinceFirstPaint = (new Date().getTime() - window.firstPaint) / 1000;
      console.log(`timeSinceFirstPaint ${timeSinceFirstPaint}s`);
      const timeRemainingOnLandingAnimation = 4 - timeSinceFirstPaint;
      // TODO HIDE ONLY IS VIDEO FIRST FRAME IS LOADED
      if(timeRemainingOnLandingAnimation > 0) {
        setTimeout(() => {
          this.hideLanding();
        }, timeRemainingOnLandingAnimation * 1000)
      } else {
        // directly hide it
        this.hideLanding();
      }
    }
  }

  hideLanding() {
    // reset scroll
    window.scroll(0,0);
    // hide landing
    this.setState({
      landingAnimFinished: true
    });
    // scroll animation 
    setTimeout(() => {
      window.scroll({
        top: this.props.videoMobileOffset.y, 
        left: this.props.videoMobileOffset.x, 
        behavior: 'smooth' 
      });
    }, 500);
  }

  render () {
    return (
      <div className="landing-page">
        {process.env.NODE_ENV !== 'production' &&
          <SettingsControl />
        }
        {this.props.levelNb === 1 &&
        !this.state.landingAnimFinished &&
          <Landing />
        }
        {/* 
          we Do that to priorize image loading from landing
          but what about having SSR for other pages like about, level2... ? 
          -> level 2 no need because never loaded directly
          -> about will have its top level page.. 
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

  const selectedVideo = state.app.get('availableVideos').find((video) => {
    return video.get('name') === state.app.get('selectedVideo')
  });

  return {
    isGamePlaying: state.game.get('isPlaying'),
    levelNb: selectedVideo.get('level'),
    videoMobileOffset: selectedVideo.get('videoMobileOffset').toJS()
  }
})(GamePage);
