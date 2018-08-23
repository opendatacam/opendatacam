import React, { Component } from 'react'

class BtnScreenshot extends Component {

  render () {
    return (
      <div
        className="btn-screenshot"
        onClick={() => this.props.onClick()}
      >
        <img src="/static/icons/icon-screenshot.svg" />
        <h2>Save frame</h2>
        <style jsx>{`
          .btn-screenshot{
            position: relative;
            text-align: center;
            z-index: 2;
            cursor: pointer;
          }
      
          .btn-screenshot h2{
            margin-top: 0.5rem;
          }
        `}</style>
      </div>
    )
  }
}

export default BtnScreenshot
