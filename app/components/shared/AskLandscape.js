import React, { Component } from 'react';

class AskLandscape extends Component {

  render() {
    return (
      <div 
        className="ask-landscape"
      >
        <div className="icon">📱</div>
        <div className="text"><i>TIP: Level 2 is easier in Landscape</i></div>
        <style jsx>{`
          .icon {
            font-size: 5rem;
            animation-name: spin;
            animation-duration: 2s;
            animation-iteration-count: infinite;
            animation-timing-function: linear;
          }

          .text {
            margin-bottom: 5px;
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

export default AskLandscape;
