import React, { Component } from 'react';
import { connect } from 'react-redux';

class GameCounter extends Component {

  render() {
    return (
      <div 
        className="game-counter"
      >
        <span className="text-shadow">{this.props.score}</span> 🚗
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
            font-family: sans-serif;
          }

          .text-shadow {
            text-shadow:-1px -1px 0 #000,1px -1px 0 #000,-1px 1px 0 #000,1px 1px 0 #000;  
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
