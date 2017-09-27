import { Component } from 'react';
import { connect } from 'react-redux';
import NoSSR from 'react-no-ssr';
import Loading from './Loading'; 

import { 
  setVideoReady,
  setVideoLoading,
  setVideoPlaying,
  setVideoPaused
} from '../../statemanagement/app/VideoStateManagement';

class Video extends Component {

  constructor(props) {
    super(props);
    props.dispatch(setVideoLoading());
    this.monitorFrames = this.monitorFrames.bind(this);
    this.isMonitoring = false;
  }

  // TODO IMPLEMENT COMPONENT UNMOUNT TO CLEAN UP STUFF

  componentDidMount() {
    // Cancel autoplay (playing on canplaythrough callback)
    // Hack because iOS safari won't autoplay via javascript only
    this.videoEl.pause();
    this.videoEl.addEventListener('canplaythrough', () => {
      console.log('video ready to play');
      this.props.dispatch(setVideoReady());
      // For chrome android, autoplay doesn't work
      this.videoEl.play();
    });

    this.videoEl.addEventListener('play', () => {
      console.log('playing');
      this.props.dispatch(setVideoPlaying());

      // If not already monitoring
      if(!this.isMonitoring) {
        console.log('Start monitoring frames');
        this.isMonitoring = true;
        this.monitorFrames();
      }
    });

    this.videoEl.addEventListener('pause', () => {
      console.log('video paused')
      this.props.dispatch(setVideoPaused());
    });

    this.videoEl.addEventListener('ended', () => {
      console.log('video ended');
      // this.props.dispatch(setVideoPlaying());
      // TODO DISPATCH ACTION IS LOOPING TO CLEAN UP STUFF
    });
  }

  monitorFrames() {
    if(this.props.isPaused || this.isMonitoring === false) {
      console.log('cancel monitoring');
      this.isMonitoring = false;
      return;
    }
    let newCurrentFrame = Math.round(this.videoEl.currentTime * 25)
    if(window.currentFrame !== newCurrentFrame) {
      window.currentFrame = newCurrentFrame;
    }
    requestAnimationFrame(this.monitorFrames);
  }

  render() { 
    return (
      <div className="video-container">
        {!this.props.isReadyToPlay &&
          <Loading />
        }
        <video
          ref={(el) => { 
            this.videoEl = el;
          }}
          className="video"
          loop
          muted
          playsInline
          autoPlay
        >
          <source src="/static/sample/sample-video.mp4" type="video/mp4" />
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
 
export default connect((state) => {
  return {
    isReadyToPlay: state.video.get('isReadyToPlay'),
    isPaused: state.video.get('isPaused'),
    currentFrame: state.video.get('currentFrame')
  }
})(Video);
