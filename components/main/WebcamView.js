import React from 'react'
import { connect } from 'react-redux'; 

import { startCounting, drawInstructionsShown } from '../../statemanagement/app/AppStateManagement';
import DrawInstructions from '../shared/DrawInstructions';
import CountingAreasEditor from '../shared/CountingAreasEditor';
import BtnStartCounting from '../shared/BtnStartCounting';

class WebcamView extends React.Component {

  constructor(props) {
    super(props);
    this.handleStartCounting = this.handleStartCounting.bind(this);
  }

  handleStartCounting() {
    this.props.dispatch(startCounting());
  }

  render () {
    return (
      <div className="webcam-view">
        {!this.props.drawInstructionsShown &&
          <DrawInstructions onConfirm={() => this.props.dispatch(drawInstructionsShown())} />
        }
        {this.props.drawInstructionsShown &&
          <CountingAreasEditor />
        }
        {this.props.isOneCountingAreaDefined &&
          <BtnStartCounting onClick={() => this.handleStartCounting()} />
        }
      </div>
    )
  }
}

export default connect((state) => {

  let isOneCountingAreaDefined = Object.values(state.counter.get('countingAreas').toJS()).filter((value) => value !== null).length > 0

  return {
    isOneCountingAreaDefined,
    drawInstructionsShown: state.app.get('drawInstructionsShown')
  }
})(WebcamView);
