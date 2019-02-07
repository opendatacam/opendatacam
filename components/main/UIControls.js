import React, { Component } from 'react'
import { connect } from 'react-redux';

import { MODE } from '../../utils/constants';
import { setMode } from '../../statemanagement/app/AppStateManagement';

class UIControls extends Component {

  constructor(props) {
    super(props);
  }

  render () {
    return (
      <React.Fragment>
        <div className="nav">
          <button onClick={() => this.props.dispatch(setMode(MODE.LIVEVIEW))}>Live view</button>
          <button onClick={() => this.props.dispatch(setMode(MODE.COUNTERVIEW))}>Counter</button>
          <button onClick={() => this.props.dispatch(setMode(MODE.PATHVIEW))}>Path finder</button>
        </div>
        <style jsx>{`
          .nav {
            position: absolute;
            top: 0;
            left: 0;
            z-index: 1;
          }
        `}</style>
      </React.Fragment>
    )
  }
}

export default connect()(UIControls);
