import { Component } from 'react';
import { connect } from 'react-redux';

import { scaleDetection } from '../../utils/resolution';

const canvasResolution = {
  w: 1280,
  h: 720
}

const originalResolution = {
  w: 1920,
  h: 1080
}

const ItemsToDisplay = ["car","bike","truck","motorbike"];

class Canvas extends Component {

  constructor(props) {
    super(props);
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
      let scaledDetection = scaleDetection(detection, canvasResolution, originalResolution);
      let x = scaledDetection.x - scaledDetection.w / 2;
      let y = scaledDetection.y - scaledDetection.h / 2;
      context.strokeRect(x, y, scaledDetection.w, scaledDetection.h);
      context.fillText(scaledDetection.name, x, y-10);
    });
  }

  drawObjectTrackerData(context, objectTrackerData) {
    context.globalAlpha = 1;
    context.strokeStyle = "blue";
    context.lineWidth = 5;
    context.font = "30px Arial";
    context.fillStyle = "blue";
    objectTrackerData.map((objectTracked) => { 
      let objectTrackedScaled = scaleDetection(objectTracked, canvasResolution, originalResolution);     
      if(objectTrackedScaled.isZombie) {
        context.fillStyle = `rgba(255, 153, 0, ${objectTrackedScaled.zombieOpacity})`;
        context.strokeStyle = `rgba(255, 153, 0, ${objectTrackedScaled.zombieOpacity})`;
      } else {
        context.fillStyle = "blue";
        context.strokeStyle = "blue";
      }
      let x = objectTrackedScaled.x - objectTrackedScaled.w / 2;
      let y = objectTrackedScaled.y - objectTrackedScaled.h / 2;
      context.strokeRect(x+5, y+5, objectTrackedScaled.w-10, objectTrackedScaled.h-10);
      context.fillText(objectTrackedScaled.idDisplay,x + objectTrackedScaled.w / 2 - 20,y + objectTrackedScaled.h / 2);
    });
  }

  drawTrackerUIData(context, objectTrackerDataForThisFrame) {
    context.globalAlpha = 1;

    const SQUARE_SIZE = 50;
    const SQUARE_BORDER = 2;
    const FOOT_LENGTH = 30;
    const FOOT_TICKNESS = 4;
    const FOOT_CIRCLE_RADIUS = 5;

    objectTrackerDataForThisFrame.filter((objectTracked) => {
      return (
        objectTracked.isZombie !== true &&
        ItemsToDisplay.indexOf(objectTracked.name) > -1
      )
    }).map((objectTracked) => {
      let objectTrackedScaled = scaleDetection(objectTracked, canvasResolution, originalResolution);


      // Set params
      context.strokeStyle = "#E3E3E3";
      context.fillStyle = "#FFFFFF";
      context.lineWidth = 2;

      // Draw circle
      let circle = {
        x: objectTrackedScaled.x,
        y: objectTrackedScaled.y - 20
      }

      context.beginPath();
      context.arc(circle.x,circle.y, FOOT_CIRCLE_RADIUS, 0, 2 * Math.PI, false);
      context.fill();

      // Draw foot
      let foot = {
        x: circle.x - FOOT_TICKNESS / 2,
        y: circle.y - FOOT_LENGTH,
        w: FOOT_TICKNESS,
        h: FOOT_LENGTH
      }

      context.fillRect(foot.x, foot.y, foot.w, foot.h);

      // Draw square
      let square = {
        x: circle.x - SQUARE_SIZE / 2,
        y: circle.y - SQUARE_SIZE - FOOT_LENGTH,
        w: SQUARE_SIZE,
        h: SQUARE_SIZE
      }

      
      context.fillRect(square.x, square.y, square.w, square.h);
      context.strokeRect(square.x, square.y, square.w, square.h);

      // Draw emotji
      context.font = "25px sans-serif";
      context.textAlign="center"; 
      context.textBaseline = "middle";
      let icon = "🚗";
      if(objectTrackedScaled.name === "truck") {
        icon = "🚚️️️";
      } else if(objectTrackedScaled.name === "bicycle") {
        icon = "🚴";
      } else if(objectTrackedScaled.name === "motorbike") {
        icon = "️️🏍️";
      }
      context.fillText(icon, square.x + square.w / 2, square.y + square.h/2);
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

      // Draw tracker ui data
      if(objectTrackerDataForThisFrame) {
        this.drawTrackerUIData(this.canvasContext, objectTrackerDataForThisFrame);
      }

      this.lastFrameDrawn = window.currentFrame;
    }
    requestAnimationFrame(this.loopUpdateCanvas.bind(this));
  }

  render() { 
    return (
      <div
        className={`canvas-container ${!this.props.isVideoReadyToPlay ? 'hidden' : 'visible'}`}
      >
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
          .canvas-container {
            width: 100%;
            height: 100%;
            position: absolute;
            top:0;
            left:0;
          }
          .canvas {
            display: block;
            will-change: transform;
            position: absolute;
            top:0;
            left:0;
            z-index: 2;
          }

          @media (min-aspect-ratio: 16/9) {
            .canvas {
              width: 100%;
              height: auto;
            }
          }

          @media (max-aspect-ratio: 16/9) {
            .canvas {
              width: auto;
              height: 100%;
            }
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
    rawDetections: state.rawDetections.get('data'),
    areRawDetectionsFetched: state.rawDetections.get('fetched'),
    objectTrackerData: state.objectTracker.get('data'),
    isObjectTrackerDataFetched: state.objectTracker.get('fetched'),
    isPlaying: state.video.get('isPlaying'),
    showDebugUI: state.settings.get('showDebugUI'),
    isVideoReadyToPlay: state.video.get('isReadyToPlay')
  }
})(Canvas);
