import React, { Component } from 'react';
import { connect } from 'react-redux';

import PollutionLevel from './PollutionLevel';
import Score from './Score';

class GameInstructions extends Component {

  render() {
    return (
      <div 
        className="game-instructions"
      >
        <div className="game-instructions-modal">
        <h3>Can you beat the traffic of Stuttgart ?</h3>
        <p><i>Survive the pollution by clicking on cars !</i></p>
        <button>PLAY</button>
        </div>
        <style jsx>{`
          .game-instructions {
            position: fixed;
            color: white;
            top: 0;
            left: 0;
            bottom: 0;
            right: 0;
            z-index: 5;
            transform: will-change;
            background-color: rgba(0,0,0,0.2);
            display: flex;
            align-items: center;
            justify-content: center;
          }

          .game-instructions-modal {
            background-color: rgba(0,0,0,0.5);
            border-radius: 1rem;
            padding: 1rem;
            text-align: center;
          }

          button {
            background-color: transparent;
            border: 1px solid white;
            color: white;
            cursor: pointer;
            font-size: 2rem;
            padding: 1rem;
          }

          button:hover,button:focus {
            background-color: white;
            color: black;
          }
        `}</style>
      </div>
    );
  }
}

export default GameInstructions;
