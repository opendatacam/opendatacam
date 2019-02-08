import React, { Component } from 'react'

class BtnCounting extends Component {

  render () {
    return (
      <div
        className="record"
        onClick={() => this.props.onClick()}
      >
        {this.props.iconStop &&
           <img src="/static/icons/icon-stop-recording.svg" />
        }
        {!this.props.iconStop && 
          <img src="/static/icons/icon-start-recording.svg" />
        }
        <h2>{this.props.label}</h2>
        <style jsx>{`
          .record {
            position: relative;
            text-align: center;
            z-index: 2;
            cursor: pointer;
          }
      
          .record h2{
            margin-top: 0.5rem;
          }
        `}</style>
      </div>
    )
  }
}

export default BtnCounting
