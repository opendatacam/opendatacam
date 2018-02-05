import React from 'react'
import { connect } from 'react-redux'; 

import WebcamView from './WebcamView';
import CountingView from './CountingView';
import AskLandscape from '../shared/AskLandscape';

import { initViewportListeners } from '../../statemanagement/app/ViewportStateManagement'

class MainPage extends React.Component {

  constructor(props) {
    super(props);
  }

  componentDidMount() {
    this.props.dispatch(initViewportListeners());
  }

  render () {
    return (
      <div className="main-page">
        {this.props.deviceOrientation === 'portrait' &&
          <AskLandscape />
        }
        {this.props.isCounting &&
          <CountingView />
        }
        {!this.props.isCounting &&
          <WebcamView />
        }
      </div>
    )
  }
}

export default connect((state) => {
  return {
    isCounting: state.app.get('isCounting'),
    deviceOrientation: state.viewport.get('deviceOrientation')
  }
})(MainPage)
