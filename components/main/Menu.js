import React, { Component } from 'react'
import { connect } from 'react-redux';
import { hideMenu, setUserSetting } from '../../statemanagement/app/AppStateManagement';
import Toggle from '../shared/Toggle';

class Menu extends Component {

  constructor(props){
    super(props);
    this.escFunction = this.escFunction.bind(this);
    this.handleClick = this.handleClick.bind(this);
  }

  escFunction(event){
    if(event.keyCode === 27) {
      this.props.dispatch(hideMenu());
    }
  }

  componentDidMount(){
    document.addEventListener("keydown", this.escFunction, false);
    document.addEventListener("click", this.handleClick, false);
  }

  componentWillUnmount(){
    document.removeEventListener("keydown", this.escFunction, false);
    document.removeEventListener("click", this.handleClick, false);
  }

  handleClick(e) {
    if(this.node.contains(e.target)) {
      // click inside menu, do nothing
      return;
    }

    // Click outside, hide menu
    this.props.dispatch(hideMenu());
  }

  render() {
    return (
      <>
        <div
          ref={node => this.node = node}
          className="menu text-default bg-black p-5"
        >
          <button
            className="btn btn-default btn-close flex items-center shadow rounded"
            onClick={() => this.props.dispatch(hideMenu())}
          >
            <img className="icon w-5 h-5" src="/static/icons/icon-close.svg" />
          </button>
          <h3 className="mb-4">Open data cam</h3>
          <Toggle 
            label="Counter"
            description="Count objects on active areas"
            enabled={this.props.userSettings.get('counter')}
            onChange={(value) => this.props.dispatch(setUserSetting('counter', value))}
          />
          <Toggle 
            label="Pathfinder"
            description="Track paths and positions"
            enabled={this.props.userSettings.get('pathfinder')}
            onChange={(value) => this.props.dispatch(setUserSetting('pathfinder', value))}
          />
          <Toggle 
            label="Dark mode"
            description="Turn dark UI elements on"
            enabled={this.props.userSettings.get('darkMode')}
            onChange={(value) => this.props.dispatch(setUserSetting('darkMode', value))}
          />
          <div className="mb-4 mt-4 flex items-center justify-between">
            <div className="mr-3">
              <h4 className="mb-2">Dimmer</h4>
              <p className="text-xs">Opacity of camera image</p>
            </div>
            <div className="flex">
              <button 
                className='btn btn-default py-1 px-3 rounded-l border border-default-soft border-solid flex items-center text-xl font-bold'
                onClick={() => 
                  this.props.dispatch(setUserSetting('dimmerOpacity', 
                    Math.min(this.props.userSettings.get('dimmerOpacity') + 0.1, 1)
                  ))
                }
              >
                +
              </button>
              <button 
                className='btn btn-default py-1 px-3 rounded-r border border-default-soft border-solid flex items-center text-xl font-bold'
                onClick={() => 
                  this.props.dispatch(setUserSetting('dimmerOpacity', 
                    Math.max(this.props.userSettings.get('dimmerOpacity') - 0.1, 0)
                  ))
                }
              >
                -
              </button>
            </div>
          </div>
        </div>
        <style jsx>{`
          .menu {
            position: absolute;
            top: 0;
            right: 0;
            bottom: 0;
            z-index: 3;
            min-width: 250px;
          }

          .btn-close {
            position: absolute;
            left: -80px;
            height: 3rem;
          }
        `}</style>
      </>
    )
  }
}

export default connect((state) => {
  return {
    mode: state.app.get('mode'),
    userSettings: state.app.get('userSettings')
  }
})(Menu);
