import React, { Component } from 'react';

class AskLandscapeAnimation extends Component {

  render() {
    return (
      <div className="icon">
        📱
        <style jsx>{`
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
    );
  }
}

export default AskLandscapeAnimation;
