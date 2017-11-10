import React, { Component } from 'react';
import { connect } from 'react-redux';

class Score extends Component {

  render() {
    return (
      <div 
        className="score-container"
      >
        <span className="score">{this.props.score}</span>
        <img className="icon-star" src="/static/assets/icon-star.svg" />
        <style jsx>{`
          .score-container {
            display: flex;
            flex: 1;
            justify-content: space-between;
            align-items: center;
            margin-left: -0.3rem;
          }
          .score {
            color: white;
            font-size: 4rem;
            font-weight: bold;
          }

          .icon-star {
            width: 3rem;
            height: 3rem;
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
})(Score);
