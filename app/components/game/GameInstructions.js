import React, { Component } from 'react';
import { connect } from 'react-redux';
import Link from 'next/link';

import PollutionLevel from './PollutionLevel';
import Score from './Score';
import Loading from '../shared/Loading';
import InstructionsLevelBeginning from './instructions/InstructionsLevelBeginning';

import { startLevel, retry } from '../../statemanagement/app/GameStateManagement';

class GameInstructions extends Component {

  render() {
    return (
      <div 
        className="game-instructions"
      >
        {!this.props.isPlaying &&
         !this.props.failed &&
         !this.props.finished &&
          <InstructionsLevelBeginning />
        }
        <div className="game-instructions-modal">
          {/* {!this.props.isPlaying &&
           !this.props.failed &&
           !this.props.finished &&
            <div>
              <h3>Beat the traffic Stuttgart</h3>
              {this.props.currentLevel === 1 &&
                <p><i>Survive the pollution by clicking on cars !</i></p>
              }
              {this.props.currentLevel === 2 &&
                <div>
                  <p><i>Ready for level 2 ?</i></p>
                  {this.props.deviceOrientation === 'portrait' &&
                    <AskLandscape />
                  }
                  {this.props.deviceOrientation !== 'portrait'  &&
                   this.props.isFullscreenAvailable &&
                   !this.props.isFullscreen &&
                    <div>
                      <p>TIP: Level 2 is easier in fullscreen</p>
                      <button
                        onClick={() => screenfull.request()}
                      >
                        GO FULLSCREEN
                      </button>
                    </div>
                  }
                </div>
              }
              {this.props.gameReadyToPlay &&
                <a onClick={() => this.props.dispatch(startLevel())}>
                  PLAY
                </a>
              }
              {!this.props.gameReadyToPlay &&
                <Loading />
              }
            </div>
          } */}
          {!this.props.isPlaying &&
            this.props.failed &&
            <div>
              <h3>Game over !</h3>
              <p><i>You didn't survive the pollution</i></p>
              <a onClick={() => this.props.dispatch(retry())}>
                RETRY
              </a>
            </div>
          }
          {!this.props.isPlaying &&
           !this.props.failed &&
           this.props.finished &&
            <div>
              <h3>Congrats !</h3>
              {this.props.currentLevel === 1 &&
                <div>
                  <p><i>You passed the first level and scored {this.props.score} points !</i></p>
                  <Link href={{ 
                    pathname: '/', 
                    query: { level: 2 } 
                    }} 
                    as="/level/2">
                    <a>
                      GO TO LEVEL 2
                    </a>
                  </Link>
                </div>
              }
              {this.props.currentLevel === 2 &&
                <div>
                  <p><i>You passed the second level and scored {this.props.score} points !</i></p>
                  <a>
                    TODO NEXT LVL
                  </a>
                </div>
              }
            </div>
          }
        </div>
        <style jsx>{`
          .game-instructions {
            position: fixed;
            display: flex;
            top: 0;
            left: 0;
            bottom: 0;
            right: 0;
            z-index: 5;
          }
        `}</style>
      </div>
    );
  }
}

export default connect((state) => {

  const isGameReadyToPlay = state.objectTracker.get('fetched') && state.video.get('isReadyToPlay');

  return {
    score: state.game.get('score'),
    isPlaying: state.game.get('isPlaying'),
    failed: state.game.get('failed'),
    finished: state.game.get('finished'),
    currentLevel: state.game.get('currentLevel'),
    isGameReadyToPlay,
    deviceOrientation: state.viewport.get('deviceOrientation'),
    isFullscreenAvailable: state.viewport.get('isFullscreenAvailable'),
    isFullscreen: state.viewport.get('isFullscreen')
  }
})(GameInstructions);
