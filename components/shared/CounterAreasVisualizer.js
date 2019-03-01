import React, { Component } from 'react'
import { connect } from 'react-redux';
import { Map } from 'immutable'

import { scalePoint } from '../../utils/resolution';
import SingleCounterArea from './SingleCounterArea';

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
              counterData={this.props.counterDashboard.get(countingAreasIds[index]) || Map()}
            />
        )}
      </React.Fragment>
    )
  }
}

export default connect(state => {
    // Enrich countingAreas with more data
    // Maybe persist directly this data so we can reuse here and in the canvas engine
    const countingAreas = state.counter.get('countingAreas').map((data, id) => {
        let location = data.get('location');
        return data.setIn(['location','center'], scalePoint(
          {
            x: Math.abs(location.getIn(['point2','x']) - location.getIn(['point1','x'])) / 2 + Math.min(location.getIn(['point1','x']), location.getIn(['point2','x'])),
            y: Math.abs(location.getIn(['point2','y']) - location.getIn(['point1','y'])) / 2 + Math.min(location.getIn(['point1','y']), location.getIn(['point2','y']))
          }, 
          state.viewport.get('canvasResolution').toJS(), 
          location.get('refResolution').toJS()
        ))
    })

    return {
      countingAreas: countingAreas.toJS(),
      counterDashboard: state.counter.get('counterDashboard')
    }
  })(CounterAreasVisualizer)
