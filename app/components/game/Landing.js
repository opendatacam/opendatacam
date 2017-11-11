import React, { Component } from 'react';
import { connect } from 'react-redux';

// NO javascript in that file, we render it while loading the javascript

class Landing extends Component {

  render() {
    return (
      <div className="game-landing">
        <div className="title title-1">BEAT</div>
        <div className="title title-2">THE</div>
        <div className="title title-3">TRAFFIC</div>
        <div className="title title-4">STUTTGART</div>
        <svg
          className="logo-moovel" 
          width="16.6rem"
          height="10rem"
          viewBox="0 0 166 100" 
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M35.5 42.5h81.2l-11-11.5c-3-3-3-8 0-10.8 2.8-3 7.5-3 10.4 0L140 43.7c3 3 3 7.7 0 10.6L116 77.8c-2.8 3-7.5 3-10.4 0-3-3-3-7.6 0-10.5l10.6-10.7H35.5c-4.2 0-7.5-3-7.5-7 0-4.2 3.3-7 7.5-7zM49.8 100c12.8 0 24.4-4.8 33.2-12.7 8.8 8 20.4 12.7 33.2 12.7 27.5 0 49.8-22.4 49.8-50S143.7 0 116.2 0C103.4 0 91.8 4.8 83 12.7 74.2 4.7 62.6 0 49.8 0 22.3 0 0 22.4 0 50s22.3 50 49.8 50z"
            fill="#0FF"
            fillRule="evenodd"
          />
        </svg>
        <style jsx>{`
          .game-landing {
            position: fixed;
            top: 0;
            right: 0;
            left: 0;
            bottom: 0;
            z-index: 10;
            background-image: url('/static/detections/level_1/firstframe.jpg');
            background-size: cover;
            background-color: #262626;
            display: flex;
            justify-content: center;
            align-items: center;
          }

          .title {
            position: absolute;
            font-size: 9rem;
            line-height: 8rem;
            color: yellow;
            max-width: 95%;
            word-wrap: break-word;
            text-align: center;
            opacity: 0;
            will-change: transform;
          }

          .title-1 {
            animation-delay: 0.5s;
            animation-name: appear;
            animation-duration: 0.95s;
          }

          .title-2 {
            animation-delay: 1.5s;
            animation-name: appear;
            animation-duration: 0.45s;
          }

          .title-3 {
            animation-delay: 2s;
            animation-name: appear;
            animation-duration: 0.45s;
          }

          .title-4 {
            animation-delay: 2.5s;
            animation-name: appearAndStay;
            animation-duration: 0.8s;
          }

          .logo-moovel {
            opacity: 0;
            will-change: transform;
            animation-delay: 3.3s;
            animation-name: logoAnim;
            animation-duration: 8s;
          }
          

          // As it is the landing, we can't use any javascript, won't be loaded / parsed
          @keyframes appear {
            0% {
              opacity: 1;
              transform: scale(1.5);
            }
          
            90% {
              opacity: 1;
              transform: scale(0.9);
            }

            100% {
              opacity: 0;
            }
          }

          @keyframes appearAndStay {
            0% {
              opacity: 1;
              transform: scale(1.5);
            }
          
            100% {
              opacity: 1;
              transform: scale(0.9);
            }
          }

          @keyframes logoAnim {
            0% {
              opacity: 1;
              transform: scale(1);
            }
          
            100% {
              opacity: 1;
              transform: scale(1);
            }
          }
        `}</style>
      </div>
    );
  }
}

export default Landing;
