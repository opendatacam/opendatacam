/* 
   THIS IMPLEMENTATION IS USING DIVS AND IS SLOWER THAN DRAWING ON THE CANVAS
*/


import { Component } from 'react';
import { connect } from 'react-redux';

import { scaleDetection } from '../../utils/resolution';

import EmotjiTracker from '../shared/EmotjiTracker';

const canvasResolution = {
  w: 1280,
  h: 720
}

const originalResolution = {
  w: 1920,
  h: 1080
}

const ItemsToDisplay = ["car","bike","truck","motorbike"];

class TrackerUI extends Component {

  constructor(props) {
    super(props);
    this.lastFrameDrawn = -1;
    this.loopUpdateTrackerUI = this.loopUpdateTrackerUI.bind(this);
    this.isUpdatingTrackerUI = false;

    this.state = {
      trackedItems : []
    }
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

  compute(objectTrackerDataForThisFrame) {
    return objectTrackerDataForThisFrame
      .filter((objectTracked) => {
        return (
          objectTracked.isZombie !== true &&
          ItemsToDisplay.indexOf(objectTracked.name) > -1
        )
      })
      .map((objectTracked) => scaleDetection(objectTracked, canvasResolution, originalResolution))
  }

  loopUpdateTrackerUI() {
    if(window.currentFrame &&
       this.lastFrameDrawn !== window.currentFrame) {

      // Draw objectTracker data
      let objectTrackerDataForThisFrame = this.props.objectTrackerData[window.currentFrame];
      if(objectTrackerDataForThisFrame) {

        // Update items 
        this.setState({
          trackedItems: this.compute(objectTrackerDataForThisFrame)
        });
      }

      this.lastFrameDrawn = window.currentFrame;
    }
    requestAnimationFrame(this.loopUpdateTrackerUI.bind(this));
  }

  render() { 
    return (
      <div
        className={`trackerui-container`}
      >
        {this.state.trackedItems.map((trackedItem) => 
          <EmotjiTracker
            key={trackedItem.id}
            x={trackedItem.x}
            y={trackedItem.y - 10}
            type={trackedItem.name} />
        )}
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
    isPlaying: state.video.get('isPlaying')
  }
})(TrackerUI);
