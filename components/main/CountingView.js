import React from 'react'
import { connect } from 'react-redux';

import { COLORS } from '../../utils/colors';

import { fetchCountingData } from '../../statemanagement/app/CounterStateManagement';
import SlideIndicators from '../shared/SlideIndicators';
import CounterData from '../shared/CounterData';

import EndCountingCTA from '../shared/EndCountingCTA';
import ActiveAreaIndicator from '../shared/ActiveAreaIndicator';
import Title from '../shared/Title';
import RecordTime from '../shared/RecordTime';

import { selectNextCountingArea, selectPreviousCountingArea } from  '../../statemanagement/app/CounterStateManagement'
import Loading from '../shared/Loading';
import PathVisualization from '../shared/PathVisualization';
import CountingAreasVisualizer from '../shared/CountingAreasVisualizer';

import Carousel from '../shared/Carousel'

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
        <img 
          className="webcam-frame"
          width="1280"
          height="720"
          src="/static/lastwebcamframe.jpg" 
        />
        <ActiveAreaIndicator
          color={COLORS[selectedSlide]}
        />
        <SlideIndicators
          slides={this.state.slides}
          selectedSlideIndex={this.state.selectedSlideIndex}
          activeColor={COLORS[selectedSlide]}
        />
        <RecordTime />
        <Carousel onChangeSelectedSlide={(selectedIndex) => this.setState({selectedSlideIndex: selectedIndex})}>
          {this.state.slides.map((slide) => 
            <React.Fragment key={slide}>
              {slide !== 'pathvisualization' &&
                <React.Fragment>
                  <CounterData countingArea={slide} />
                  <CountingAreasVisualizer
                    color={slide}
                  />
                </React.Fragment>
              }
              {slide === 'pathvisualization' &&
                <PathVisualization />
              }
            </React.Fragment>
          )}
        </Carousel>
        <EndCountingCTA />
        <style jsx>{`
          .counting-view {
            width: 100%;
            height: 100%;
            position: absolute;
            top: 0;
            left: 0;
            color: white;
            overflow-x: hidden;
          }

          @media (min-aspect-ratio: 16/9) {
            .webcam-frame {
              width: 100%;
              height: auto;
            }
          }

          @media (max-aspect-ratio: 16/9) {
            .webcam-frame {
              width: auto;
              height: 100%;
            }
          }
          
          .webcam-frame {
            opacity: 0.2;
            position: absolute;
            top: 0;
            right: 0;
            left: 0;
            bottom: 0;
            z-index: 2;
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
