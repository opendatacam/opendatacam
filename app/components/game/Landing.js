import React, { Component } from 'react';
import { connect } from 'react-redux';

class Landing extends Component {

  render() {
    return (
      <div className="game-landing">
        <div className="title title-1">BEAT</div>
        <div className="title title-2">THE</div>
        <div className="title title-3">TRAFFIC</div>
        <div className="title title-4">STUTTGART</div>
        <style jsx>{`
          .title {
            position: absolute;
            font-size: 9rem;
            line-height: 8rem;
            color: yellow;
            will-change: transform;
            max-width: 95%;
            word-wrap: break-word;
            text-align: center;
            transform: translateY(-10000px); //put them offscreen
          }

          .title-1 {
            animation-delay: 2s;
            animation-name: appear;
            animation-duration: 0.45s;
          }

          .title-2 {
            animation-delay: 2.5s;
            animation-name: appear;
            animation-duration: 0.45s;
          }

          .title-3 {
            animation-delay: 3s;
            animation-name: appear;
            animation-duration: 0.45s;
          }

          .title-4 {
            animation-delay: 3.5s;
            animation-name: appear;
            animation-duration: 0.45s;
          }

          // As it is the landing, we can't use any javascript, won't be loaded / parsed
          @keyframes appear {
            from {
              transform: scale(1.5);
            }
          
            to {
              transform: scale(0.9);
            }
          }

          .game-landing {
            position: fixed;
            top: 0;
            right: 0;
            left: 0;
            bottom: 0;
            z-index: 10;
            background-image: url('/static/detections/level_1/firstframe.jpg');
            background-size: cover;
            
            display: flex;
            justify-content: center;
            align-items: center;
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
    levelNb: selectedVideo.get('level')
  }
})(Landing);
