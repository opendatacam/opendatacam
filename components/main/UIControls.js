import React, { Component } from 'react'
import { connect } from 'react-redux';

import { MODE } from '../../utils/constants';
import { setMode, startRecording, stopRecording, showMenu } from '../../statemanagement/app/AppStateManagement';
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
          <div className="flex">
            <div className="nav-left mt-2 ml-2 shadow flex">
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
                Pathfinder
              </button>
            </div>
            <div className="nav-right mt-2 mr-2 shadow flex">
              <button
                className={`btn btn-default rounded-l ${this.props.mode === MODE.DATAVIEW ? 'btn-default--active' : ''}`}
                onClick={() => this.props.dispatch(setMode(MODE.DATAVIEW))}>
                Data
              </button>
              <button 
                className={`btn btn-default rounded-r border-l border-default-soft border-solid ${this.props.mode === MODE.CONSOLEVIEW ? 'btn-default--active' : ''}`}
                onClick={() => this.props.dispatch(setMode(MODE.CONSOLEVIEW))}
              >
                Console
              </button>
              <button 
                className={`btn btn-default ml-2 py-0 px-3 rounded border border-default-soft border-solid flex items-center ${this.props.mode === MODE.CONSOLEVIEW ? 'btn-default--active' : ''}`}
                onClick={() => this.props.dispatch(showMenu())}
              >
                <img src="/static/icons/icon-menu.svg" className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
        <style jsx>{`
          .nav {
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            z-index: 3;
          }

          .nav-right {
            position: absolute;
            right: 0;
          }

          .recording-status {
            background-color: #e3342f;
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
