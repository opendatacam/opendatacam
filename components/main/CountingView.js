import React from 'react'
import { connect } from 'react-redux';

import { COLORS } from '../../utils/colors';

import { fetchCountingData } from '../../statemanagement/app/CounterStateManagement';
import SlideIndicators from '../shared/SlideIndicators';
import CounterData from '../shared/CounterData';
import SlideArrows from '../shared/SlideArrows';
import EndCountingCTA from '../shared/EndCountingCTA';
import ActiveAreaIndicator from '../shared/ActiveAreaIndicator';
import Title from '../shared/Title';
import RecordTime from '../shared/RecordTime';

import { selectNextCountingArea, selectPreviousCountingArea } from  '../../statemanagement/app/CounterStateManagement'

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
        <ActiveAreaIndicator
          color={COLORS[this.props.selectedCountingArea]}
        />
        {/* <Title /> */}
        <RecordTime />
        <SlideIndicators />
        <CounterData />
        <SlideArrows 
          goToNext={() => this.props.dispatch(selectNextCountingArea())}
          goToPrevious={() => this.props.dispatch(selectPreviousCountingArea())}
        />
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
    countingData: state.counter.get('countingData'),
    selectedCountingArea: state.counter.get('selectedCountingArea')
  }
})(CountingView);
