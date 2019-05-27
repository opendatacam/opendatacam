import React, { Component } from 'react'

class AskLandscape extends Component {
  render () {
    return (
      <div className='turnDevice'>
        <div className='icon'>
          📱
        </div>
        <h1 className="text-white text-2xl">Please use your device in Landscape</h1>  
        <style jsx>{`
          .turnDevice{
            position: fixed;
            width: 100%;
            height: 100%;
            background-color: black;
            padding: 2rem; 
            display: flex;
            justify-content: center;
            align-items: center;
            flex-direction: column;
            text-align: center;
            z-index: 10000000000000;
          }
          .turnDevice h1{
            margin-top: 1rem;
          }

          .icon {
            font-size: 5rem;
            animation-name: spin;
            animation-duration: 2s;
            animation-iteration-count: infinite;
            animation-timing-function: linear;
          }

          @keyframes spin {
            0% {
              transform: rotate(0deg);
            }
            30% {
              transform: rotate(90deg);
            }
            100% {
              transform: rotate(90deg);
            }
          }
        `}</style>
      </div>
    )
  }
}

export default AskLandscape
