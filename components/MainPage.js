import React from 'react'
import { connect } from 'react-redux'; 

import AskLandscape from './shared/AskLandscape';
import WebcamStream from './shared/WebcamStream';

import { initViewportListeners } from '../statemanagement/app/ViewportStateManagement'
import { startListeningToServerData } from '../statemanagement/app/AppStateManagement'
import LiveView from './main/LiveView';
import CounterView from './main/CounterView';
import PathView from './main/PathView';
import ConsoleView from './main/ConsoleView';
import DataView from './main/DataView';

import { MODE } from '../utils/constants';
import UIControls from './main/UIControls';
import Menu from './main/Menu';
import InitializingView from './shared/InitializingView';

class MainPage extends React.Component {

  componentDidMount() {
    this.props.dispatch(initViewportListeners());
    // TODO Handle specifying canvas size + resizing here, copy from beatthetraffic

    // TODO See how we handle the YOLO on / off situation
    this.props.dispatch(startListeningToServerData());
  }

  render () {
    return (
      <div className="main-page">
        {this.props.deviceOrientation === 'portrait' &&
          <AskLandscape />
        }
        {!this.props.isListeningToYOLO &&
          <InitializingView />
        }
        {this.props.isListeningToYOLO &&
          <>
            <UIControls />
            {false &&  
              <Menu />
            }
            {this.props.mode === MODE.DATAVIEW &&
              <DataView />
            }
            {this.props.mode === MODE.CONSOLEVIEW &&
              <ConsoleView />
            }
            {this.props.mode === MODE.LIVEVIEW &&
              <LiveView />
            }
            {this.props.mode === MODE.COUNTERVIEW &&
              <CounterView />
            }
            {/* Need to keep pathview in the DOM as it continuously renders */}
            <PathView hidden={this.props.mode !== MODE.PATHVIEW} />
            <WebcamStream />
          </>
        }
        <style jsx>{`
          .main-page {
            width: 100%;
            height: 100%;
            position: absolute;
            top: 0;
            left: 0;
            z-index: 1;
            overflow: hidden;
          }
        `}</style>
      </div>
      
    )
  }
}

export default connect((state) => {
  return {
    deviceOrientation: state.viewport.get('deviceOrientation'),
    mode: state.app.get('mode'),
    isListeningToYOLO: state.app.get('isListeningToYOLO')
  }
})(MainPage)
