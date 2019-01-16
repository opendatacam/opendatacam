import React, { Component } from 'react'
import { connect } from 'react-redux'

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

  getCounterData() {
    let link = document.createElement("a");
    link.href = '/counter/export';
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
          {this.props.pathVisualizationSelected &&
            <React.Fragment>
              <div className="separator"></div>
              <BtnDownload 
                label="Tracker Data"
                onClick={() => this.getTrackerData()}
              />
            </React.Fragment>
          }
          {!this.props.pathVisualizationSelected &&
            <React.Fragment>
            <div className="separator"></div>
            <BtnDownload 
              label="Counting Data"
              onClick={() => this.getCounterData()}
            />
            </React.Fragment>
          }
          {this.props.pathVisualizationSelected &&
            <React.Fragment>
              <div className="separator"></div>
              <BtnScreenshot onClick={() => this.exportPathVisualizationFrame()} />
            </React.Fragment>
          }
          
          {this.props.isCounting &&
            <React.Fragment>
              <div className="separator"></div>
              <BtnCounting 
                label="Stop Tracking"
                iconStop
                onClick={() => this.props.dispatch(stopCounting())}
              />
            </React.Fragment>

          }
          {!this.props.isCounting &&
            <React.Fragment>
              <div className="separator"></div>
              <BtnCounting 
                label="New Tracking"
                onClick={() => this.props.dispatch(hideCountingData())}
              />
            </React.Fragment>
          }
        </div>
        <style jsx>{`
          .exportCountContainer{
            position: fixed;
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
