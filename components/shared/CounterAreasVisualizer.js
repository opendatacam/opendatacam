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

    const countingAreasKeys = Object.keys(this.props.countingAreas);

    return (
      <React.Fragment>
        {Object.values(this.props.countingAreas).map((area, index) =>
            /* TODO Create a CounterArea component */ 
            <SingleCounterArea 
              key={countingAreasKeys[index]}
              area={area}
              counterData={this.props.counterDashboard.get(countingAreasKeys[index]) || Map()}
              areaKey={countingAreasKeys[index]}
            />
        )}
      </React.Fragment>
    )
  }
}

export default connect(state => {
    // Enrich countingAreas with more data
    // Maybe persist directly this data so we can reuse here and in the canvas engine
    const countingAreas = state.counter.get('countingAreas').map((area, color) => {
        return area.set('center', scalePoint(
          {
            x: Math.abs(area.getIn(['point2','x']) - area.getIn(['point1','x'])) / 2 + Math.min(area.getIn(['point1','x']), area.getIn(['point2','x'])),
            y: Math.abs(area.getIn(['point2','y']) - area.getIn(['point1','y'])) / 2 + Math.min(area.getIn(['point1','y']), area.getIn(['point2','y']))
          }, 
          state.viewport.get('canvasResolution').toJS(), 
          area.get('refResolution').toJS()
        ))
    })

    return {
      countingAreas: countingAreas.toJS(),
      counterDashboard: state.counter.get('counterDashboard')
    }
  })(CounterAreasVisualizer)
