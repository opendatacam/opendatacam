import React, { PureComponent } from 'react'
import { connect } from 'react-redux';
/*

  Solved by proxing the mjpeg stream from darknet on the server

  We are pulling the live view from a MJPEG HTTP Stream sent by the YOLO process

  Improvements ideas:
    -> Maybe the MJPEG stream is not well implemented on the YOLO process side
    -> Readable stream improve perfs : ( https://github.com/aruntj/mjpeg-readable-stream but I think not that useful , browser compat
    -> draw directly on canvas instead of having a <img> tag (https://gist.github.com/codebrainz/eeeeead894e8bdff059b)
    -> Support other resolution than 16/9
    -> Do not use the mjpeg HTTP Stream:  but launch a HLS stream with Gstreamer: https://stackoverflow.com/questions/34975851/i-want-to-perform-hls-http-live-streaming-using-gstreamer 
    -  this will enable to launch stream with a <video> tag

*/ 

class WebcamStream extends PureComponent {

  constructor(props) {
    super(props);
    this.state = {
      url : "/webcam/stream"
    }
  }

  componentDidMount() {
    this.setState({
      url: `/webcam/stream?date=${new Date().getTime()}`
    })
  }

  render () {
    return (
      <React.Fragment>
        <img
           width={this.props.resolution.get('w')}
           height={this.props.resolution.get('h')}
           src={this.state.url}
         />
        <style jsx>{`
          {/* @media (min-aspect-ratio: 16/9) {
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
          } */}

          /* Overwrite some default of tailwindcss */
          img {
            height: inherit;
          }
        `}</style>
      </React.Fragment>
    )
  }
}

export default connect((state) => {
  return {
    resolution: state.viewport.get('canvasResolution')
  }
})(WebcamStream)
