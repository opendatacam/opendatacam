import React, { Component } from 'react'
import { connect } from 'react-redux';

class Menu extends Component {

  constructor(props) {
    super(props);
  }

  // handleStartRecording() {
  //   this.props.dispatch(startCounting());
  // }

  render() {
    return (
      <div className="overlay">
        <div className="menu text-default">
          <h5>Open data cam</h5>
          <p>Counter</p>
          <p>Counter</p>
          <p>Counter</p>
        </div>
        <style jsx>{`
          .overlay {
            position: fixed;
            left: 0;
            top: 0;
            width: 100%;
            height: 100%;
            background-color: rgba(0,0,0,0.8);
            z-index: 5;
          }
          .menu {
            position: absolute;
            top: 0;
            right: 0;
            bottom: 0;
            z-index: 3;
            min-width: 250px;
          }
        `}</style>
      </div>
    )
  }
}

export default connect((state) => {
  return {
    mode: state.app.get('mode')
  }
})(Menu);
