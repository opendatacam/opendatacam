import React, { Component } from 'react'

class BtnScreenshot extends Component {

  render () {
    return (
      <div
        className="btn-screenshot"
        onClick={() => this.props.onClick()}
      >
        <div className="btn-screenshot-icon">
          <img src="/static/icons/icon-screenshot.svg" />
        </div>
        <h2>Save Frame</h2>
        <style jsx>{`
          .btn-screenshot{
            position: relative;
            text-align: center;
            z-index: 2;
            cursor: pointer;
          }

          .btn-screenshot-icon {
            display: flex;
            flex-direction: column;
            justify-content: center;
            align-items: center;
            height: 60px;
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
