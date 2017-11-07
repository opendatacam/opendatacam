import { Component } from 'react';
import { connect } from 'react-redux';

import { scaleDetection } from '../../utils/resolution';

const canvasResolution = {
  w: 1280,
  h: 720
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
       nextProps.isObjectTrackerDataFetched === true) {
      if(!this.isUpdatingCanvas) {
        console.log('Start loop update canvas');
        this.isUpdatingCanvas = true;
        this.loopUpdateCanvas();
      }
    }

    // TODO IF VIDEO PAUSES, STOP UPDATING CANVAS
  }

  componentDidMount() {
    // init global var
    window.itemsMasked = [];
  }

  drawRawDetections(context, detections) {
    context.strokeStyle = "red";
    context.lineWidth = 20; // draw the rectangle bigger than the bounding box
    context.fillStyle = "red";
    detections.map((detection) => {
      let scaledDetection = scaleDetection(detection, canvasResolution, this.props.originalResolution);
      let x = scaledDetection.x - scaledDetection.w / 2;
      let y = scaledDetection.y - scaledDetection.h / 2;
      context.fillRect(x, y, scaledDetection.w, scaledDetection.h);
      context.strokeRect(x, y, scaledDetection.w, scaledDetection.h);
      // context.fillText(scaledDetection.name, x, y-10);
    });
  }

  drawObjectTrackerData(context, objectTrackerData) {
    context.globalAlpha = 1;
    context.strokeStyle = "blue";
    context.lineWidth = 5;
    context.font = "30px Arial";
    context.fillStyle = "blue";
    objectTrackerData.map((objectTracked) => { 
      let objectTrackedScaled = scaleDetection(objectTracked, canvasResolution, this.props.originalResolution);     
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

    const SQUARE_SIZE = 40;
    const SQUARE_BORDER = 2;
    const FOOT_LENGTH = 25;
    const FOOT_TICKNESS = 4;
    const FOOT_CIRCLE_RADIUS = 5;

    objectTrackerDataForThisFrame.filter((objectTracked) => {
      return (
        !window.itemsMasked.find((itemMasked) => itemMasked.id === objectTracked.id) &&
        objectTracked.isZombie !== true &&
        ItemsToDisplay.indexOf(objectTracked.name) > -1
      )
    }).map((objectTracked) => {
      let objectTrackedScaled = scaleDetection(objectTracked, canvasResolution, this.props.originalResolution);


      // Set params
      context.strokeStyle = "#E3E3E3";
      context.fillStyle = "#00CCFF";
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
        y: circle.y - FOOT_LENGTH - FOOT_CIRCLE_RADIUS,
        w: FOOT_TICKNESS,
        h: FOOT_LENGTH
      }

      context.fillStyle = "#FFFFFF";
      context.fillRect(foot.x, foot.y, foot.w, foot.h);

      // Draw square
      let square = {
        x: circle.x - SQUARE_SIZE / 2,
        y: circle.y - SQUARE_SIZE - FOOT_LENGTH,
        w: SQUARE_SIZE,
        h: SQUARE_SIZE
      }

      
      // context.fillRect(square.x, square.y, square.w, square.h);
      // context.strokeRect(square.x, square.y, square.w, square.h);

      // Draw emotji
      context.font = "18px sans-serif";
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

      const currentDetectionOrTrackingFrame = window.currentFrame * this.props.ratioVideoTrackerFPS;

      // Draw debug raw detections data
      let rawDetectionsForThisFrame = this.props.rawDetections[currentDetectionOrTrackingFrame];
      // if(this.props.showDebugUI && rawDetectionsForThisFrame) {
      this.drawRawDetections(this.canvasContext, rawDetectionsForThisFrame);
      // }

      // Draw debug objectTracker data
      // let objectTrackerDataForThisFrame = this.props.objectTrackerData[currentDetectionOrTrackingFrame];
      // if(this.props.showDebugUI && objectTrackerDataForThisFrame) {
      //   this.drawObjectTrackerData(this.canvasContext, objectTrackerDataForThisFrame);
      // }

      // Draw tracker ui data
      // if(objectTrackerDataForThisFrame) {
      //   this.drawTrackerUIData(this.canvasContext, objectTrackerDataForThisFrame);
      // }

      this.lastFrameDrawn = window.currentFrame;
    }
    requestAnimationFrame(this.loopUpdateCanvas.bind(this));
  }

  render() { 
    console.log('render');
    return (
      <canvas 
        ref={(el) => { 
          this.canvasEl = el;
          if(this.canvasEl) {
            this.canvasContext = el.getContext('2d');
          }
        }}
        width="1280"
        height="720"
        className="canvas2d" />
    );
  }
}
 
export default connect((state) => {

  const selectedVideo = state.app.get('availableVideos').find((video) => {
    return video.get('name') === state.app.get('selectedVideo')
  });

  const ratioVideoTrackerFPS = selectedVideo.get('trackerAndDetectionsFPS') / selectedVideo.get('videoFPS');

  return {
    rawDetections: state.rawDetections.get('data'),
    areRawDetectionsFetched: state.rawDetections.get('fetched'),
    objectTrackerData: state.objectTracker.get('data'),
    isObjectTrackerDataFetched: state.objectTracker.get('fetched'),
    isPlaying: state.video.get('isPlaying'),
    showDebugUI: state.settings.get('showDebugUI'),
    isVideoReadyToPlay: state.video.get('isReadyToPlay'),
    originalResolution: selectedVideo.get('originalResolution').toJS(),
    ratioVideoTrackerFPS
  }
})(Canvas);
