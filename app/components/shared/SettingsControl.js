import React, { Component } from 'react';
import { connect } from 'react-redux';

import { updateSettings } from '../../statemanagement/app/SettingsStateManagement';

class DebugUI extends Component {

  constructor(props) {
    super(props);
    this.updateSettings.bind(this);
  }

  updateSettings(settings) {
    this.props.dispatch(updateSettings(settings));
  }

  render() {

    return (
      <div className="settings-control">
        <p><strong>DEBUG</strong></p>
        <label>
        Show debug UI
        <input
          type="checkbox"
          defaultChecked={this.props.settings.showDebugUI}
          onChange={(e) => this.updateSettings({ showDebugUI: e.target.checked })}
        />
        </label>
        <style jsx>{`
          .settings-control {
            position: absolute;
            left: 10px;
            bottom: 10px;
            z-index: 2;
            transform: will-change;
            background-color: white;
            padding: 10px;
            border-radius: 5px;
          }
        `}</style>
      </div>
    );
  }
}

export default connect((state) => {
  return {
    settings: state.settings.toJS()
  }
})(DebugUI);
