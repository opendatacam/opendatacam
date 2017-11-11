import React, { Component } from 'react';
import { connect } from 'react-redux';
import Link from 'next/link';

import Button from '../../shared/Button';

class LevelFinished extends Component {

  render() {
    return (
      <div className="instructions-level-finished">
        <div className="title">
          CONGRAT!
        </div>
        <div className="message">
          You finished level {this.props.currentLevel} with {this.props.score} ⭐️ !
        </div>
        <Link 
          href={{ 
            pathname: '/', 
            query: { level: this.props.currentLevel + 1 }
          }} 
          prefetch
          as="/level/2"
        >
          <Button
            title={`Next level`}
            large
            transparent
          />
        </Link>
        <style jsx>{`
          .instructions-level-finished {
            display: flex;
            flex: 1;
            justify-content: center;
            align-items: center;
            flex-direction: column;
            color: white;
            padding: 1rem;
          }
          .title {
            font-size: 6rem;
          }

          .message {
            text-align: center;
            margin-bottom: 1.5rem;
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
})(LevelFinished);
