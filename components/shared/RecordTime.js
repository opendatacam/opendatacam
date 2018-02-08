import React, { Component } from 'react'
import { connect } from 'react-redux';

class RecordTime extends Component {

  render () {
    return (
      <div className="recordTime">
        <h2>{this.props.fps} FPS | {Math.round(this.props.time * 100) / 100} min</h2>
        <style jsx>{`
          .recordTime{
            position: fixed;
            right: 1.5rem;
            top: 2.5rem;
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
    time: counterData.get('currentTime') / 60
  }
})(RecordTime)
