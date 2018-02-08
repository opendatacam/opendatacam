import React, { Component } from 'react'
import { connect } from 'react-redux'

import { COLORS } from '../../utils/colors';

class SlideIndicators extends Component {

  render () {
    return (
      <div className="slideIndicators">
        {Object.keys(this.props.countingAreas.toJS()).map((countingAreaKey) => 
          <div
            key={countingAreaKey} 
            className={`indicator ${countingAreaKey === this.props.selectedCountingArea ? 'active' : ''}`} 
          />
        )}
        <style jsx>{`
          .slideIndicators {
            position: fixed;
            top: 2.9rem;
            left: 50%;
            transform: translateX(-50%);
            display: flex;
          }
          .indicator{
            background-color: white;
            width: 7px;
            height: 7px;
            margin: 4px;
          }
        `}</style>
        <style jsx>{`
          .active{
            background-color: ${this.props.selectedCountingAreaColor};
          }
        `}</style>
      </div>
    )
  }
}

export default connect((state) => {
  return {
    countingAreas: state.counter.get('countingAreas'),
    selectedCountingArea: state.counter.get('selectedCountingArea'),
    selectedCountingAreaColor: COLORS[state.counter.get('selectedCountingArea')]
  }
})(SlideIndicators)
