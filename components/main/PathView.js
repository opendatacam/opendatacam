import React, { Component } from 'react'
import { connect } from 'react-redux';

import CanvasEngine from '../canvas/CanvasEngine';
import { MODE, CANVAS_RENDERING_MODE } from '../../utils/constants';

class PathView extends Component {

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
        <CanvasEngine mode={CANVAS_RENDERING_MODE.PATHVIEW} hidden={this.props.hidden} />
      </>
    )
  }
}

export default PathView
