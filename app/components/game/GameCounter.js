import React, { Component } from 'react';
import { connect } from 'react-redux';

class GameCounter extends Component {

  render() {
    return (
      <div 
        className="game-counter"
      >
        Score: {this.props.score}
        <style jsx>{`
          .game-counter {
            position: fixed;
            color: white;
            top: 30px;
            left: 10px;
            font-size: 40px;
            font-weight: bold;
            z-index: 5;
            transform: will-change;
          }
        `}</style>
      </div>
    );
  }
}

export default connect((state) => {
  return {
    score: state.game.get('score')
  }
})(GameCounter);
