import React, { Component } from 'react'

class BtnStopCounting extends Component {

  render () {
    return (
      <div
        className="record"
        onClick={() => this.props.onClick()}
      >
        <img src="/static/icons/icon-stop-recording.svg" />
        <h2>Stop counting</h2>
        <style jsx>{`
          .record{
            position: fixed;
            bottom: 0;
            left: 50%;
            transform: translateX(-50%);
            text-align: center;
          }
      
          .record h2{
            margin-top: 0.5rem;
          }
        `}</style>
      </div>
    )
  }
}

export default BtnStopCounting
