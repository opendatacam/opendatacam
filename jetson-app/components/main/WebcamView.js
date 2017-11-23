import React from 'react'
import { connect } from 'react-redux'; 
import { setInterval } from 'core-js/library/web/timers';
import { clearInterval } from 'timers';

class WebcamView extends React.Component {

  constructor(props) {
    super(props);

    this.state = {
      dateRefresh: new Date().getTime()
    };

    this.refresh = this.refresh.bind(this);
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

  render () {
    return (
      <div className="webcam-view">
        <img src={`http://192.168.1.222:8090/webcam.jpg?${this.state.dateRefresh}`} />
        <style jsx>{`
          @media (min-aspect-ratio: 16/9) {
            .webcam-view {
              width: 100%;
              height: auto;
            }
          }

          @media (max-aspect-ratio: 16/9) {
            .webcam-view {
              width: auto;
              height: 100%;
            }
          }
          
          img {
            width: 1280px;
            height: 720px;
          }

          .btn-refresh {
            position: absolute;
            top: 5px;
            left: 5px;
          }
        `}</style>
      </div>
    )
  }
}

export default WebcamView;
