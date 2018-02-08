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
        {this.props.showCounterData &&
          <CountingView />
        }
        {!this.props.showCounterData &&
          <WebcamView />
        }
      </div>
    )
  }
}

export default connect((state) => {
  return {
    showCounterData: state.app.get('showCounterData'),
    deviceOrientation: state.viewport.get('deviceOrientation')
  }
})(MainPage)
