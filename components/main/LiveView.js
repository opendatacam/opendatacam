import React, { PureComponent } from 'react'
import { connect } from 'react-redux';

import CanvasEngine from '../canvas/CanvasEngine';
import { CANVAS_RENDERING_MODE } from '../../utils/constants';
import BtnRecording from '../shared/BtnRecording';

class LiveView extends PureComponent {

  constructor(props) {
    super(props);
  }


  componentDidMount() {

  }

  componentWillUnmount() {

  }

  render () {
    return (
      <>
        <CanvasEngine mode={CANVAS_RENDERING_MODE.LIVEVIEW} />
        <BtnRecording />
      </>
    )
  }
}

export default LiveView
