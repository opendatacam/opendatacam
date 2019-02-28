import React, { Component } from 'react'
import { connect } from 'react-redux';

class DataView extends Component {

  constructor(props) {
    super(props);
  }


  componentDidMount() {

  }

  componentWillUnmount() {

  }

  render () {
    return (
        <div className="data-view">
          Data blablabala
          <style jsx>{`
            .data-view {
              width: 100%;
              height: 100%;
              position: absolute;
              top: 0;
              left: 0;
              bottom: 0;
              right: 0;
              background-color: black;
            }
          `}</style>
        </div>
    )
  }
}

export default DataView
