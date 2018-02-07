import React, { Component } from 'react'

class SlideArrows extends Component {

  render () {
    return (
      <React.Fragment>
        <img className="arrowLeft" src="/static/icons/icon-arrow-left.svg" />
        <img className="arrowRight" src="/static/icons/icon-arrow-right.svg" />
        <style jsx>{`
          .arrowRight{
            position: fixed;
            right: 1.5rem;
            top: 50%;
            transform: translateY(-50%);
          }
          .arrowLeft{
            position: fixed;
            left: 1.5rem;
            top: 50%;
            transform: translateY(-50%);
            opacity: 0.1;
          }
        `}</style>
      </React.Fragment>
    )
  }
}

export default SlideArrows
