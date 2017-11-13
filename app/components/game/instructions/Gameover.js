import React, { Component } from 'react';
import { connect } from 'react-redux';
import Link from 'next/link';

import Button from '../../shared/Button';

import { retry } from '../../../statemanagement/app/GameStateManagement';
import SoundsManager from '../../../statemanagement/app/SoundsManager';

class Gameover extends Component {

  componentDidMount() {
    SoundsManager.playSound('youlose');
  }

  render() {
    return (
      <div className="instructions-gameover">
        <div className="title">
          GAME OVER
        </div>
        <div className="message">
          You scored {this.props.score} ⭐️
        </div>
        <Button
          title={`Play again`}
          onClick={() => this.props.dispatch(retry())}
        />
        <style jsx>{`
          .instructions-gameover {
            display: flex;
            flex: 1;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            color: white;
            padding: 5rem;
            background-color: #262626;
          }
          .title {
            font-size: 6rem;
            color: red;
            text-align: center;
            margin-bottom: 3rem;
          }

          .message {
            text-align: center;
            margin-bottom: 2rem;
          }
        `}</style>
      </div>
    );
  }
}

export default connect((state) => {

  return {
    score: state.game.get('score'),
    currentLevel: state.game.get('currentLevel')
  }
})(Gameover);
