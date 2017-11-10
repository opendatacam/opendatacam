import React, { Component } from 'react';
import { connect } from 'react-redux';

class PollutionLevel extends Component {

  render() {
    return (
      <div 
        className="pollution-level"
      >
        <div className="progress-bar"></div>
        <div className="icon">🏭</div>
        <style jsx>{`
          .pollution-level {
            width: 16rem;
            height: 5rem;
            display: flex;
            align-items: center;
          }

          .progress-bar {
            position: relative;
            flex: 1;
            height: 2.5rem;
            background-color: rgba(0, 128, 0, 0.5);
            border-radius: 0.3rem;
            border: 0.1rem solid black;
          }

          .progress-bar:after {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            border-radius: 0.3rem;
            transform: scaleX(${Math.min(1, this.props.nbMissed / this.props.maxMissed)});
            background-color: grey;
            will-change: transform;
            transition: transform 500ms;
            transform-origin: 0 0;
          } 
          
          .icon {
            font-size: 2rem;
            justify-content: center;
            align-items: center;
            margin-left: 2rem;
          }
        `}</style>
      </div>
    );
  }
}

export default connect((state) => {
  return {
    score: state.game.get('score'),
    nbMissed: state.game.get('missedItems').size,
    maxMissed: state.game.get('maxMissed')
  }
})(PollutionLevel);
