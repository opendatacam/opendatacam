import React, { Component } from 'react'

class SlideIndicators extends Component {

  render () {
    return (
      <div className="slideIndicators">
        {Object.keys(this.props.slides).map((slideKey, slideIndex) => 
          <div
            key={slideKey} 
            className={`indicator ${slideIndex === this.props.selectedSlideIndex ? 'active' : ''}`} 
          />
        )}
        <style jsx>{`
          .slideIndicators {
            position: fixed;
            top: 2.9rem;
            left: 50%;
            transform: translateX(-50%);
            display: flex;
            z-index:2;
          }
          .indicator{
            background-color: white;
            width: 7px;
            height: 7px;
            margin: 4px;
          }
        `}</style>
        <style jsx>{`
          .active{
            background-color: ${this.props.activeColor};
          }
        `}</style>
      </div>
    )
  }
}

export default SlideIndicators
