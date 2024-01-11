import React from 'react';
import { connect } from 'react-redux';
import axios from 'axios';

import AskLandscape from './shared/AskLandscape';
import WebcamStream from './shared/WebcamStream';

import { initViewportListeners } from '../statemanagement/app/ViewportStateManagement';
import { loadConfig, restoreUiSettings, startListeningToServerData } from '../statemanagement/app/AppStateManagement';
import { restoreCountingAreas } from '../statemanagement/app/CounterStateManagement';
import LiveView from './main/LiveView';
import CounterView from './main/CounterView';
import PathView from './main/PathView';
import ConsoleView from './main/ConsoleView';
import DataView from './main/DataView';

import { MODE } from '../utils/constants';
import UIControls from './main/UIControls';
import Menu from './main/Menu';
import InitializingView from './shared/InitializingView';
import { loadUserSettings } from '../statemanagement/app/UserSettingsStateManagement';
import TrackerAccuracyView from './shared/TrackerAccuracyView';

class MainPage extends React.PureComponent {
  constructor(props) {
    super(props);

    this.state = {
      droppedFile: false,
    };
  }

  componentDidMount() {
    this.props.dispatch(initViewportListeners());
    // TODO Handle specifying canvas size + resizing here, copy from beatthetraffic
    this.props.dispatch(loadUserSettings());
    // TODO See how we handle the YOLO on / off situation
    this.props.dispatch(startListeningToServerData());
    // Make config available on window global
    this.props.dispatch(loadConfig());
    this.props.dispatch(restoreUiSettings());
    this.props.dispatch(restoreCountingAreas());
  }

  onDrop(event) {
    event.preventDefault();
    this.setState({
      droppedFile: true,
    });
    const formData = new FormData();
    formData.append('video', event.dataTransfer.files[0]);
    axios.post('/files', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    }).then(() => {
      console.log('success');
      this.setState({
        droppedFile: false,
      });
      // Todo here
      // Ping API endpoint to restart YOLO on this file
    }, (error) => {
      console.log('error');
      this.setState({
        droppedFile: false,
      });
    });
  }

  render() {
    return (
      <div
        className="main-page"
        onDragOver={(event) => event.preventDefault()}
        onDragStart={(event) => event.preventDefault()}
        onDrop={(event) => this.onDrop(event)}
      >
        {this.props.deviceOrientation === 'portrait'
          && <AskLandscape />}
        {!this.props.isListeningToYOLO
          && (
          <InitializingView
            requestedFileRecording={this.props.requestedFileRecording}
            droppedFile={this.state.droppedFile}
          />
          )}
        {this.props.isListeningToYOLO && this.state.droppedFile
          && (
          <InitializingView
            requestedFileRecording={this.props.requestedFileRecording}
            droppedFile={this.state.droppedFile}
          />
          )}
        {this.props.isListeningToYOLO && !this.state.droppedFile
          && (
          <>
            <UIControls />
            {this.props.showMenu
              && <Menu />}
            {this.props.mode === MODE.DATAVIEW
              && <DataView />}
            {this.props.mode === MODE.CONSOLEVIEW
              && <ConsoleView />}
            {this.props.mode === MODE.LIVEVIEW
              && <LiveView />}
            {this.props.uiSettings.counterEnabled && this.props.mode === MODE.COUNTERVIEW
              && <CounterView />}
            {/* Need to keep pathview in the DOM as it continuously renders */}
            {this.props.uiSettings.pathfinderEnabled
              && <PathView hidden={this.props.mode !== MODE.PATHVIEW} />}
            {/* Hide it on pathview mode */}
            {this.props.uiSettings.heatmapEnabled
              && <TrackerAccuracyView hidden={this.props.mode === MODE.PATHVIEW} />}
            <WebcamStream />
          </>
          )}
        <style jsx>
          {`
          .main-page {
            width: 100%;
            height: 100%;
            position: absolute;
            top: 0;
            left: 0;
            z-index: 1;
            overflow: hidden;
          }
        `}
        </style>
      </div>

    );
  }
}

export default connect((state) => ({
  deviceOrientation: state.viewport.deviceOrientation,
  mode: state.app.mode,
  isListeningToYOLO: state.app.isListeningToYOLO,
  requestedFileRecording: state.app.recordingStatus.requestedFileRecording,
  showMenu: state.app.showMenu,
  uiSettings: state.app.uiSettings,
  config: state.app.config,
}))(MainPage);
