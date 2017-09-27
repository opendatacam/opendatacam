import { Component } from 'react';
import { connect } from 'react-redux';
import Head from 'next/head'

import { fetchRawDetections } from '../../statemanagement/app/RawDetectionsStateManagement';
import { fetchObjectTracker } from '../../statemanagement/app/ObjectTrackerStateManagement';

class Canvas extends Component {

  constructor(props) {
    super(props);
    props.dispatch(fetchObjectTracker());
    props.dispatch(fetchRawDetections());
    this.lastFrameDrawn = -1;
    this.loopUpdateCanvas = this.loopUpdateCanvas.bind(this);
  }

  componentWillReceiveProps(nextProps) {
    if(nextProps.isPlaying === true &&
      this.props.isPlaying === false) {
      this.loopUpdateCanvas();
    }
  }

  loopUpdateCanvas() {
    if(this.props.lastFrameDrawn !== window.currentFrame &&
       this.props.rawDetections.size > 0) {
      this.canvasContext.clearRect(0, 0, 1280, 720);
      this.canvasContext.strokeStyle = "#f00";
      this.canvasContext.lineWidth = 5;
      this.canvasContext.font = "15px Arial";
      this.canvasContext.fillStyle = "#f00";
      
      
      this.props.rawDetections.get(window.currentFrame.toString()).map((d) => {
        var x = d.get('x') - d.get('w')/ 2;
        var y = d.get('y') - d.get('h') / 2;
        this.canvasContext.strokeRect(x,y,d.get('w'), d.get('h'));
        this.canvasContext.fillText(d.get('name'),x,y-10);
      });
    }
    requestAnimationFrame(this.loopUpdateCanvas.bind(this));
  }

  render() { 
    return (
      <div>
        {/* It is important to specify the canvas width 
         and height for the ratio but it can be scaled down */}
        <canvas 
         ref={(el) => { 
          this.canvasEl = el;
          if(this.canvasEl) {
            this.canvasContext = el.getContext('2d');
          }
          /* this.canvasEl.width = 1280;
          this.canvasEl.height = 720; */
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
    currentFrame: state.video.get('currentFrame'),
    isPlaying: state.video.get('isPlaying')
  }
})(Canvas);
