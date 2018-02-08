import React from 'react'
import { connect } from 'react-redux'; 

import { startCounting, drawInstructionsShown } from '../../statemanagement/app/AppStateManagement';
import DrawInstructions from '../shared/DrawInstructions';
import CountingAreasEditor from '../shared/CountingAreasEditor';
import BtnStartCounting from '../shared/BtnStartCounting';

class WebcamView extends React.Component {

  constructor(props) {
    super(props);

    this.state = {
      dateRefresh: new Date().getTime()
    };

    this.refresh = this.refresh.bind(this);
    this.handleStartCounting = this.handleStartCounting.bind(this);
  }

  getUrl() {
    if(process.env.NODE_ENV !== 'production') {
      return "/static/placeholder/webcam.jpg" 
    } else {
      return `${this.props.urlData.protocol}://${this.props.urlData.address}:8090/webcam.jpg?${this.state.dateRefresh}`
    }
  }

  componentDidMount() {
    this.refreshInterval = setInterval(() => {
      this.refresh();
    }, 1000);
  }

  componentWillUnmount() {
    clearInterval(this.refreshInterval);
  }

  refresh() {
    this.setState({ dateRefresh: new Date().getTime() });
  }

  handleStartCounting() {
    this.props.dispatch(startCounting());
  }

  render () {
    return (
      <div className="webcam-view">
        {!this.props.drawInstructionsShown &&
          <DrawInstructions onConfirm={() => this.props.dispatch(drawInstructionsShown())} />
        }
        {this.props.drawInstructionsShown &&
          <CountingAreasEditor />
        }
        {this.props.isOneCountingAreaDefined &&
          <BtnStartCounting onClick={() => this.handleStartCounting()} />
        }
        <img 
          width="1280"
          height="720"
          src={this.getUrl()}
        />
        <style jsx>{`
          .webcam-view {
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

  let isOneCountingAreaDefined = Object.values(state.counter.get('countingAreas').toJS()).filter((value) => value !== null).length > 0

  return {
    urlData: state.app.get('urlData').toJS(),
    isOneCountingAreaDefined,
    drawInstructionsShown: state.app.get('drawInstructionsShown')
  }
})(WebcamView);
