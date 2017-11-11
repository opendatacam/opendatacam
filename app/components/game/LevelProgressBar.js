import React, { Component } from 'react';
import { connect } from 'react-redux';

class LevelProgressBar extends Component {

  render() {

    const progress = this.props.currentTime / this.props.totalDuration || 0;

    return (
      <div className="progress-bar">
        <style jsx>{`
          .progress-bar {
            position: fixed;
            bottom: 0;
            left: 0;
            right: 0;
            height: 0.8rem;
            background-color: #262626;
            z-index: 1;
          }

          .progress-bar:after {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background-color: #FFFE4A;
            will-change: transform;
            // a bit hacky as we only update the current time each second
            // there is delay when we pause, the good way to do it would be to 
            // wrap this in request animation frame and pick the currentTime of
            // the video
            transition: transform 1s linear;
            transform-origin: 0 0;
          } 
        `}</style>
        <style jsx>{`
          // Dynamic style are separated for better runtime perf
          .progress-bar:after {
            transform: scaleX(${progress});
          }
        `}
        </style>
      </div>
    );
  }
}

export default connect((state) => {
  return {
    totalDuration: Math.trunc(state.video.get('duration')),
    currentTime: state.video.get('currentTime')
  }
})(LevelProgressBar);
