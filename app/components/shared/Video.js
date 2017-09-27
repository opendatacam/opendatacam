import { Component } from 'react';
import Head from 'next/head';
import NoSSR from 'react-no-ssr';
import Loading from './Loading'; 

class Video extends Component {
  render() { 
    return (
      <div className="video-container">
        <NoSSR onSSR={<Loading />}>
          <video
            ref={(el) => { this.videoContainer = el; }}
            className="video"
            loop
            muted
            playsInline
            autoPlay
          >
            <source src="/static/sample/sample-video.mp4" type="video/mp4" />
            Your browser does not support the video tag.
          </video>
        </NoSSR>
        <style jsx>{`
          .video {
            display: block;
            will-change: transform;
            position: absolute;
            top:0;
            left:0;
          }

          .video-container {
            display: flex;
            height: 100vh;
            width: 100vw;
            justify-content: center;
            align-items:center;
          }

          @media (min-aspect-ratio: 16/9) {
            .video {
              width: 100vw;
              height: auto;
            }
          }

          @media (max-aspect-ratio: 16/9) {
            .video {
              width: auto;
              height: 100vh;
            }
          }
        `}</style>
      </div>
    );
  }
}
 
export default Video;
