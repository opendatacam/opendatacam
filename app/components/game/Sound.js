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
            bottom: 1rem;
            right: 1rem;
            z-index: 5;
            width: 4.4rem;
            height: 4.4rem;
            transform: will-change;
            cursor: pointer;
            border-radius: 0.2rem;
            background-repeat: no-repeat;
            background-size: 2rem 2rem;
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
