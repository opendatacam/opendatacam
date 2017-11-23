import React from 'react'
import { connect } from 'react-redux'; 

class WebcamView extends React.Component {

  constructor(props) {
    super(props);
  }

  render () {
    return (
      <div className="webcam-view">
        <img src="http://192.168.1.222:8090/webcam.jpg" />
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
        `}</style>
      </div>
    )
  }
}

export default WebcamView;
