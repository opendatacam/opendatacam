import { Component } from 'react';
import { connect } from 'react-redux';

class Mask extends Component {

  constructor(props) {
    super(props);
    props.dispatch(fetchObjectTracker());
    props.dispatch(fetchRawDetections());
    this.lastFrameDrawn = -1;
    this.loopUpdateCanvas = this.loopUpdateCanvas.bind(this);
    this.isUpdatingCanvas = false;
  }

  // TODO IMPLEMENT COMPONENT UNMOUNT TO CLEAN UP STUFF

  componentWillReceiveProps(nextProps) {
    if(nextProps.isPlaying === true &&
       nextProps.areRawDetectionsFetched === true &&
       nextProps.isObjectTrackerDataFetched === true) {
      if(!this.isUpdatingCanvas) {
        console.log('Start loop update canvas');
        this.isUpdatingCanvas = true;
        this.loopUpdateCanvas();
      }
    }

    // TODO IF VIDEO PAUSES, STOP UPDATING CANVAS
  }

  drawRawDetections(context, detections) {
    context.strokeStyle = "#f00";
    context.lineWidth = 5;
    context.font = "15px Arial";
    context.fillStyle = "#f00";
    detections.map((detection) => {
      let x = detection.x - detection.w / 2;
      let y = detection.y - detection.h / 2;
      context.strokeRect(x, y, detection.w, detection.h);
      context.fillText(detection.name, x, y-10);
    });
  }

  drawObjectTrackerData(context, objectTrackerData) {
    context.globalAlpha = 1;
    context.strokeStyle = "blue";
    context.lineWidth = 5;
    context.font = "30px Arial";
    context.fillStyle = "blue";
    objectTrackerData.map((objectTracked) => {      
      if(objectTracked.isZombie) {
        context.fillStyle = `rgba(255, 153, 0, ${objectTracked.zombieOpacity})`;
        context.strokeStyle = `rgba(255, 153, 0, ${objectTracked.zombieOpacity})`;
      } else {
        context.fillStyle = "blue";
        context.strokeStyle = "blue";
      }
      let x = objectTracked.x - objectTracked.w / 2;
      let y = objectTracked.y - objectTracked.h / 2;
      context.strokeRect(x+5, y+5, objectTracked.w-10, objectTracked.h-10);
      context.fillText(objectTracked.idDisplay,x + objectTracked.w / 2 - 20,y + objectTracked.h / 2);
    });
  }

  loopUpdateCanvas() {
    if(window.currentFrame &&
       this.lastFrameDrawn !== window.currentFrame) {

      this.canvasContext.clearRect(0, 0, 1280, 720);

      // Draw debug raw detections data
      let rawDetectionsForThisFrame = this.props.rawDetections[window.currentFrame];
      if(this.props.showDebugUI && rawDetectionsForThisFrame) {
        this.drawRawDetections(this.canvasContext, rawDetectionsForThisFrame);
      }

      // Draw debug objectTracker data
      let objectTrackerDataForThisFrame = this.props.objectTrackerData[window.currentFrame];
      if(this.props.showDebugUI && objectTrackerDataForThisFrame) {
        this.drawObjectTrackerData(this.canvasContext, objectTrackerDataForThisFrame);
      }

      this.lastFrameDrawn = window.currentFrame;
    }
    requestAnimationFrame(this.loopUpdateCanvas.bind(this));
  }

  render() { 
    return (
      <div>
        {/* Canvas width and height must 
        be set the the yolo detections resolution
        Then it is scaled down to viewport */}
        <canvas 
         ref={(el) => { 
          this.canvasEl = el;
          if(this.canvasEl) {
            this.canvasContext = el.getContext('2d');
          }
         }}
         width="1280"
         height="720"
         className="canvas" />
        <style jsx>{`
          .canvas {
            display: block;
            will-change: transform;
            position: absolute;
            top:0;
            left:0;
          }

          @media (min-aspect-ratio: 16/9) {
            .canvas {
              width: 100vw;
              height: auto;
            }
          }

          @media (max-aspect-ratio: 16/9) {
            .canvas {
              width: auto;
              height: 100vh;
            }
          }
        `}</style>
      </div>
    );
  }
}
 
export default connect((state) => {
  return {
    rawDetections: state.rawDetections.get('data'),
    areRawDetectionsFetched: state.rawDetections.get('fetched'),
    objectTrackerData: state.objectTracker.get('data'),
    isObjectTrackerDataFetched: state.objectTracker.get('fetched'),
    isPlaying: state.video.get('isPlaying'),
    showDebugUI: state.settings.get('showDebugUI')
  }
})(Canvas);
