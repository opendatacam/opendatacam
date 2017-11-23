import React from 'react'
import { connect } from 'react-redux';

import { fetchCountingData } from '../../statemanagement/app/CounterStateManagement';
import { stopCounting } from '../../statemanagement/app/AppStateManagement';

class CountingView extends React.Component {

  constructor(props) {
    super(props);
  }

  componentDidMount() {
    // Long poll
    this.fetchData = setInterval(() => {
      this.props.dispatch(fetchCountingData());
    }, 1000);
  }

  componentWillUnmount() {
    clearInterval(this.fetchData);
  }

  render () {
    return (
      <div className="counting-view">
        <div>Counting UI</div>
        <button onClick={() => this.props.dispatch(stopCounting())}>
          Stop counting
        </button>
        <div>{JSON.stringify(this.props.countingData.toJS())}</div>
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

export default connect((state) => {
  return {
    countingData: state.counter.get('countingData')
  }
})(CountingView);
