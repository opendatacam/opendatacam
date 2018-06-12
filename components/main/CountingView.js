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
import Loading from '../shared/Loading';
import PathVisualization from '../shared/PathVisualization';

class CountingView extends React.Component {

  constructor(props) {
    super(props);

    this.state = {
      slides: [],
      selectedSlideIndex: 0
    }
  }

  componentWillReceiveProps(newProps) {
    if(newProps.isCounting !== this.props.isCounting) {
        if(newProps.isCounting === true &&
          !this.fetchData) {
          this.startLongPolling();
        }

        if(newProps.isCounting === false &&
          this.fetchData) {
          clearInterval(this.fetchData);
        }
    }
  }

  startLongPolling() {
    this.fetchData = setInterval(() => {
      this.props.dispatch(fetchCountingData());
    }, 1000);
  }

  componentDidMount() {
    this.startLongPolling();

    // Set slides, all counting colors and pathvisualization
    this.setState({
      slides: [
        ...Object.keys(this.props.countingAreas.toJS()),
        'pathvisualization'
      ]
    })
  }

  selectNextSlide() {
    if((this.state.selectedSlideIndex + 1) > (this.state.slides.length - 1)) {
      // Select first item
      this.setState({
        selectedSlideIndex: 0
      })
    } else {
      this.setState({
        selectedSlideIndex: this.state.selectedSlideIndex + 1
      })
    }
  }

  selectPreviousSlide() {
    if((this.state.selectedSlideIndex - 1) < 0) {
      // Select last item
      this.setState({
        selectedSlideIndex: this.state.slides.length - 1
      })
    } else {
      this.setState({
        selectedSlideIndex: this.state.selectedSlideIndex - 1
      })
    }
  }

  componentWillUnmount() {
    clearInterval(this.fetchData);
  }

  render () {

    const selectedSlide = this.state.slides[this.state.selectedSlideIndex];

    return (
      <div className="counting-view">
        {this.props.yoloIsStarting &&
          <div className="loading-overlay">
            <Loading />
          </div>
        }
        <ActiveAreaIndicator
          color={COLORS[selectedSlide]}
        />
        {/* <Title /> */}
        <RecordTime />
        <SlideIndicators
          slides={this.state.slides}
          selectedSlideIndex={this.state.selectedSlideIndex}
          activeColor={COLORS[selectedSlide]}
        />
        <PathVisualization visible={selectedSlide === 'pathvisualization'} />
        {selectedSlide !== 'pathvisualization' &&
          <CounterData selectedCountingArea={this.state.slides[this.state.selectedSlideIndex]} />
        }
        <SlideArrows 
          goToNext={() => this.selectNextSlide()}
          goToPrevious={() => this.selectPreviousSlide()}
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

          .loading-overlay {
            position: fixed;
            z-index: 5;
            top: 0;
            bottom: 0;
            right: 0;
            left: 0;
            display: flex;
            background-color: rgba(0,0,0,0.8);
          }
        `}</style>
      </div>
    )
  }
}

export default connect((state) => {

  return {
    countingAreas: state.counter.get('countingAreas'),
    countingData: state.counter.get('countingData'),
    selectedCountingArea: state.counter.get('selectedCountingArea'),
    yoloStarted: state.counter.getIn(['countingData', 'yoloStarted']),
    yoloIsStarting: state.counter.getIn(['countingData', 'yoloIsStarting']),
    isCounting: state.app.get('isCounting')
  }
})(CountingView);
