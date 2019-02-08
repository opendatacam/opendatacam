import React, { Component } from 'react'

class Loading extends Component {
  render () {
    return (
      <div className='loader'>
        <div className='message'>Initializing neural network...</div>
        <div className='spinner'>
          <div className='circle circle-one' />
          <div className='circle circle-two' />
          <div className='circle circle-three' />
        </div>

        <style jsx>{`
          .loader {
            display: flex;
            flex: 1;
            align-items: center;
            justify-content: center;
            flex-direction: column;
          }

          .spinner {
            width: 12rem;
            height: 6rem;
            will-change: transform;
            position: relative;
          }

          .circle {
            width: 2rem;
            height: 2rem;
            background-color: #00ffff;
            top: 2rem;
          }

          .circle-one {
            position: absolute;
            left: 1rem;
            animation: spinone 1s infinite;
          }

          .circle-two {
            position: absolute;
            left: 4.5rem;
            animation: spintwo 1s infinite;
          }

          .circle-three {
            position: absolute;
            left: 8rem;
            animation: spinthree 1s infinite;
          }

          @keyframes spinone {
            0% {
              background-color: #fffe4a;
              transform: scale(1);
            }
            15% {
              background-color: #00ffff;
              transform: scale(1.2);
            }
            30% {
              background-color: #fffe4a;
              transform: scale(1);
            }
            100% {
              background-color: #fffe4a;
              transform: scale(1);
            }
          }
          @keyframes spintwo {
            0% {
              background-color: #fffe4a;
              transform: scale(1);
            }
            30% {
              background-color: #fffe4a;
              transform: scale(1);
            }
            45% {
              background-color: #00ffff;
              transform: scale(1.2);
            }
            60% {
              background-color: #fffe4a;
              transform: scale(1);
            }
            100% {
              background-color: #fffe4a;
              transform: scale(1);
            }
          }
          @keyframes spinthree {
            0% {
              background-color: #fffe4a;
              transform: scale(1);
            }
            60% {
              background-color: #fffe4a;
              transform: scale(1);
            }
            75% {
              background-color: #00ffff;
              transform: scale(1.2);
            }
            90% {
              background-color: #fffe4a;
              transform: scale(1);
            }
            100% {
              background-color: #fffe4a;
              transform: scale(1);
            }
          }
        `}</style>
      </div>
    )
  }
}

export default Loading
