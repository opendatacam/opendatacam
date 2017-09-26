import { Component } from 'react';
import Head from 'next/head'

class Video extends Component {
  render() { 
    return (
      <div>
        <video
          ref={(el) => { this.videoContainer = el; }}
          className="video"
          width="1280"
          height="720"
          muted
          playsInline
          autoPlay
          
        >
          <source src="/static/footage/C0082-47mm.mp4" type="video/mp4" />
          Your browser does not support the video tag.
        </video>
        <style jsx>{`
          .video {
            display: block;
            will-change: transform;
            position: absolute;
            top:0;
            left:0;
          }
        `}</style>
      </div>
    );
  }
}
 
export default Video;
