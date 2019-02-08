import React, { Component } from 'react'

class BtnStartCounting extends Component {

  render () {
    return (
      <div
        className="record"
        onClick={() => this.props.onClick()}
      >
        <img src="/static/icons/icon-start-recording.svg" />
        <h2>Start Recording</h2>
        <style jsx>{`
          .record{
            position: fixed;
            bottom: 1.5rem;
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

export default BtnStartCounting
