import React, { Component } from 'react'
import { connect } from 'react-redux';

/*
  We are pulling the live view from a MJPEG HTTP Stream sent by the YOLO process

  Improvements ideas? 
    -> Readabl stream improve perfs : ( https://github.com/aruntj/mjpeg-readable-stream but I think not that useful , browser compat
    -> draw directly on canvas instead of having a <img> tag
    -> Support other resolution than 16/9

*/ 

class WebcamStream extends Component {

  constructor(props) {
    super(props);

    this.state = {
       dateRefresh: new Date().getTime()
    };

    this.refresh = this.refresh.bind(this);
   }

   getUrl() {
      return `${this.props.urlData.protocol}://${this.props.urlData.address}:8090/?time=${this.state.dateRefresh}`
   }

   componentDidMount() {
     // MJPEG stream should work indefintly without having to restart it, but infortunately this is not the case
     // So we "restart" the multipart HTTP request every 5s to make sure things are streaming
     this.refreshInterval = setInterval(() => {
       this.refresh();
     }, 5000);
   }

   componentWillUnmount() {
     clearInterval(this.refreshInterval);
   }

   refresh() {
     this.setState({ dateRefresh: new Date().getTime() });
   }

  render () {
    return (
      <React.Fragment>
        <img
           width={1280}
           height={720}
           src={this.getUrl()}
         />
        <style jsx>{`
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
      </React.Fragment>
    )
  }
}

export default connect((state) => {
  return {
    urlData: state.app.get('urlData').toJS()
  }
})(WebcamStream)
