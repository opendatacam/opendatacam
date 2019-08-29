import React, { PureComponent } from 'react'
import { connect } from 'react-redux';

import CanvasEngine from '../canvas/CanvasEngine';
import { CANVAS_RENDERING_MODE } from '../../utils/constants';
import BtnRecording from '../shared/BtnRecording';
import SVG from 'react-inlinesvg';
// import html2canvas from 'html2canvas';

class LiveView extends PureComponent {

  constructor(props) {
    super(props);
  }


  componentDidMount() {

  }

  componentWillUnmount() {

  }

  // downloadFrame() {
  //   // var f = detectionScaledOfThisFrame[0];
  //   var canvas = CanvasEngine.canvasContext;
  //   // var canvas = document.getElementsByClassName("canvas")[0];
  //   console.log(canvas);
  //   // var cropped = canvas.drawImage(canvas, 100,100,500,100);
  //   var img = canvas.toDataURL("image/png");
  //   // this.downloadBtn.setAttribute('href', this.hiddenCanvas.toDataURL());
  //   // this.downloadBtn.setAttribute('download', "pathfinder.png")
  // }
  registerHiddenCanvas(el) {
    this.hiddenCanvas = el;
  }

  downloadFrame() {
    // html2canvas(document.querySelector("#capture")).then(canvas => {
    //   document.body.appendChild(canvas)
    // });
    // var c = new Croppie(document.getElementById("webcam-image"));
    // c.get();
    this.downloadBtn.setAttribute('href', this.hiddenCanvas.toDataURL());
    this.downloadBtn.setAttribute('download', "pathfinder.png")
  }

  clearCanvas() {
    // Clear both hidden and visible canvas
    this.clearVisibleCanvas();
    this.clearHiddenCanvas();
  }

  render () {
    return (
      <>
        <CanvasEngine 
        mode={CANVAS_RENDERING_MODE.LIVEVIEW}
        onDomReady={(el) => this.hiddenCanvas = el}
        registerClearCanvas={(clearCanvas) => this.clearHiddenCanvas = clearCanvas} />
        <BtnRecording />
        {!this.props.hidden &&
          <div className="flex fixed bottom-0 left-0 mb-2 ml-2 z-10">
            <a
              id="downloadFrame"
              ref={(el) => { this.downloadBtn = el }}
              className="btn btn-default p-0 rounded-r shadow cursor-pointer"
              onClick={() => this.downloadFrame()}
            >
              <SVG 
                className="w-10 h-10 svg-icon flex items-center" 
                cacheGetRequests={true}
                src={`/static/icons/ui/download.svg`} 
                aria-label="icon take screenshot"
              />
            </a>
          </div>
        }
      </>
    )
  }
}

export default LiveView
