import React, { Component } from 'react';


const SQUARE_SIZE = 50;
const SQUARE_BORDER = 2;
const FOOT_LENGTH = 30;
const FOOT_TICKNESS = 4;
const FOOT_CIRCLE_SIZE = 10;

class EmotjiTracker extends Component {

  render() {
    return (
      <div 
        className="emotji-tracker"
        style={{
          top:  this.props.y - SQUARE_SIZE - FOOT_LENGTH,
          left: this.props.x - SQUARE_SIZE / 2
        }}
      >
        <div className="emotji-tracker-square">
          {this.props.type === 'car' &&
            <span>🚗</span>
          }
          {this.props.type === 'bicycle' &&
            <span>🚴</span>
          }
          {this.props.type === 'truck' &&
            <span>🚚</span>
          }
          {this.props.type === 'motorbike' &&
            <span>🏍️</span>
          }
        </div>
        <div className="emotji-tracker-foot">
          <div className="emotji-tracker-circle" />
        </div>
        <style jsx>{`
          .emotji-tracker {
            position: absolute;
            width: ${SQUARE_SIZE}px;
            height: ${SQUARE_SIZE + FOOT_LENGTH}px;
            overflow: visible;
            z-index: 4;
            transform: will-change;
          }

          .emotji-tracker-square {
            width: ${SQUARE_SIZE - SQUARE_BORDER}px;
            height: ${SQUARE_SIZE - SQUARE_BORDER}px;
            border: ${SQUARE_BORDER}px solid #E3E3E3;
            background-color: white;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 25px;
          }

          .emotji-tracker-foot {
            position: relative;
            top: 0;
            left: ${SQUARE_SIZE / 2 - FOOT_TICKNESS / 2}px;
            width: ${FOOT_TICKNESS}px;
            height: ${FOOT_LENGTH}px;
            background-color: white;
          }

          .emotji-tracker-circle {
            position: relative;
            top: ${FOOT_LENGTH - FOOT_CIRCLE_SIZE / 2}px;
            left: ${- (FOOT_CIRCLE_SIZE / 2) + FOOT_TICKNESS / 2}px;
            width: 10px;
            height: 10px;
            border-radius: 50%;
            background-color: white;
          }

        `}</style>
      </div>
    );
  }
}

export default EmotjiTracker;
