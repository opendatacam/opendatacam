import React, { Component } from 'react';
import { connect } from 'react-redux';
import screenfull from 'screenfull';

import Button from '../../shared/Button';
import Loading from '../../shared/Loading';
import AskLandscapeAnimation from '../../shared/AskLandscapeAnimation';

import { startLevel } from '../../../statemanagement/app/GameStateManagement';

class LevelBeginning extends Component {

  render() {
    return (
      <div className="instructions-level-beginning">
        <div className="level-title">
          LEVEL {this.props.currentLevel}
        </div>
        {this.props.currentLevel >= 2 &&
          <div className="level-help">
            {this.props.deviceOrientation === 'portrait' &&
              <div>
                <AskLandscapeAnimation />
                <p>TIP: This level is easier in landscape</p>
              </div>
            }
            {this.props.deviceOrientation !== 'portrait'  &&
            this.props.isFullscreenAvailable &&
            !this.props.isFullscreen &&
              <div>
                <p>TIP: This level is easier in fullscreen</p>
                <Button
                  onClick={() => screenfull.request()}
                  title="Enter Fullscreen"
                  transparent
                >
                </Button>
              </div>
            }
          </div>
        }
        {this.props.isGameReadyToPlay &&
          <Button
            onClick={() => this.props.dispatch(startLevel())}
            title="Start"
            large
            transparent
          />
        }
        {!this.props.isGameReadyToPlay &&
          <Loading />
        }
        <style jsx>{`
          .instructions-level-beginning {
            display: flex;
            flex: 1;
            justify-content: center;
            align-items: center;
            flex-direction: column;
            color: white;
          }
          .level-title {
            font-size: 8rem;
          }

          .level-help {
            text-align: center;
            margin-bottom: 5px;
          }
        `}</style>
      </div>
    );
  }
}

export default connect((state) => {

  const isGameReadyToPlay = state.objectTracker.get('fetched') && state.video.get('isReadyToPlay');

  return {
    isGameReadyToPlay,
    deviceOrientation: state.viewport.get('deviceOrientation'),
    isFullscreenAvailable: state.viewport.get('isFullscreenAvailable'),
    isFullscreen: state.viewport.get('isFullscreen'),
    currentLevel: state.game.get('currentLevel')
  }
})(LevelBeginning);
