import React, { Component } from 'react';
import { connect } from 'react-redux';

import { turnSoundOn, turnSoundOff } from '../../statemanagement/app/SettingsStateManagement';

class Sound extends Component {

  constructor(props) {
    super(props);

    this.toggleSound = this.toggleSound.bind(this);
  }

  toggleSound() {
    if(this.props.soundEnabled) {
      this.props.dispatch(turnSoundOff());
    } else {
      this.props.dispatch(turnSoundOn());
    }
  }

  componentDidMount() {
    // Prefetch sound on / off image depending on enabled / disabled
    const soundOn = new Image();
    soundOn.src = `/static/assets/icons/icon-sound-${this.props.soundEnabled ? 'off' : 'on'}.svg`;
  }

  render() {
    return (
      <div 
        className={`audio-button ${this.props.soundEnabled ? 'on' : 'off'}`}
        onClick={this.toggleSound}
      >
        <style jsx>{`
          .audio-button {
            position: fixed;
            bottom: 1.5rem;
            right: 1rem;
            z-index: 6;
            width: 4.4rem;
            height: 4.4rem;
            transform: will-change;
            cursor: pointer;
            border-radius: 0.2rem;
            background-repeat: no-repeat;
            background-size: 3rem 3rem;
            background-position: center;
          }

          .audio-button.on {
            background-image: url(/static/assets/icons/icon-sound-on.svg);
            
          }

          .audio-button.off {
            background-image: url(/static/assets/icons/icon-sound-off.svg);
          }
        `}</style>
      </div>
    );
  }
}

export default connect((state) => {
  return {
    soundEnabled: state.settings.get('soundEnabled')
  }
})(Sound);
