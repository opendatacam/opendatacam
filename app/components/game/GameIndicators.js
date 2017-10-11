import React, { Component } from 'react';
import { connect } from 'react-redux';

import PollutionLevel from './PollutionLevel';
import Score from './Score';

class GameIndicators extends Component {

  render() {
    return (
      <div 
        className="game-indicators"
      >
        <PollutionLevel />
        <Score />
        <style jsx>{`
          .game-indicators {
            position: fixed;
            color: white;
            top: 1rem;
            left: 1rem;
            z-index: 5;
            transform: will-change;
            background-color: rgba(0,0,0,0.5);
            border-radius: 0.3rem;
            padding: 1rem;
          }
        `}</style>
      </div>
    );
  }
}

export default GameIndicators;
