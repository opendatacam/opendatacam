import React from 'react'
import { connect } from 'react-redux'; 

import { addCountingArea } from '../../statemanagement/app/CounterStateManagement';
import DrawInstructions from '../shared/DrawInstructions';
import CounterAreasEditor from '../shared/CounterAreasEditor';
import CanvasEngine from '../canvas/CanvasEngine';

import { MODE } from '../../utils/constants';
import CounterAreasVisualizer from '../shared/CounterAreasVisualizer';

class CounterView extends React.Component {

  render () {
    return (
      <div>
        {!this.props.isRecording &&
          <>
            {!this.props.isAtLeastOneCountingAreasDefined &&
              <DrawInstructions onConfirm={() => this.props.dispatch(addCountingArea())} />
            }
            {this.props.isAtLeastOneCountingAreasDefined &&
              <CounterAreasEditor />
            }
            <CanvasEngine mode={MODE.COUNTERVIEW} />
          </>
        }
        {this.props.isRecording && this.props.isAtLeastOneCountingAreasDefined &&
          <>
            <CounterAreasVisualizer />
            <CanvasEngine mode={MODE.COUNTERVIEW_RECORDING} />
          </>
        }
        {this.props.isRecording && !this.props.isAtLeastOneCountingAreasDefined &&
          <>
            <div className="modal">Not counting lines defined , Blablabalbla Define counting lines before start recording</div>
          </>
        }
        <style jsx>{`
            .modal {
              position: absolute;
              top: 50%;
              left: 50%;
              transform: translate(-50%, -50%);
            }
        `}</style>
      </div>
    )
  }
}

export default connect((state) => {

  return {
    isAtLeastOneCountingAreasDefined: Object.keys(state.counter.get('countingAreas').toJS()).length > 0,
    isRecording: state.app.getIn(['recordingStatus','isRecording'])
  }
})(CounterView);
