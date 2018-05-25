import React, { Component } from 'react'
import { connect } from 'react-redux';
import axios from 'axios';
import { createGzip } from 'zlib';

class PathVisualization extends Component {

  constructor(props) {
    super(props);

    this.lastFrameData = null;
  }

  drawLineOnCanvas(line) {
    if(!this.canvasEl) {
      return;
    }
    
    let ctx = this.canvasEl.getContext('2d');
    ctx.strokeStyle = 'green';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(line.pointA.x, line.pointA.y);
    ctx.lineTo(line.pointB.x, line.pointB.y);
    ctx.stroke();
  }

  componentDidMount() {
    this.renderLoop = setInterval(() => {
      axios.get('/counter/current-tracked-items').then((response) => {
        if(this.lastFrameData) {
          response.data.map((trackedItem) => {
            // If this tracked Item was already there in last frame
            var lastFrameTrackedItem = this.lastFrameData.find((lastFrameItemTracked) => trackedItem.id === lastFrameItemTracked.id)
            if(lastFrameTrackedItem) {
              this.drawLineOnCanvas({
                pointA: {
                  x: lastFrameTrackedItem.x,
                  y: lastFrameTrackedItem.y
                },
                pointB: {
                  x: trackedItem.x,
                  y: trackedItem.y
                }
              })
            }
          })
        }

        this.lastFrameData = response.data;
        
      })
    }, 40)
  }

  componentWillUnmount() {
    if(this.renderLoop) {
      clearInterval(this.renderLoop)
    }
  }

  render () {
    return (
      <div className="path-visualization-container">
        <canvas
          width={1280}
          height={720}
          className="canvas"
          ref={(el) => this.canvasEl = el}
        /> 
        <style jsx>{`
          .path-visualization-container  {
            position: absolute;
            top: 0;
            right: 0;
            left: 0;
            bottom: 0;
          }

          @media (min-aspect-ratio: 16/9) {
            .path-visualization-container {
              width: 100%;
              height: auto;
            }
          }

          @media (max-aspect-ratio: 16/9) {
            .path-visualization-container {
              width: auto;
              height: 100%;
            }
          }
        `}</style>
      </div>
    )
  }
}

export default PathVisualization
