import React, { Component } from 'react'
import { connect } from 'react-redux';

import CanvasEngine from '../canvas/CanvasEngine';
import { MODE, CANVAS_RENDERING_MODE } from '../../utils/constants';
import BtnRecording from '../shared/BtnRecording';

class HeatmapView extends Component {

  constructor(props) {
    super(props);
  }


  componentDidMount() {

  }

  componentWillUnmount() {

  }

  clearCanvas() {
    // Clear both hidden and visible canvas
    this.clearVisibleCanvas();
  }

  render () {
    return (
      <>
        <CanvasEngine 
          mode={CANVAS_RENDERING_MODE.TRACKER_ACCURACY}
          fixedResolution={{
            w: this.props.canvasResolution.get('w') / 10 ,
            h: this.props.canvasResolution.get('h') / 10
          }}
          hidden={this.props.hidden} 
          registerClearCanvas={(clearCanvas) => this.clearVisibleCanvas = clearCanvas}
        />
      </>
    )
  }
}

export default connect((state) => {
  return {
    canvasResolution: state.viewport.get('canvasResolution')
  }
})(HeatmapView)
