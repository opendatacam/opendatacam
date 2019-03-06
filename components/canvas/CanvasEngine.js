import React, { PureComponent } from 'react'
import { connect } from 'react-redux'
import raf from 'raf'
import { CANVAS_RENDERING_MODE } from '../../utils/constants'

import LiveViewEngine from './engines/LiveViewEngine'
import PathViewEngine from './engines/PathViewEngine';

// import GameEngineStateManager from '../../../statemanagement/app/GameEngineStateManager'

class CanvasEngine extends PureComponent {
  constructor (props) {
    super(props)
    this.lastFrameDrawn = -1

    this.loopUpdateCanvas = this.loopUpdateCanvas.bind(this)
    this.rafHandle = null;
  }

  componentDidMount () {
    this.loopUpdateCanvas();
  }

  clearCanvas () {
    this.canvasContext.clearRect(
      0,
      0,
      this.props.canvasResolution.w,
      this.props.canvasResolution.h
    )
  }

  loopUpdateCanvas () {
    if (this.lastFrameDrawn !== this.props.trackerData.frameIndex) {
      // Clear previous frame
      if(this.props.mode !== CANVAS_RENDERING_MODE.PATHVIEW) {
        this.clearCanvas();
      }

      /*
        Draw things for this frame
      */

      if(this.props.mode === CANVAS_RENDERING_MODE.LIVEVIEW) {
        LiveViewEngine.drawTrackerData(
          this.canvasContext,
          this.props.trackerData.data,
          this.props.canvasResolution,
          this.props.originalResolution
        )
      }

      if(this.props.mode === CANVAS_RENDERING_MODE.COUNTERVIEW) {
        LiveViewEngine.drawTrackerDataCounterEditor(
          this.canvasContext,
          this.props.trackerData.data,
          this.props.countingAreas,
          this.props.canvasResolution,
          this.props.originalResolution
        )
      }

      if(this.props.mode === CANVAS_RENDERING_MODE.COUNTERVIEW_RECORDING) {
        LiveViewEngine.drawCountingAreas(
          this.canvasContext,
          this.props.countingAreas,
          this.props.canvasResolution
        )
        LiveViewEngine.drawTrackerDataCounterEditor(
          this.canvasContext,
          this.props.trackerData.data,
          this.props.countingAreas,
          this.props.canvasResolution,
          this.props.originalResolution
        )
      }

      if(this.props.mode === CANVAS_RENDERING_MODE.COUNTING_AREAS) {
        LiveViewEngine.drawCountingAreas(
          this.canvasContext,
          this.props.countingAreas,
          this.props.canvasResolution
        )
      }

      if(this.props.mode === CANVAS_RENDERING_MODE.PATHVIEW) {
        PathViewEngine.drawPaths(
          this.canvasContext,
          this.props.trackerData.data,
          this.props.canvasResolution,
          this.props.originalResolution
        )
      }

      this.lastFrameDrawn = this.props.trackerData.frameIndex;
    }
    this.rafHandle = raf(this.loopUpdateCanvas.bind(this))
  }

  componentWillUnmount() {
    if(this.rafHandle) {
      raf.cancel(this.rafHandle);
    }
  }

  render () {
    return (
      <div className={`canvas-container`}>
        {/* Canvas width and height must
        be set the the yolo detections resolution
        Then it is scaled down to viewport */}
        <canvas
          ref={el => {
            this.canvasEl = el
            if (this.canvasEl) {
              this.canvasContext = el.getContext('2d')
            }
          }}
          width={this.props.canvasResolution.w}
          height={this.props.canvasResolution.h}
          className='canvas'
        />
        <style jsx>{`
          .canvas-container {
            width: 100%;
            height: 100%;
            position: absolute;
            top: 0;
            left: 0;
            pointer-events: none;
            visibility: ${this.props.hidden ? 'hidden' : 'visible'};
          }
          .canvas {
            display: block;
            position: absolute;
            top: 0;
            left: 0;
            z-index: 1;
            background-color:  ${this.props.mode === CANVAS_RENDERING_MODE.PATHVIEW ? 'rgba(0,0,0,0.5)' : 'none'};
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
        `}</style>
      </div>
    )
  }
}

export default connect(state => {

  return {
    trackerData: state.tracker.get('trackerData').toJS(),
    originalResolution: state.viewport.get('originalResolution').toJS(),
    canvasResolution: state.viewport.get('canvasResolution').toJS(),
    countingAreas: state.counter.get('countingAreas')
  }
})(CanvasEngine)
