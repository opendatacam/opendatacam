import React, { Component } from 'react'
import { connect } from 'react-redux';
import { hideMenu, setUiSetting } from '../../statemanagement/app/AppStateManagement';
import { setUserSetting } from '../../statemanagement/app/UserSettingsStateManagement';
import Toggle from '../shared/Toggle';
import SVG from 'react-inlinesvg';

class Menu extends Component {

  constructor(props) {
    super(props);
    this.escFunction = this.escFunction.bind(this);
    this.handleClick = this.handleClick.bind(this);
  }

  escFunction(event) {
    if (event.keyCode === 27) {
      this.props.dispatch(hideMenu());
    }
  }

  componentDidMount() {
    document.addEventListener("keydown", this.escFunction, false);
    document.addEventListener("click", this.handleClick, false);
  }

  componentWillUnmount() {
    document.removeEventListener("keydown", this.escFunction, false);
    document.removeEventListener("click", this.handleClick, false);
  }

  handleClick(e) {
    if (this.node.contains(e.target)) {
      // click inside menu, do nothing
      return;
    }

    // Click outside, hide menu
    this.props.dispatch(hideMenu());
  }

  render() {
    return (
      <React.Fragment>
        <div
          ref={node => this.node = node}
          className="menu text-inverse bg-default shadow"
        >
          <button
            className="btn btn-default btn-close p-0 flex items-center shadow rounded"
            onClick={() => this.props.dispatch(hideMenu())}
          >
            <SVG
              className="w-12 h-12 svg-icon flex items-center"
              cacheRequests={true}
              src={`/static/icons/ui/close.svg`}
              aria-label="icon close"
            />
          </button>
          <div className="p-5 w-full overflow-y-scroll">
            <h3 className="mb-4 text-2xl font-bold"><a className="mt-2" href="https://github.com/opendatacam/opendatacam" target="_blank">OpenDataCam</a></h3>
            <Toggle
              label="Counter"
              description="Count objects on active areas"
              enabled={this.props.uiSettings.get('counterEnabled')}
              onChange={(value) => this.props.dispatch(setUiSetting('counterEnabled', value))}
            />
            <Toggle
              label="Pathfinder"
              description="Display paths and positions"
              enabled={this.props.uiSettings.get('pathfinderEnabled')}
              onChange={(value) => this.props.dispatch(setUiSetting('pathfinderEnabled', value))}
            />
            <Toggle
              label="Tracker accuracy"
              description="Display tracker accuracy"
              enabled={this.props.uiSettings.get('heatmapEnabled')}
              onChange={(value) => this.props.dispatch(setUiSetting('heatmapEnabled', value))}
            />
            <div className="mt-16"></div>
            <Toggle
              label="Dark mode"
              description="Turn dark UI elements on"
              enabled={this.props.userSettings.get('darkMode')}
              onChange={(darkMode) => {
                this.props.dispatch(setUserSetting('darkMode', darkMode))
              }}
            />
            <div className="mb-4 mt-4 flex items-center justify-between">
              <div className="mr-3">
                <h4 className="text-xl font-bold">Dimmer</h4>
                <p className="text-xs">Opacity of camera image</p>
              </div>
              <div className="flex">
                <button
                  className='btn btn-light py-1 px-3 rounded-l border border-gray-100 border-solid flex items-center text-xl font-bold shadow'
                  onClick={() =>
                    this.props.dispatch(setUserSetting('dimmerOpacity',
                      Math.max(this.props.userSettings.get('dimmerOpacity') - 0.1, 0)
                    ))
                  }
                >
                  -
                </button>
                <button
                  className='btn btn-light py-1 px-3 rounded-r border border-gray-100 border-solid flex items-center text-xl font-bold shadow'
                  onClick={() =>
                    this.props.dispatch(setUserSetting('dimmerOpacity',
                      Math.min(this.props.userSettings.get('dimmerOpacity') + 0.1, 1)
                    ))
                  }
                >
                  +
                </button>
              </div>
            </div>
          </div>
          <div className="menu-footer bg-black text-white p-5 w-full">
              <div className="flex flex-col">
                  <p>Version {this.props.version}</p>
                  <a className="mt-2" target="_blank" href="/api/doc">API documentation</a>
                  <a className="mt-2" href="https://github.com/opendatacam/opendatacam" target="_blank">About</a>
              </div>
          </div>
        </div>
        <style jsx>{`
          .menu {
            position: absolute;
            top: 0;
            right: 0;
            bottom: 0;
            z-index: 10;
            min-width: 250px;
            max-width: 320px;
            display: flex;
            flex-direction: column;
            justify-content: space-between;
          }

          .menu-footer {
				    box-shadow: 0 -1px 3px 0 rgba(0, 0, 0, 0.1)
          }

          .btn-close {
            position: absolute;
            top: 1rem;
            left: -4rem;
          }
        `}</style>
      </React.Fragment>
    )
  }
}

export default connect((state) => {
  return {
    mode: state.app.get('mode'),
    userSettings: state.usersettings,
    uiSettings: state.app.get('uiSettings'),
    version: state.app.getIn(['config','OPENDATACAM_VERSION'])
  }
})(Menu);
