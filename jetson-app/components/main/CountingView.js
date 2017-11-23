import React from 'react'
import { connect } from 'react-redux';

class CountingView extends React.Component {

  constructor(props) {
    super(props);
  }

  componentDidMount() {
  }

  render () {
    return (
      <div className="counting-view">
        <div>Counting UI</div>
        <style jsx>{`
          .counting-view {
            width: 100%;
            height: 100%;
            position: absolute;
            top: 0;
            left: 0;
            color: white;
          }
        `}</style>
      </div>
    )
  }
}

export default CountingView;
