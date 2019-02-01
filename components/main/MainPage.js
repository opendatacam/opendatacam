import React from 'react'
import { connect } from 'react-redux'; 

import DefineAreasView from './DefineAreasView';
import CountingView from './CountingView';
import AskLandscape from '../shared/AskLandscape';
import WebcamStream from '../shared/WebcamStream';

import { initViewportListeners } from '../../statemanagement/app/ViewportStateManagement'
import LiveViewVisualization from '../shared/LiveViewVisualization';

class MainPage extends React.Component {

   componentDidMount() {
     this.props.dispatch(initViewportListeners());
   }

  render () {
    return (
      <div className="main-page">
        {/* <LiveViewVisualization /> */}
        <WebcamStream />
        {this.props.deviceOrientation === 'portrait' &&
          <AskLandscape />
        }
        {this.props.showCounterData &&
          <CountingView />
        }
        {!this.props.showCounterData &&
          <DefineAreasView />
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
        `}</style>
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
