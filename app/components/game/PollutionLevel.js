import React, { PureComponent } from 'react';
import { connect } from 'react-redux';

class PollutionLevel extends PureComponent {

  constructor(props) {
    super(props);

    this.nbSteps = 14;
  }

  fillColor(step) {
    const pollutionPercentage = this.props.nbMissed * 100 / this.props.maxMissed
    const stepPercentage = 100 * step / (this.nbSteps - 1);
    const bgFillColor = "#262626";
    let pollutionFillColor;

    if(pollutionPercentage < 50) {
      pollutionFillColor = "#5BFF86";
    } else if(pollutionPercentage < 80) {
      pollutionFillColor = "#FF9E00";
    } else {
      pollutionFillColor = "#FF0000";
    }
    
    if(pollutionPercentage > stepPercentage) {
      return pollutionFillColor;
    } else {
      return bgFillColor;
    }
  }

  render() {
    return (
      <div
        className="pollution-level"
      >
        <svg width="84" height="24" viewBox="0 0 84 24" xmlns="http://www.w3.org/2000/svg">
          <g id="pollutionbar" fill="#262626" fill-rule="evenodd">
            <path d="M78 4h6v20h-6V4zm6-4v4h-6l6-4z" id="step14" fill={this.fillColor(13)} />
            <path d="M72 8h6v16h-6V8zm6-4v4h-6l6-4z" id="step13" fill={this.fillColor(12)} />
            <path d="M66 4h6v20h-6V4zm6-4v4h-6l6-4z" id="step12" fill={this.fillColor(11)} />
            <path d="M60 8h6v16h-6V8zm6-4v4h-6l6-4z" id="step11" fill={this.fillColor(10)} />
            <path d="M54 4h6v20h-6V4zm6-4v4h-6l6-4z" id="step10" fill={this.fillColor(9)} />
            <path d="M48 8h6v16h-6V8zm6-4v4h-6l6-4z" id="step9" fill={this.fillColor(8)} />
            <path d="M42 4h6v20h-6V4zm6-4v4h-6l6-4z" id="step8" fill={this.fillColor(7)} />
            <path d="M36 8h6v16h-6V8zm6-4v4h-6l6-4z" id="step7" fill={this.fillColor(6)} />
            <path d="M30 4h6v20h-6V4zm6-4v4h-6l6-4z" id="step6" fill={this.fillColor(5)} />
            <path d="M24 8h6v16h-6V8zm6-4v4h-6l6-4z" id="step5" fill={this.fillColor(4)} />
            <path d="M18 4h6v20h-6V4zm6-4v4h-6l6-4z" id="step4" fill={this.fillColor(3)} />
            <path d="M12 8h6v16h-6V8zm6-4v4h-6l6-4z" id="step3" fill={this.fillColor(2)} />
            <path d="M6 4h6v20H6V4zm6-4v4H6l6-4z" id="step2" fill={this.fillColor(1)} />
            <path d="M0 8h6v16H0V8zm6-4v4H0l6-4z" id="step1" fill={this.fillColor(0)} />
          </g>
        </svg>
        <style jsx>{`
          .pollution-level {
            width: 20rem;
            display: flex;
            align-items: center;
          }
      `}</style>
      </div>
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
