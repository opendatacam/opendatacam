import React, { Component } from 'react';
import { connect } from 'react-redux';

class LevelName extends Component {

  render() {
    return (
      <div className="level-name">
        {`${this.props.levelName} LEVEL ${this.props.levelNb}`}
        <style jsx>{`
          .level-name {
            position: fixed;
            bottom: 2rem;
            left: 2rem;
            font-size: 2.2rem;
            font-family: "Geo", sans-serif;
            color: white;
            z-index: 1;
          }
        `}</style>
      </div>
    );
  }
}

export default connect((state) => {

  const selectedVideo = state.app.get('availableVideos').find((video) => {
    return video.get('name') === state.app.get('selectedVideo')
  });

  return {
    levelName: selectedVideo.get('levelName'),
    levelNb: selectedVideo.get('level')
  }
})(LevelName);
