import React from 'react'
import { connect } from 'react-redux'; 

import { addCountingArea } from '../../statemanagement/app/CounterStateManagement';
import DrawInstructions from '../shared/DrawInstructions';
import CountingAreasEditor from '../shared/CountingAreasEditor';
import BtnStartCounting from '../shared/BtnStartCounting';
import CanvasEngine from '../canvas/CanvasEngine';

import { MODE } from '../../utils/constants';

class CounterView extends React.Component {

  constructor(props) {
    super(props);
    // this.handleStartCounting = this.handleStartCounting.bind(this);
  }

  // handleStartCounting() {
  //   this.props.dispatch(startCounting());
  // }

  render () {
    return (
      <div className="webcam-view">
        {Object.keys(this.props.countingAreas).length === 0 &&
          <DrawInstructions onConfirm={() => this.props.dispatch(addCountingArea())} />
        }
        {Object.keys(this.props.countingAreas).length > 0 &&
          <CountingAreasEditor />
        }
        <CanvasEngine mode={MODE.COUNTINGVIEW} />
        {/* {this.props.isOneCountingAreaDefined &&
          <BtnStartCounting onClick={() => this.handleStartCounting()} />
        } */}
      </div>
    )
  }
}

export default connect((state) => {

  // let isOneCountingAreaDefined = Object.values(state.counter.get('countingAreas').toJS()).filter((value) => value !== null).length > 0
  // console.log(Object.keys(state.counter.get('countingAreas')));

  return {
    countingAreas: state.counter.get('countingAreas').toJS()
  }
})(CounterView);
