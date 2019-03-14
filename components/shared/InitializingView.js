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
            flex: 1;
            align-items: center;
            justify-content: center;
          }
        `}</style>
      </div>
    )
  }
}

export default InitializingView
