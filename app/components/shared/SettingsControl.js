import React, { Component } from 'react';
import { connect } from 'react-redux';

import { updateSettings } from '../../statemanagement/app/SettingsStateManagement';

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
            position: fixed;
            right: 10px;
            top: 10px;
            z-index: 10;
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
