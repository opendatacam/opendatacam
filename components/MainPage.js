import React from 'react'
import { connect } from 'react-redux'; 

// import DefineAreasView from './main/DefineAreasView';
// import CountingView from './main/CountingView';
import AskLandscape from './shared/AskLandscape';
import WebcamStream from './shared/WebcamStream';

import { initViewportListeners } from '../statemanagement/app/ViewportStateManagement'
import { startListeningToTrackerData } from '../statemanagement/app/TrackerStateManagement'
import LiveView from './main/LiveView';

import { MODE } from '../utils/constants';

class MainPage extends React.Component {

   componentDidMount() {
     this.props.dispatch(initViewportListeners());
     // TODO Handle specifying canvas size + resizing here, copy from beatthetraffic

     // TODO See how we handle the YOLO on / off situation
     this.props.dispatch(startListeningToTrackerData());
   }

  render () {
    return (
      <div className="main-page">
        {this.props.deviceOrientation === 'portrait' &&
          <AskLandscape />
        }
        {this.props.mode === MODE.LIVEVIEW &&
          <LiveView />
        }
        <WebcamStream />
        <style jsx>{`
          .main-page {
            width: 100%;
            height: 100%;
            position: absolute;
            top: 0;
            left: 0;
            z-index: 1;
          }
        `}</style>
      </div>
      
    )
  }
}

export default connect((state) => {
  return {
    deviceOrientation: state.viewport.get('deviceOrientation'),
    mode: state.app.get('mode')
  }
})(MainPage)
