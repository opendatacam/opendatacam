import React, { Component } from 'react'
import { connect } from 'react-redux'
import axios from 'axios';

import { exportCountingData, exportTrackerData } from '../../statemanagement/app/CounterStateManagement';
import { stopCounting, hideCountingData } from '../../statemanagement/app/AppStateManagement';
import BtnCounting from './BtnCounting';
import BtnDownload from './BtnDownload';
import BtnScreenshot from './BtnScreenshot';

class EndCountingCTA extends Component {

  getTrackerData() {
    let link = document.createElement("a");
    link.href = '/counter/trackerdata';
    link.click();
  }

  exportPathVisualizationFrame() {
    let link = document.createElement("a");
    let frame = document.getElementById("path-visualization-canvas").toDataURL("image/png")
                    .replace("image/png", "image/octet-stream");
    link.href = frame;
    link.download = 'frame.png';
    link.click();
  }

  render () {
    return (
      <React.Fragment>
        <div className="exportCountContainer">
          {/* <div 
            className="button export"
            onClick={() => this.getTrackerData()}
          >
            <h2>Get tracker data</h2>
          </div>
          <div 
            className="button export"
            onClick={() => this.props.dispatch(exportCountingData())}
          >
            <h2>Get counting data</h2>
          </div> */}
          {this.props.pathVisualizationSelected &&
            <BtnScreenshot onClick={() => this.exportPathVisualizationFrame()} />
          }
          <div className="separator"></div>
          <BtnDownload />
          <div className="separator"></div>
          {this.props.isCounting &&
            <BtnCounting 
              label="Stop tracking"
              iconStop
              onClick={() => this.props.dispatch(stopCounting())}
            />
          }
          {!this.props.isCounting &&
            <BtnCounting 
              label="New tracking"
              onClick={() => this.props.dispatch(hideCountingData())}
            />
          }
        </div>
        <style jsx>{`
          .exportCountContainer{
            position: absolute;
            bottom: 1rem;
            display: flex;
            width: 100%;
            z-index: 2;
            align-items: center;
            justify-content: center;
          }

          .separator {
            width: 30px;
          }
        `}</style>
      </React.Fragment>
    )
  }
}

export default connect((state) => {
  return {
    isCounting: state.app.get('isCounting')
  }
})(EndCountingCTA)
