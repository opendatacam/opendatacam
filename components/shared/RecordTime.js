import React, { Component } from 'react'
import { connect } from 'react-redux';

class RecordTime extends Component {

  render () {
    return (
      <div className="recordTime">
        <h2>{this.props.fps} FPS</h2>
        <h2>{this.props.nbItemsTrackedThisFrame.toLocaleString(undefined, {minimumIntegerDigits: 2})} object tracked</h2>
        <h2>{Math.round(this.props.time * 100) / 100} min</h2>
        <style jsx>{`
          .recordTime{
            position: fixed;
            right: 1.5rem;
            top: 1.5rem;
          }

          h2 {
            margin: 0.5px;
            text-align: right;
          }
        `}</style>
      </div>
    )
  }
}

export default connect((state) => {

  const counterData = state.counter.get('countingData');

  return {
    fps: Math.round(counterData.get('currentFps')),
    time: counterData.get('currentTime') / 60,
    nbItemsTrackedThisFrame: counterData.get('nbItemsTrackedThisFrame')
  }
})(RecordTime)
