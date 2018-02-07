import React from 'react'
import { connect } from 'react-redux';

import { fetchCountingData } from '../../statemanagement/app/CounterStateManagement';
import { stopCounting } from '../../statemanagement/app/AppStateManagement';
import SlideIndicators from '../shared/SlideIndicators';
import CounterData from '../shared/CounterData';
import SlideArrows from '../shared/SlideArrows';
import EndCountingCTA from '../shared/EndCountingCTA';
import ActiveAreaIndicator from '../shared/ActiveAreaIndicator';
import Title from '../shared/Title';
import RecordTime from '../shared/RecordTime';

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
        {/* <div>Counting UI</div>
        <button onClick={() => this.props.dispatch(stopCounting())}>
          Stop counting
        </button>
        <div>{JSON.stringify(this.props.countingData.toJS())}</div> */}
        <ActiveAreaIndicator />
        <Title />
        <RecordTime />
        <SlideIndicators />
        <CounterData />
        <SlideArrows />
        <EndCountingCTA />
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
