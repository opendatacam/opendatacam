import React, { Component } from 'react'
import { connect } from 'react-redux';

import { MODE, CIRCLE_RADIUS } from '../../utils/constants';
import { COLORS } from '../../utils/colors';

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
            <div 
                key={countingAreasKeys[index]}
                className="circle"
                style={{
                    top: area.center.y - CIRCLE_RADIUS / 2, 
                    left: area.center.x - CIRCLE_RADIUS / 2,
                    backgroundColor: COLORS[countingAreasKeys[index]]
                }} 
            >
             {this.props.counterDashboard.getIn([countingAreasKeys[index],'_total']) || 0}
            </div>
        )}
        <style jsx>{`
            .circle {
                position: absolute;
                border-radius: ${CIRCLE_RADIUS}px;
                z-index: 2;
                min-width: ${CIRCLE_RADIUS}px;
                height: ${CIRCLE_RADIUS}px;
                line-height: ${CIRCLE_RADIUS}px;
                font-size: 16px;
                font-weight: bold;
                padding-left: 5px;
                padding-right: 5px;
                color: black;
                text-align: center;
                cursor: pointer;
            }    
        `}</style>
      </React.Fragment>
    )
  }
}

export default connect(state => {

    // Enrich countingAreas with more data
    // Maybe persist directly this data so we can reuse here and in the canvas engine
    const countingAreas = state.counter.get('countingAreas').map((area, color) => {
        return area.set('center', {
            x: Math.abs(area.getIn(['point2','x']) - area.getIn(['point1','x'])) / 2 + Math.min(area.getIn(['point1','x']), area.getIn(['point2','x'])),
            y: Math.abs(area.getIn(['point2','y']) - area.getIn(['point1','y'])) / 2 + Math.min(area.getIn(['point1','y']), area.getIn(['point2','y']))
        })
    })

    return {
      countingAreas: countingAreas.toJS(),
      counterDashboard: state.counter.get('counterDashboard')
    }
  })(CounterAreasVisualizer)
