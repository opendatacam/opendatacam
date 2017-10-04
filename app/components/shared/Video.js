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
    this.monitorFrames = this.monitorFrames.bind(this);
    this.registerListeners = this.registerListeners.bind(this);
    this.cleanListeners = this.cleanListeners.bind(this);
    this.handleCanPlayThrough = this.handleCanPlayThrough.bind(this);
    this.handlePlay = this.handlePlay.bind(this);
    this.handlePause = this.handlePause.bind(this);
    this.handleEnded = this.handleEnded.bind(this);
    this.isMonitoring = false;
  }

  // TODO IMPLEMENT COMPONENT UNMOUNT TO CLEAN UP STUFF

  handleCanPlayThrough() {
    console.log('video ready to play');
    this.props.dispatch(setVideoReady());
    this.videoEl.play();
  }

  handlePlay() {
    console.log('playing');
    this.props.dispatch(setVideoPlaying());
    // If not already monitoring
    if(!this.isMonitoring) {
      console.log('Start monitoring frames');
      this.isMonitoring = true;
      this.monitorFrames();
    }
  } 

  handlePause() {
    console.log('video paused')
    this.props.dispatch(setVideoPaused());
  }

  handleEnded() {
    console.log('video ended');
    // this.props.dispatch(setVideoPlaying());
    // TODO DISPATCH ACTION IS LOOPING TO CLEAN UP STUFF
  }

  cleanListeners(el) {
    console.log('Clean previous listeners');
    el.removeEventListener('canplaythrough', this.handleCanPlayThrough);
    el.removeEventListener('play', this.handlePlay);
    el.removeEventListener('pause', this.handlePause);
    el.removeEventListener('ended', this.handleEnded);
  }

  registerListeners(el) {
    if(this.videoEl) {
      // Clean previous listeners
      this.cleanListeners(this.videoEl);
    }
    this.videoEl = el;
    // debugger;
    console.log('registerListeners');
    console.log(this.videoEl);
    if(this.videoEl) {
      // Cancel autoplay (playing on canplaythrough callback)
      // Hack because iOS safari won't autoplay via javascript only
      this.videoEl.pause();
      this.videoEl.addEventListener('canplaythrough', this.handleCanPlayThrough);
      this.videoEl.addEventListener('play', this.handlePlay);
      this.videoEl.addEventListener('pause', this.handlePause);
      this.videoEl.addEventListener('ended', this.handleEnded);
    }
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
        {this.props.src &&
          <video
            key={this.props.src}
            ref={(el) => { 
              this.registerListeners(el);
            }}
            className="video"
            loop
            muted
            playsInline
            autoPlay
          >
            <source src={this.props.src} type="video/mp4" />
            Your browser does not support the video tag.
          </video>
        }
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
    currentFrame: state.video.get('currentFrame'),
    src: state.video.get('src')
  }
})(Video);
