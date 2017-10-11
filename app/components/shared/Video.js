import { Component } from 'react';
import { connect } from 'react-redux';
import NoSSR from 'react-no-ssr';

import { 
  setVideoReady,
  setVideoEnded
} from '../../statemanagement/app/VideoStateManagement';

class Video extends Component {

  constructor(props) {
    super(props);
    this.monitorFrames = this.monitorFrames.bind(this);
    this.registerListeners = this.registerListeners.bind(this);
    this.cleanListeners = this.cleanListeners.bind(this);
    this.handleCanPlay = this.handleCanPlay.bind(this);
    this.handlePlay = this.handlePlay.bind(this);
    this.handlePause = this.handlePause.bind(this);
    this.handleEnded = this.handleEnded.bind(this);
    this.isMonitoring = false;
  }

  shouldComponentUpdate(nextProps, nextState) {
    // We want to re-render the video item only if the src has changed
    if(nextProps.src !== this.props.src) {
      console.log('Update video');
      return true;
    } else {
      return false;
    }
  }

  componentWillReceiveProps(newProps) {
    if(!this.videoEl) {
      console.log('Video element ref not defined');
      return;
    }
    // Pilot videoEl from the props changes
    if(this.props.isPlaying !== newProps.isPlaying &&
      newProps.isPlaying === true) {
        this.videoEl.play();
    }

    if(this.props.isPlaying !== newProps.isPlaying &&
      newProps.isPlaying === false) {
        this.videoEl.pause();
    }

    if(this.props.isAtBeggining !== newProps.isAtBeggining) {
      this.videoEl.currentTime = 0;
    }
  }

  handleCanPlay() {
    console.log('video ready to play');
    this.props.dispatch(setVideoReady({
      duration: this.videoEl.duration
    }));
  }

  handlePlay() {
    console.log('playing');
    // If not already monitoring
    if(!this.isMonitoring) {
      console.log('Start monitoring frames');
      this.isMonitoring = true;
      this.monitorFrames();
    }
  } 

  handlePause() {
    console.log('video paused')
  }

  handleEnded() {
    console.log('video ended');
    this.props.dispatch(setVideoEnded());
  }

  cleanListeners(el) {
    console.log('Clean previous listeners');
    el.removeEventListener('canplay', this.handleCanPlay);
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
    if(this.videoEl) {
      console.log('registerListeners');
      this.videoEl.addEventListener('canplay', this.handleCanPlay);
      this.videoEl.addEventListener('play', this.handlePlay);
      this.videoEl.addEventListener('pause', this.handlePause);
      this.videoEl.addEventListener('ended', this.handleEnded);
    }
  }

  monitorFrames() {
    if(!this.props.isPlaying || this.isMonitoring === false) {
      console.log('cancel monitoring');
      this.isMonitoring = false;
      return;
    }
    let newCurrentFrame = Math.round(this.videoEl.currentTime * 25)
    if(window.currentFrame !== newCurrentFrame) {
      window.currentFrame = newCurrentFrame;
      window.currentTime = this.videoEl.currentTime;
    }
    requestAnimationFrame(this.monitorFrames);
  }

  componentWillUnmount() {
    if(this.videoEl) {
      this.cleanListeners(this.videoEl);
    }
  }

  render() { 
    return (
      <div className="video-container">
        {this.props.src &&
          <video
            key={this.props.src}
            ref={(el) => { 
              this.registerListeners(el)
            }}
            className="video"
            muted
            playsInline
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
            height: 100%;
            width: 100%;
            justify-content: center;
            align-items:center;
          }

          @media (min-aspect-ratio: 16/9) {
            .video {
              width: 100%;
              height: auto;
            }
          }

          @media (max-aspect-ratio: 16/9) {
            .video {
              width: auto;
              height: 100%;
            }
          }
        `}</style>
      </div>
    );
  }
}
 
export default connect((state) => {
  return {
    isPlaying: state.video.get('isPlaying'),
    isAtBeggining: state.video.get('isAtBeggining'),
    src: state.video.get('src')
  }
})(Video);
