import React, { PureComponent } from 'react';
import { connect } from 'react-redux';

import LevelBeginning from './instructions/LevelBeginning';
import LevelFinished from './instructions/LevelFinished';
import Gameover from './instructions/Gameover';
import Win from './instructions/Win';

class GameInstructions extends PureComponent {

  render() {
    return (
      <div 
        className="game-instructions"
      >
        {!this.props.isPlaying &&
         !this.props.failed &&
         !this.props.finished &&
          <LevelBeginning />
        }
        {!this.props.isPlaying &&
         !this.props.failed &&
         this.props.finished &&
         this.props.currentLevel < this.props.nbTotalLevel  &&
          <LevelFinished />
        }
        {!this.props.isPlaying &&
         !this.props.failed &&
         this.props.finished &&
         this.props.currentLevel === this.props.nbTotalLevel &&
          <Win />
        }
        {!this.props.isPlaying &&
          this.props.failed &&
          <Gameover />
        }
        <style jsx>{`
          .game-instructions {
            position: fixed;
            display: flex;
            top: 0;
            left: 0;
            bottom: 0;
            right: 0;
            z-index: 6;
          }
        `}</style>
      </div>
    );
  }
}

export default connect((state) => {

  return {
    isPlaying: state.game.get('isPlaying'),
    failed: state.game.get('failed'),
    finished: state.game.get('finished'),
    currentLevel: state.game.get('currentLevel'),
    nbTotalLevel: state.game.get('nbTotalLevel')
  }
})(GameInstructions);
