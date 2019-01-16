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
        <img
          src={`${this.props.urlData.protocol}://${this.props.urlData.address}:8090/stream.mjpg`}
        />
        {this.props.deviceOrientation === 'portrait' &&
          <AskLandscape />
        }
        {this.props.showCounterData &&
          <CountingView />
        }
        {!this.props.showCounterData &&
          <WebcamView />
        }
        <style jsx>{`
          .main-page {
            width: 100%;
            height: 100%;
            position: absolute;
            top: 0;
            left: 0;
            z-index: 1;
          }

          @media (min-aspect-ratio: 16/9) {
            img {
              width: 100%;
              height: auto;
            }
          }

          @media (max-aspect-ratio: 16/9) {
            img {
              width: auto;
              height: 100%;
            }
          }
        `}</style>
      </div>
      
    )
  }
}

export default connect((state) => {
  return {
    showCounterData: state.app.get('showCounterData'),
    deviceOrientation: state.viewport.get('deviceOrientation'),
    urlData: state.app.get('urlData').toJS()
  }
})(MainPage)
