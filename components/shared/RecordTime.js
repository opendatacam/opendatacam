import React, { Component } from 'react'

class RecordTime extends Component {

  render () {
    return (
      <div className="recordTime">
        <h2>1.22 min</h2>
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

export default RecordTime
