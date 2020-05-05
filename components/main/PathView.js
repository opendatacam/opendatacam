import React, { PureComponent } from 'react'

import CanvasEngine from '../canvas/CanvasEngine';
import { CANVAS_RENDERING_MODE } from '../../utils/constants';
import BtnRecording from '../shared/BtnRecording';
import SVG from 'react-inlinesvg';

class PathView extends PureComponent {

  constructor(props) {
    super(props);
  }


  componentDidMount() {

  }

  componentWillUnmount() {

  }

  registerHiddenCanvas(el) {
    this.hiddenCanvas = el;
  }

  downloadFrame() {
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
          mode={CANVAS_RENDERING_MODE.PATHVIEW} 
          hidden={this.props.hidden} 
          registerClearCanvas={(clearCanvas) => this.clearVisibleCanvas = clearCanvas}
        />
        {/* Always have a secondary always hidden canvas to take screenshots in the full resolution (doesn't matter which ratio the screen is into) */}
        <CanvasEngine 
          fixedResolution={{
            w: 1280,
            h: 720
          }}
          mode={CANVAS_RENDERING_MODE.PATHVIEW} 
          onDomReady={(el) => this.hiddenCanvas = el}
          registerClearCanvas={(clearCanvas) => this.clearHiddenCanvas = clearCanvas}
          hidden={true} 
        />
        {!this.props.hidden &&
          <BtnRecording />
        }
        {!this.props.hidden &&
          <div className="flex fixed bottom-0 left-0 mb-2 ml-2 z-10">
            <button
              className="btn btn-default p-0 rounded-l shadow"
              onClick={() => this.clearCanvas()}
            >
              <SVG 
                className="w-10 h-10 svg-icon flex items-center" 
                cacheRequests={true}
                src={`/static/icons/ui/delete.svg`} 
                aria-label="icon delete"
              />
            </button>
            <a
              id="downloadFrame"
              ref={(el) => { this.downloadBtn = el }}
              className="btn btn-default p-0 rounded-r shadow cursor-pointer"
              onClick={() => this.downloadFrame()}
            >
              <SVG 
                className="w-10 h-10 svg-icon flex items-center" 
                cacheRequests={true}
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

export default PathView
