import React, { Component } from 'react';
import { TweenMax } from 'gsap';

class PuffAnimation extends Component {
  
  componentDidMount() {
    this.anim = TweenMax.to(this.el, 0.5,{
      x:-320,
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
          top:  this.props.y - 32,
          left: this.props.x - 32
        }}
      >
        <img 
          ref={(el) => this.el = el}
          src="/static/puff-smoke.png" 
        />
        <style jsx>{`
          .puff-animation {
            position: absolute;
            width: 64px;
            height: 64px;
            overflow:hidden;
            z-index: 5;
            transform: will-change;
          }
        `}</style>
      </div>
    );
  }
}

export default PuffAnimation;
