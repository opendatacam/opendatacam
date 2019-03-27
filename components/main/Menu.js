import React, { Component } from 'react'
import { connect } from 'react-redux';
import { hideMenu } from '../../statemanagement/app/AppStateManagement';
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
      <div className="overlay">
        <div
          ref={node => this.node = node}
          className="menu text-default bg-black p-5"
        >
          <button
            className="btn btn-default btn-close flex items-center shadow rounded"
            onClick={() => this.props.dispatch(hideMenu())}
          >
            <img className="icon" src="/static/icons/icon-close.svg" />
          </button>
          <h3 className="mb-4">Open data cam</h3>
          <Toggle 
            label="Counter"
            description="Count objects on active areas"
          />
          <Toggle 
            label="Pathfinder"
            description="Track paths and positions"
          />
          <Toggle 
            label="Dark mode"
            description="Turn dark UI elements on"
          />
        </div>
        <style jsx>{`
          .overlay {
            position: fixed;
            left: 0;
            top: 0;
            width: 100%;
            height: 100%;
            background-color: rgba(0,0,0,0.8);
            z-index: 10;
          }
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
      </div>
    )
  }
}

export default connect((state) => {
  return {
    mode: state.app.get('mode')
  }
})(Menu);
