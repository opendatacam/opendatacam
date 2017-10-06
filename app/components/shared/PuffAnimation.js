import React, { Component } from 'react';
import { TweenMax } from 'gsap';

// const puffSize = 90;

class PuffAnimation extends Component {
  
  componentDidMount() {
    this.anim = TweenMax.to(this.el, 0.5,{
      x:-450,
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
          top:  this.props.y - 45,
          left: this.props.x - 45
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
            width: 90px;
            height: 90px;
            overflow:hidden;
            z-index: 5;
            transform: will-change;
          }

          .puff-animation-img {
            width: 450px;
            height: auto;
          }
        `}</style>
      </div>
    );
  }
}

export default PuffAnimation;
