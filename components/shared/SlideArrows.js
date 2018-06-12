import React, { Component } from 'react'

class SlideArrows extends Component {

  render () {
    return (
      <React.Fragment>
        <img
          onClick={() => this.props.goToPrevious()}
          className="arrowLeft" 
          src="/static/icons/icon-arrow-left.svg"
        />
        <img
          onClick={() => this.props.goToNext()}
          className="arrowRight"
          src="/static/icons/icon-arrow-right.svg"
        />
        <style jsx>{`
          .arrowRight{
            position: fixed;
            right: 1.5rem;
            top: 50%;
            transform: translateY(-50%);
            z-index: 2;
          }
          .arrowLeft{
            position: fixed;
            left: 1.5rem;
            top: 50%;
            transform: translateY(-50%);
            z-index: 2;
          }
        `}</style>
      </React.Fragment>
    )
  }
}

export default SlideArrows
