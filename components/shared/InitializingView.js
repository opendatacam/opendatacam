import React, { Component } from 'react'

class InitializingView extends Component {

  constructor(props) {
    super(props);
  }

  render () {
    return (
      <div className="initializing-view">
        <h2 className="text-white">Initializing Open Data Cam</h2>
        <style jsx>{`
          .initializing-view {
            display: flex;
            align-items: center;
            justify-content: center;
            width: 100%;
            height: 100%;
            background-color: black;
          }
        `}</style>
      </div>
    )
  }
}

export default InitializingView
