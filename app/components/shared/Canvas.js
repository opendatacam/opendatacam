import { Component } from 'react';
import Head from 'next/head'

class Canvas extends Component {

  

  render() { 
    return (
      <div>
        {/* It is important to specify the canvas width and height for the ratio */}
        <canvas 
         width="1920"
         height="1080"
         className="canvas" />
        <style jsx>{`
          .canvas {
            display: block;
            will-change: transform;
            position: absolute;
            top:0;
            left:0;
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
    );
  }
}
 
export default Canvas;
