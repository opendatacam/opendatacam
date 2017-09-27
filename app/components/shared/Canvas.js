import { Component } from 'react';
import { connect } from 'react-redux';
import Head from 'next/head'

import { fetchRawDetections } from '../../statemanagement/app/RawDetectionsStateManagement';
import { fetchObjectTracker } from '../../statemanagement/app/ObjectTrackerStateManagement';

class Canvas extends Component {

  constructor(props) {
    super(props);
    props.dispatch(fetchObjectTracker());
    props.dispatch(fetchRawDetections());
  }

  render() { 
    return (
      <div>
        {/* It is important to specify the canvas width 
         and height for the ratio but it can be scaled down */}
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
              width: 100vw;
              height: auto;
            }
          }

          @media (max-aspect-ratio: 16/9) {
            .canvas {
              width: auto;
              height: 100vh;
            }
          }
        `}</style>
      </div>
    );
  }
}
 
export default connect()(Canvas);
