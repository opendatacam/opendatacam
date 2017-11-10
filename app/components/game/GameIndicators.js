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
        <Score />
        <PollutionLevel />
        <style jsx>{`
          .game-indicators {
            position: fixed;
            top: 3rem;
            left: 3rem;
            z-index: 5;
            transform: will-change;
          }
        `}</style>
      </div>
    );
  }
}

export default GameIndicators;
