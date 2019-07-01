import React, { Component } from 'react'
import { connect } from 'react-redux';

import CanvasEngine from '../canvas/CanvasEngine';
import { CANVAS_RENDERING_MODE } from '../../utils/constants';
import { getTrackerAccuracySettings } from '../../statemanagement/app/TrackerStateManagement';
import TrackerAccuracyModal from './TrackerAccuracyModal';

class TrackerAccuracyView extends Component {

  constructor(props) {
    super(props);

    this.state = {
      showHelp: true
    }
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
        {this.state.showHelp &&
          <TrackerAccuracyModal
            close={() => this.setState({showHelp: false})}
          />
        }
        <CanvasEngine 
          mode={CANVAS_RENDERING_MODE.TRACKER_ACCURACY}
          fixedResolution={{
            w: this.props.canvasResolution.get('w') * getTrackerAccuracySettings().canvasResolutionFactor,
            h: this.props.canvasResolution.get('h') * getTrackerAccuracySettings().canvasResolutionFactor
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
})(TrackerAccuracyView)
