import React, { Component } from 'react'
import { connect } from 'react-redux';
import { Map } from 'immutable'

import { scalePoint } from '../../utils/resolution';
import SingleCounterArea from './SingleCounterArea';
import { computeCountingAreasCenters } from '../../statemanagement/app/CounterStateManagement';

/* 
  Here we suppose that the dom parent element is positionned the same as the canvas
*/

class CounterAreasVisualizer extends Component {

  constructor(props) {
    super(props);
  }


  componentDidMount() {

  }

  componentWillUnmount() {

  }

  render () {

    const countingAreasIds = Object.keys(this.props.countingAreas);

    return (
      <React.Fragment>
        {Object.values(this.props.countingAreas).map((area, index) =>
            /* TODO Create a CounterArea component */ 
            <SingleCounterArea 
              key={countingAreasIds[index]}
              area={area}
              counterData={this.props.counterSummary.get(countingAreasIds[index]) || Map()}
            />
        )}
      </React.Fragment>
    )
  }
}

export default connect(state => {
    // Enrich countingAreas with more data
    // Maybe persist directly this data so we can reuse here and in the canvas engine
    const countingAreasWithCenters = computeCountingAreasCenters(state.counter.get('countingAreas'), state.viewport.get('canvasResolution'))

    return {
      countingAreas: countingAreasWithCenters.toJS(),
      counterSummary: state.counter.get('counterSummary')
    }
  })(CounterAreasVisualizer)
