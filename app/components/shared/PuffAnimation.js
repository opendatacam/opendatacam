import React, { Component } from 'react';
import { TweenMax } from 'gsap';

const PUFF_SIZE = 90;

class PuffAnimation extends Component {
  
  componentDidMount() {
    this.anim = TweenMax.to(this.el, 0.5,{
      x:- PUFF_SIZE * 5,
      ease:SteppedEase.config(5),
      onComplete: () => this.props.removePuffAnimation(this.props.id)
    });
    this.anim.play();
  }

  render() {
    return (
      <div 
        className="puff-animation"
        style={{
          top:  this.props.y - PUFF_SIZE / 2,
          left: this.props.x - PUFF_SIZE / 2
        }}
      >
        <img
          className="puff-animation-img" 
          ref={(el) => this.el = el}
          src="/static/puff-smoke.svg" 
        />
        <style jsx>{`
          .puff-animation {
            position: absolute;
            width: ${PUFF_SIZE}px;
            height: ${PUFF_SIZE}px;
            overflow:hidden;
            z-index: 5;
            transform: will-change;
          }

          .puff-animation-img {
            width: ${PUFF_SIZE*5}px;
            height: auto;
          }
        `}</style>
      </div>
    );
  }
}

export default PuffAnimation;
