import React, { Component } from 'react';
import { connect } from 'react-redux';

class Score extends Component {

  render() {
    return (
      <div 
        className="game-counter"
      >
        <div><span className="text-shadow">{this.props.score}</span> 🚗</div>
        {/* <div><span className="text-shadow">{this.props.nbMissed}</span> 💣</div> */}
        <style jsx>{`
          .game-counter {
            color: white;
            font-size: 3rem;
            font-weight: bold;
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
    score: state.game.get('score'),
    nbMissed: state.game.get('missedItems').size
  }
})(Score);
