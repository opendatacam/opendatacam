import React, { Component } from 'react'
import { connect } from 'react-redux';
import axios from 'axios';

class PathVisualization extends Component {

  constructor(props) {
    super(props);

    this.lastFrameData = null;

    this.colors = [
      "#1f77b4",
      "#ff7f0e",
      "#2ca02c",
      "#d62728",
      "#9467bd",
      "#8c564b",
      "#e377c2",
      "#7f7f7f",
      "#bcbd22",
      "#17becf"
    ]
  }


  fadeOutCanvasContent() {
    // Partially clearing canvas by drawing a black small opacity rect on top of it
    let ctx = this.canvasEl.getContext('2d');
    ctx.fillStyle = 'rgba(0, 0, 0, 0.03)';
    ctx.fillRect(0, 0, 1280, 720);
    // ctx.clearRect(0, 0, 1280, 720);
  }
  

  drawLineOnCanvas(line, color = 'green') {
    if(!this.canvasEl) {
      return;
    }
    
    let ctx = this.canvasEl.getContext('2d');
    ctx.strokeStyle = color;
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(line.pointA.x, line.pointA.y);
    ctx.lineTo(line.pointB.x, line.pointB.y);
    ctx.stroke();
  }

  componentDidMount() {

    this.renderLoop = setInterval(() => {
      axios.get('/counter/current-tracked-items').then((response) => {
        var thisFrameData = response.data;
        if(this.lastFrameData) {
          thisFrameData = thisFrameData.map((trackedItem) => {
            // If this tracked Item was already there in last frame
            var lastFrameTrackedItem = this.lastFrameData.find((lastFrameItemTracked) => trackedItem.id === lastFrameItemTracked.id)
            if(lastFrameTrackedItem) {
              let color = lastFrameTrackedItem.color ? lastFrameTrackedItem.color : this.colors[Math.floor(Math.random()*this.colors.length)]
              trackedItem.color = color;
              this.drawLineOnCanvas({
                pointA: {
                  x: lastFrameTrackedItem.x,
                  y: lastFrameTrackedItem.y
                },
                pointB: {
                  x: trackedItem.x,
                  y: trackedItem.y
                }
              }, color)
            }
            return trackedItem;
          })
        }

        this.lastFrameData = thisFrameData;
        
      })
    }, 40)

    // Each minute, fadeOutCanvas the canvas
    this.clearingLoop = setInterval(() => {
      this.fadeOutCanvasContent()
    }, 1 * 1000);
  }

  componentWillUnmount() {
    if(this.renderLoop) {
      clearInterval(this.renderLoop)
    }

    if(this.clearingLoop) {
      clearInterval(this.clearingLoop)
    }
  }

  render () {
    return (
      <div className="path-visualization-container" style={{ display: `${this.props.visible ? 'block' : 'none'}`}}>
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
            z-index: 1;
          }

          @media (min-aspect-ratio: 16/9) {
            .canvas {
              width: 100%;
              height: auto;
            }
          }

          @media (max-aspect-ratio: 16/9) {
            .canvas {
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
