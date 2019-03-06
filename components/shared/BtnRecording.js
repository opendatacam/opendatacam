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
        <h3 className="btn-record-label text-default">{this.props.label}</h3>
        <style jsx>{`
          .btn-record {
            position: relative;
            text-align: center;
            z-index: 2;
            cursor: pointer;
          }
      
          .btn-record-label {
            margin-top: 0.5rem;
            text-shadow: 0px 2px 4px rgba(73, 73, 73, 0.5);
          }
        `}</style>
      </div>
    )
  }
}

export default BtnRecording
