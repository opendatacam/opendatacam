import { Component } from 'react';
import raf from "raf";

class Video extends Component {
  componentDidMount() {
    const loop = () => {
      this._raf = raf(loop);
      const { video } = this.refs;
      if (!video) return;
      const currentTime = video.currentTime;
      // Optimization that only call onFrame if time changes
      if (currentTime !== this.currentTime) {
        this.currentTime = currentTime;
        this.props.onFrame(currentTime);
      }
    };
    this._raf = raf(loop);
  }
  componentWillUnmount() {
    raf.cancel(this._raf);
  }
  render() {
    const { onFrame, ...rest } = this.props;
    return <video {...rest} ref="video" />;
  }
}

export default Video;
