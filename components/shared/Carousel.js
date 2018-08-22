import React, { Component } from 'react';

import SlideArrows from './SlideArrows';

class Carousel extends Component {

  constructor(props){
    super(props)
    this.state = {
      position: 0
    }
  }

  getOrder(itemIndex) {
    const { position } = this.state;
    const { children } = this.props;
    const numItems = children.length || 1;
    return ((numItems + 1) - position + itemIndex) % numItems
  }

  nextSlide = () => {
    const { position } = this.state
    const { children } = this.props
    const numItems = children.length || 1
    this.doSliding(position === numItems - 1 ? 0 : position + 1)
  }

  doSliding = (position) => {
    this.setState({
      sliding: true,
      position
    })
  
    setTimeout(() => {
     this.setState({
        sliding: false
      })
    }, 50)

    this.props.onChangeSelectedSlide(position);
  }

  render() {
    const { children } = this.props
  
    return (
      <div className="carousel">
        <div className="carousel-container">
          {children.map((child, index) => (
            <div
              className="carousel-slot"
              style={{ order: this.getOrder(index) }}
              key={ index }
            >
              {child}
            </div>
          ))}
        </div>
        <SlideArrows 
          goToNext={() => this.nextSlide()}
        />
        <style jsx>{`
          .carousel {
            overflow: hidden;
            width: 100%;
            height: 100%;
          }

          .carousel-container {
            display: flex;
            width: 100%;
            height: 100%;
          }

          .carousel-slot {
            position: relative;
            flex: 1;
            flex-shrink: 0;
            flex-basis: 100%;
          }
        `}</style>
        <style jsx>{`
          .carousel-container {
            transition: ${this.state.sliding ? 'none' : 'transform 0.5s ease-in'};
            transform: ${!this.state.sliding ? 'translateX(-100%)' : 'translateX(0%)'};
          }
        `}</style>
      </div>
    )
  }
}

export default Carousel;
