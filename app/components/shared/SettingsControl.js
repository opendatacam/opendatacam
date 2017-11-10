import React, { Component } from 'react';
import { connect } from 'react-redux';

import { updateSettings } from '../../statemanagement/app/SettingsStateManagement';

import { playVideo, pauseVideo, resetVideo } from '../../statemanagement/app/VideoStateManagement';

class DebugUI extends Component {

  constructor(props) {
    super(props);
    this.updateSettings = this.updateSettings.bind(this);
  }

  updateSettings(settings) {
    this.props.dispatch(updateSettings(settings));
  }

  render() {

    return (
      <div className="settings-control">
        {this.props.isObjectTrackerDataFetching || !this.props.isVideoReadyToPlay &&
          <div>
          {this.props.isObjectTrackerDataFetching &&
            <p>Fetching Tracker data...</p>
          }
          {this.props.isObjectTrackerDataFetched &&
            <p>Tracking data fetched</p>
          }
          <p>Video ready: {this.props.isVideoReadyToPlay ? 'true' : 'false'}</p>
          </div>
        }
        <label>
        Show debug UI
        <input
          type="checkbox"
          defaultChecked={this.props.settings.showDebugUI}
          onChange={(e) => this.updateSettings({ showDebugUI: e.target.checked })}
        />
        </label>
        {/* <label>
        Dark mode
        <input
          type="checkbox"
          defaultChecked={this.props.settings.darkMode}
          onChange={(e) => this.updateSettings({ darkMode: e.target.checked })}
        />
        </label> */}
        <div>
          {!this.props.isPlaying &&
            <button onClick={() => this.props.dispatch(playVideo())}>Play</button>
          } 
          {this.props.isPlaying &&
            <button onClick={() => this.props.dispatch(pauseVideo())}>Pause</button>
          }
          <button onClick={() => this.props.dispatch(resetVideo())}>Reset</button>
        </div>
        <style jsx>{`
          .settings-control {
            position: fixed;
            right: 1rem;
            top: 10rem;
            z-index: 10;
            transform: will-change;
            background-color: white;
            padding: 1rem;
            border-radius: 0.5rem;
          }
        `}</style>
      </div>
    );
  }
}

export default connect((state) => {
  return {
    settings: state.settings.toJS(),
    isObjectTrackerDataFetched: state.objectTracker.get('fetched'),
    isObjectTrackerDataFetching: state.objectTracker.get('isFetching'),
    isVideoReadyToPlay: state.video.get('isReadyToPlay'),
    isPlaying: state.video.get('isPlaying')
  }
})(DebugUI);
