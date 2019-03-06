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
            <div className="recording-status text-sm py-1">Recording ...  | {this.props.recordingStatus.currentFPS} FPS</div>
          }
          <div className="nav-left mt-2 ml-2 shadow">
            <button 
              className={`btn btn-default rounded-l ${this.props.mode === MODE.LIVEVIEW ? 'btn-default--active' : ''}`}
              onClick={() => this.props.dispatch(setMode(MODE.LIVEVIEW))}
            >
              Live view
            </button>
            <button
              className={`btn btn-default border-r border-l border-default-soft border-solid ${this.props.mode === MODE.COUNTERVIEW ? 'btn-default--active' : ''}`}
              onClick={() => this.props.dispatch(setMode(MODE.COUNTERVIEW))}
            >
              Counter
            </button>
            <button
              className={`btn btn-default rounded-r ${this.props.mode === MODE.PATHVIEW ? 'btn-default--active' : ''}`}
              onClick={() => this.props.dispatch(setMode(MODE.PATHVIEW))}
            >
              Path finder
            </button>
          </div>
          <div className="nav-right mt-2 mr-2 shadow">
            <button
              className={`btn btn-default rounded-l ${this.props.mode === MODE.CONSOLEVIEW ? 'btn-default--active' : ''}`}
              onClick={() => this.props.dispatch(setMode(MODE.DATAVIEW))}>
              Data
            </button>
            <button 
              className={`btn btn-default rounded-r border-l border-default-soft border-solid ${this.props.mode === MODE.CONSOLEVIEW ? 'btn-default--active' : ''}`}
              onClick={() => this.props.dispatch(setMode(MODE.CONSOLEVIEW))}
            >
              Console
            </button>
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
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            z-index: 3;
          }

          .nav-left {
            display: inline-block;
          }

          .nav-right {
            position: absolute;
            right: 0;
            display: inline-block;
          }

          .nav-bottom {
            position: fixed;
            bottom: 10px;
            left: 50%;
            transform: translateX(-50%);
            z-index: 3;
          }

          .recording-status {
            background-color: red;
            text-align: center;
            color: white;
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
    recordingStatus: state.app.get('recordingStatus').toJS(),
    mode: state.app.get('mode')
  }
})(UIControls);
