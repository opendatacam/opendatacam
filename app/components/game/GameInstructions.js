import React, { Component } from 'react';
import { connect } from 'react-redux';

import PollutionLevel from './PollutionLevel';
import Score from './Score';

import { startLevel, retryLevel } from '../../statemanagement/app/GameStateManagement';

class GameInstructions extends Component {

  render() {
    return (
      <div 
        className="game-instructions"
      >
        <div className="game-instructions-modal">
          {!this.props.isPlaying &&
           !this.props.failed &&
           !this.props.finished &&
            <div>
              <h3>Can you beat the traffic of Stuttgart ?</h3>
              <p><i>Survive the pollution by clicking on cars !</i></p>
              <button onClick={() => this.props.dispatch(startLevel())}>
                PLAY
              </button>
            </div>
          }
          {!this.props.isPlaying &&
            this.props.failed &&
            <div>
              <h3>Game over !</h3>
              <p><i>You didn't survive the pollution</i></p>
              <button onClick={() => this.props.dispatch(retryLevel())}>
                RETRY
              </button>
            </div>
          }
          {!this.props.isPlaying &&
           !this.props.failed &&
           this.props.finished &&
            <div>
              <h3>Congrats !</h3>
              <p><i>You passed the first level and scored {this.props.score} points !</i></p>
              <button>
                GO TO NEXT LEVEL (not implem yet)
              </button>
            </div>
          }
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

export default connect((state) => {
  return {
    score: state.game.get('score'),
    isPlaying: state.game.getIn(['status', 'isPlaying']),
    failed: state.game.getIn(['status', 'failed']),
    finished: state.game.getIn(['status', 'finished'])
  }
})(GameInstructions);
