import React, { Component } from 'react'

class BtnRecording extends Component {

  render () {
    return (
      <div
        className="btn-record"
        onClick={() => this.props.onClick()}
      >
        {this.props.stop &&
           <img src="/static/icons/icon-stop-recording.svg" />
        }
        {!this.props.stop && 
          <img src="/static/icons/icon-start-recording.svg" />
        }
        <h2>{this.props.label}</h2>
        <style jsx>{`
          .btn-record {
            position: relative;
            text-align: center;
            z-index: 2;
            cursor: pointer;
          }
      
          .btn-record h2{
            margin-top: 0.5rem;
          }
        `}</style>
      </div>
    )
  }
}

export default BtnRecording
