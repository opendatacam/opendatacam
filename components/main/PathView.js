import React, { Component } from 'react'
import { connect } from 'react-redux';

import CanvasEngine from '../canvas/CanvasEngine';
import { MODE } from '../../utils/constants';

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
        <CanvasEngine mode={MODE.PATHVIEW} />
      </>
    )
  }
}

export default PathView
