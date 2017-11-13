import React, { PureComponent } from 'react';
import { connect } from 'react-redux';

class PollutionLevel extends PureComponent {

  getFillColor() {
    const pollutionPercentage = this.props.nbMissed * 100 / this.props.maxMissed
    let pollutionFillColor;

    if(pollutionPercentage < 50) {
      pollutionFillColor = "#5BFF86";
    } else if(pollutionPercentage < 80) {
      pollutionFillColor = "#FF9E00";
    } else {
      pollutionFillColor = "#FF0000";
    }
    
    return pollutionFillColor
  }

  render() {

    const pollutionPercentage = this.props.nbMissed * 100 / this.props.maxMissed;

    return (
      <svg
        viewBox="0 0 72 25"
        xmlns="http://www.w3.org/2000/svg"
        className={`pollution-bar ${pollutionPercentage >= 80 ? 'pollution-bar-alarm-anim' : ''}`}
      >
        <g id="Page-1" fill="none" fillRule="evenodd">
          <path 
            d="M62 0v8.6L72 0v25H31V9.2l10.3-9V9l10.3-9-.3 9L62 0zM20.6 9L31 0v25H0V9.2l10.3-9V9l10.3-9v9z" 
            id="bg" 
            fill="#262626"
          />
          <path 
            d="M62 0v8.6L72 0v25H31V9.2l10.3-9V9l10.3-9-.3 9L62 0zM20.6 9L31 0v25H0V9.2l10.3-9V9l10.3-9v9z"
            id="progress"
            fill={this.getFillColor()}
            clipPath="url(#progressClip)"
          />
          <defs>
            <clipPath id="progressClip">
              <rect
                x="0"
                y="0"
                width={this.props.nbMissed * 72 / this.props.maxMissed}
                height="25"
              >
              </rect>
            </clipPath>
          </defs>
        </g>
        <style jsx>{`
        .pollution-bar {
          margin-top: 0.5rem;
          width: 8.5rem;
          height: auto;
        }

        .pollution-bar-alarm-anim {
          animation-name: bounce;
          animation-duration: 0.5s;
          animation-iteration-count: infinite;
        }

        @keyframes bounce {
          0% {
            transform: scale(1);
          }
        
          20% {
            transform: scale(0.9);
          }

          80% {
            transform: scale(1.1);
          }

          100% {
            transform: scale(1);
          }
        }

        `}</style>
      </svg>
    );
  }
}

export default connect((state) => {
  return {
    score: state.game.get('score'),
    nbMissed: state.game.get('missedItems').size,
    maxMissed: state.game.get('maxMissed')
  }
})(PollutionLevel);
