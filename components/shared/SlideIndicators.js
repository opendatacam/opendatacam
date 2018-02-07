import React, { Component } from 'react'

class SlideIndicators extends Component {

  render () {
    return (
      <div className="slideIndicators">
        <div className="indicator active"></div>
        <div className="indicator"></div>
        <div className="indicator"></div>
        <style jsx>{`
          .slideIndicators {
            position: fixed;
            top: 2.9rem;
            left: 50%;
            transform: translateX(-50%);
            display: flex;
          }
          .indicator{
            background-color: white;
            width: 7px;
            height: 7px;
            margin: 4px;
          }
          .active{
            background-color: #FFE700;
          }
        `}</style>
      </div>
    )
  }
}

export default SlideIndicators
