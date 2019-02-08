import React, { Component } from 'react'
import { connect } from 'react-redux';

import { MODE } from '../../utils/constants';
import { setMode, startRecording, stopRecording } from '../../statemanagement/app/AppStateManagement';
import BtnRecording from '../shared/BtnRecording';

class UIControls extends Component {

  constructor(props) {
    super(props);
  }

  // handleStartRecording() {
  //   this.props.dispatch(startCounting());
  // }

  render () {
    return (
      <React.Fragment>
        <div className="nav">
          {this.props.recordingStatus.isRecording &&
            <div className="recording-status">Recording ...  | {this.props.recordingStatus.currentFPS} FPS</div>
          }
          <div>
            <button onClick={() => this.props.dispatch(setMode(MODE.LIVEVIEW))}>Live view</button>
            <button onClick={() => this.props.dispatch(setMode(MODE.COUNTERVIEW))}>Counter</button>
            <button onClick={() => this.props.dispatch(setMode(MODE.PATHVIEW))}>Path finder</button>
          </div>
        </div>
        <div className="nav-bottom">
          {!this.props.recordingStatus.isRecording &&
            <BtnRecording label="Start recording" onClick={() => this.props.dispatch(startRecording())} />
          }
          {this.props.recordingStatus.isRecording &&
            <BtnRecording label="Stop recording" stop onClick={() => this.props.dispatch(stopRecording())} />
          }
        </div>
        <style jsx>{`
          .nav {
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            z-index: 3;
          }

          .nav-bottom {
            position: absolute;
            bottom: 10px;
            left: 50%;
            transform: translateX(-50%);
            z-index: 3;
          }

          .recording-status {
            background-color: red;
            text-align: center;
            color: white;
            font-size: 14px;
            padding-top: 2px;
            padding-bottom: 2px;
            width: 100%;
            z-index: 3;
          }
        `}</style>
      </React.Fragment>
    )
  }
}

export default connect((state) => {
  return {
    recordingStatus: state.app.get('recordingStatus').toJS()
  }
})(UIControls);
