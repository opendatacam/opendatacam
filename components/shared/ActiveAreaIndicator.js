import React, { Component } from 'react'

class ActiveAreaIndicator extends Component {

  render () {
    return (
      <div className="activeAreaIndicator">
        <style jsx>{`
          .activeAreaIndicator{
            width: 100%;
            height: 0.5rem;
            background-color: ${this.props.color};
            position: absolute;
            z-index: 2;
          }
        `}</style>
      </div>
    )
  }
}

export default ActiveAreaIndicator
