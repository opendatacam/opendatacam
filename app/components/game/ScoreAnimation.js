import React, { Component } from 'react';
import { TweenMax } from 'gsap';

class ScoreAnimation extends Component {
  
  componentDidMount() {
    this.anim = TweenMax.to(this.el, 1,{
      top: "9rem", 
      left: "2rem",
      opacity: 0.1,
      onComplete: () => this.props.removeScoreAnimation(this.props.id)
    });
    this.anim.play();
  }

  render() {
    return (
      <div 
        className="score-animation"
        ref={(el) => this.el = el}
      >
        🚗
        <style jsx>{`
          .score-animation {
            position: absolute;
            width: 20px;
            top:  ${this.props.y}px;
            left: ${this.props.x}px;
            font-size: 18px;
            z-index: 5;
            transform: will-change;
          }
        `}</style>
      </div>
    );
  }
}

export default ScoreAnimation;
