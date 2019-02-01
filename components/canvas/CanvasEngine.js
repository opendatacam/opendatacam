import React, { PureComponent } from 'react'
import { connect } from 'react-redux'
import raf from 'raf'

import LiveViewEngine from './engines/LiveViewEngine'

import GameEngineStateManager from '../../../statemanagement/app/GameEngineStateManager'

class CanvasEngine extends PureComponent {
  constructor (props) {
    super(props)
    this.lastFrameDrawn = -1
    this.loopUpdateCanvas = this.loopUpdateCanvas.bind(this)
  }

  componentDidMount () {
    // Rendering engine that have offscreen canvas to init on client
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
    if (this.lastFrameDrawn !== this.trackerData.frameNb) {
      // Clear previous frame
      this.clearCanvas();

      // Get current frame of the tracker
      // (sometimes it can be diffrent from the video framerate)

      // Get data from tracker for this frame
      let objectTrackerDataForThisFrame = this.props.objectTrackerData[frame]

      // Handle user actions
      // TODO Maybe for counting view something like this ??
      // if (GameEngineStateManager.getClicksBuffer().length > 0) {
        
      // }
      //  GameEngineStateManager.resetClickBuffer()

      /*
        Draw things for this frame
      */

      if(this.props.mode === MODE.LIVEVIEW) {
        LiveViewEngine.drawTrackerUIData(
          this.canvasContext,
          objectTrackerDataForThisFrame,
          this.props.canvasResolution,
          this.props.originalResolution
        )
      }
   
      this.lastFrameDrawn = GameEngineStateManager.getCurrentFrame()
    }
    raf(this.loopUpdateCanvas.bind(this))
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
          }
          .canvas {
            display: block;
            position: absolute;
            top: 0;
            left: 0;
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
        `}</style>
      </div>
    )
  }
}

export default connect(state => {

  return {
    trackerData: state.tracker.get('').toJS(),
    originalResolution: state.app.get('originalResolution').toJS(),
    canvasResolution: state.viewport.get('canvasResolution').toJS()
  }
})(CanvasEngine)
