import React, { Component } from 'react';
import { connect } from 'react-redux';

import { turnSoundOn, turnSoundOff } from '../../statemanagement/app/SettingsStateManagement';

class Sound extends Component {

  constructor(props) {
    super(props);

    this.toggleSound = this.toggleSound.bind(this);
  }

  toggleSound() {
    if(this.el) {
      if(this.props.soundEnabled) {
        this.el.pause();
        this.props.dispatch(turnSoundOff());
      } else {
        this.el.play();
        this.props.dispatch(turnSoundOn());
      }
    }
  }

  render() {
    return (
      <div 
        className={`audio-button ${this.props.soundEnabled ? 'on' : 'off'} ${!this.props.isVideoReadyToPlay ? 'hidden' : 'visible'}`}
        onClick={this.toggleSound}
      >
        <audio
          loop
          preload="true"
          ref={(el) => this.el = el}
        >
          <source src="/static/sound.mp3" type="audio/mpeg" />
        </audio>
        <style jsx>{`
          .audio-button {
            position: fixed;
            background-color: white;
            bottom: 10px;
            right: 10px;
            z-index: 5;
            width: 44px;
            height: 44px;
            transform: will-change;
            cursor: pointer;
            border-radius: 2px;
            background-repeat: no-repeat;
            background-size: 20px 20px;
            background-position: center;
          }

          .audio-button.on {
            background-image: url(/static/sound-on.svg);
            
          }

          .audio-button.off {
            background-image: url(/static/sound-off.svg);
          }

          {/* TODO CHANGE THIS VISIBILITY TRICK BY HAVING A LOADING SCREEN
          THAT IS ON TOP OF THE VIDEO */}
          .hidden {
            visibility: hidden;
          }
        `}</style>
      </div>
    );
  }
}

export default connect((state) => {
  return {
    isVideoReadyToPlay: state.video.get('isReadyToPlay'),
    soundEnabled: state.settings.get('soundEnabled')
  }
})(Sound);
