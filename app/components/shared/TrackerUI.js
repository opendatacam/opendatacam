import { Component } from 'react';
import { connect } from 'react-redux';

import { scaleDetection } from '../../utils/resolution';

const videoResolution = {
  w: 1280,
  h: 720
}

const originalResolution = {
  w: 1920,
  h: 1080
}

class TrackerUI extends Component {

  constructor(props) {
    super(props);
    this.lastFrameDrawn = -1;
    this.loopUpdateTrackerUI = this.loopUpdateTrackerUI.bind(this);
    this.isUpdatingTrackerUI = false;
  }

  // TODO IMPLEMENT COMPONENT UNMOUNT TO CLEAN UP STUFF

  componentWillReceiveProps(nextProps) {
    if(nextProps.isPlaying === true &&
       nextProps.isObjectTrackerDataFetched === true) {
      if(!this.isUpdatingCanvas) {
        console.log('Start loop update tracker ui');
        this.isUpdatingTrackerUI = true;
        this.loopUpdateTrackerUI();
      }
    }

    // TODO IF VIDEO PAUSES, STOP UPDATING CANVAS
  }

  loopUpdateTrackerUI() {
    if(window.currentFrame &&
       this.lastFrameDrawn !== window.currentFrame) {

      // Draw objectTracker data
      let objectTrackerDataForThisFrame = this.props.objectTrackerData[window.currentFrame];
      if(this.props.showDebugUI && objectTrackerDataForThisFrame) {
        this.drawObjectTrackerData(this.canvasContext, objectTrackerDataForThisFrame);
      }

      this.lastFrameDrawn = window.currentFrame;
    }
    requestAnimationFrame(this.loopUpdateTrackerUI.bind(this));
  }

  render() { 
    return (
      <div
        className={`trackerui-container ${!this.props.isVideoReadyToPlay ? 'hidden' : 'visible'}`}
      >
        
        <style jsx>{`
          .trackerui-container {
            width: 100%;
            height: 100%;
            position: absolute;
            top:0;
            left:0;
          }

          .hidden {
            display: none;
          }
        `}</style>
      </div>
    );
  }
}
 
export default connect((state) => {
  return {
    objectTrackerData: state.objectTracker.get('data'),
    isObjectTrackerDataFetched: state.objectTracker.get('fetched'),
    isPlaying: state.video.get('isPlaying'),
    isVideoReadyToPlay: state.video.get('isReadyToPlay')
  }
})(TrackerUI);
