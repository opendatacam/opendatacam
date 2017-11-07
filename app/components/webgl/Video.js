import { Component } from 'react';
import { connect } from 'react-redux';
import NoSSR from 'react-no-ssr';

import { 
  setVideoReady,
  setVideoEnded,
  updateCurrentTime
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
    this.lastCurrentTime = 0;

    this.state = {
      canRenderVideo: false
    }
  }

  shouldComponentUpdate(nextProps, nextState) {
    // We want to re-render the video item only if the src has changed
    if(nextProps.src !== this.props.src ||
      nextState.canRenderVideo !== this.state.canRenderVideo) {
      console.log('Render video');
      // TODO ADD DYNAMIC SCROLL OFFSET FOR MOBILE HERE
      setTimeout(() => {
        window.scroll(212,0);
      }, 1000);
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
        console.log('play item');
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
    console.log('video can play');
    this.props.dispatch(setVideoReady({
      duration: this.videoEl.duration
    }));
    // Cancel autoplay 
    // we set autoplay as a hack because safari mobile doesn't allow
    // to play without user even if not (so we autoplay-pause, then play)
    if(!this.props.isPlaying) {
      this.videoEl.pause();
    }
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
    let newCurrentFrame = Math.round(this.videoEl.currentTime * this.props.videoFPS)
    if(window.currentFrame !== newCurrentFrame) {
      window.currentFrame = newCurrentFrame;

      // Dispatch current time each second
      let newCurrentTime = Math.trunc(this.videoEl.currentTime);
      if(this.props.currentTime !== newCurrentTime) {
        this.props.dispatch(updateCurrentTime(newCurrentTime));
      }

      // Trigger onframe for webgl
      if(this.props.onFrame) {
        this.props.onFrame(newCurrentTime);
      }
    }
    requestAnimationFrame(this.monitorFrames);
  }

  componentWillUnmount() {
    if(this.videoEl) {
      this.cleanListeners(this.videoEl);
    }
  }

  componentDidMount() {
    this.setState({
      canRenderVideo: true
    });
  }

  render() { 
    return (
      <video
        key={this.props.src}
        ref={(el) => { 
          this.registerListeners(el)
        }}
        className="video"
        muted
        playsInline
        autoPlay
        crossOrigin="anonymous"
      >
        <source src={this.props.src} type="video/mp4" />
        Your browser does not support the video tag.
      </video>
    );
  }
}
 
export default connect((state) => {

  const selectedVideo = state.app.get('availableVideos').find((video) => {
    return video.get('name') === state.app.get('selectedVideo')
  });

  return {
    isPlaying: state.video.get('isPlaying'),
    isAtBeggining: state.video.get('isAtBeggining'),
    src: state.video.get('src'),
    currentTime: state.video.get('currentTime'),
    videoFPS: selectedVideo.get('videoFPS')
  }
})(Video);
