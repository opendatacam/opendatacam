import React, { Component } from 'react';

import SlideArrows from './SlideArrows';

// Inspired by: https://medium.com/@incubation.ff/build-your-own-css-carousel-in-react-part-one-86f71f6670ca

class Carousel extends Component {

  constructor(props){
    super(props)
    this.state = {
      position: 0,
      direction: 'next',
      isSliding: false,
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
    this.doSliding('next', position === numItems - 1 ? 0 : position + 1)
  }

  previousSlide = () => {
    const { position } = this.state
    const { children } = this.props
    const numItems = children.length || 1
    this.doSliding('prev', position === 0 ? numItems - 1 : position - 1)
  }

  doSliding = (direction, position) => {
    this.setState({
      triggerSliding: true,
      isSliding: true,
      position,
      direction
    })
  
    setTimeout(() => {
     this.setState({
        triggerSliding: false,
        isSliding: true
      })
    }, 50)

    setTimeout(() => {
      this.setState({
        isSliding: false
       })
     }, 600)

    this.props.onChangeSelectedSlide(position);
  }

  render() {
    const { children } = this.props;
    const numItems = children.length || 1

    let transformCSS = 'translateX(0%)'

    if (numItems === 1) {
      transformCSS = 'translateX(0%)';
    }
    else if (numItems === 2) {
      if (!this.state.triggerSliding && this.state.direction === 'next') {
        transformCSS = 'translateX(-100%)';
      } else if(!this.state.triggerSliding && this.state.direction === 'prev') {
        transformCSS = 'translateX(-100%)';
      }
    } 
    else {
      if (!this.state.triggerSliding) {
        transformCSS = 'translateX(-100%)';
      }
      else if (this.state.direction === 'prev') {
        transformCSS = 'translateX(-200%)';
      }
    }
  
    return (
      <div className="carousel">
        <div className="carousel-container">
          {children.map((child, index) => (
            // Visibility hidden on "transitionning" for mobile compatibility of carousel, hacky workaround
            <div
              className={`carousel-slot ${this.getOrder(index) !== 1 && !this.state.isSliding ? 'hidden' : 'visible' 
              }`}
              style={{ order: this.getOrder(index) }}
              key={ index }
            >
              {child}
            </div>
          ))}
        </div>
        <SlideArrows 
          goToPrevious={() => this.previousSlide()} 
          goToNext={() => this.nextSlide()}
        />
        <style jsx>{`
          .carousel {
            // overflow: hidden;
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
          
          .hidden {
            visibility:hidden;
          }
        `}</style>
        <style jsx>{`
          .carousel-container {
            transition: ${this.state.triggerSliding ? 'none' : 'transform 0.5s ease-in'};
            transform: ${transformCSS};
          }
        `}</style>
      </div>
    )
  }
}

export default Carousel;
