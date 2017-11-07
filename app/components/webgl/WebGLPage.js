import React from 'react';
import { connect } from 'react-redux';
import { Surface } from "gl-react-dom";


import Loading from '../shared/Loading'; 
import Canvas from './Canvas'; 
import SettingsControl from '../shared/SettingsControl';
import BackgroundSubtraction from './BackgroundSubtraction';
import Video from './Video'; 

import VideoSelector from '../shared/VideoSelector';

import { updateSettings } from '../../statemanagement/app/SettingsStateManagement';

import { selectVideo } from '../../statemanagement/app/AppStateManagement';

import { initViewportListeners } from '../../statemanagement/app/ViewportStateManagement';

class WebGLPage extends React.Component {

  constructor(props) {
    super(props);
    props.dispatch(updateSettings({ showDebugUI: false }));
  }

  componentDidMount() {
    this.props.dispatch(selectVideo("1_prototype_video"));
    this.props.dispatch(initViewportListeners());
  }

  render () {
    return (
      <div className="landing-page">
        <SettingsControl />
        
        <div className="canvas-container">
          <Surface 
            width={1280}
            height={720}
            className="canvas"
          >
            <BackgroundSubtraction
              average="/static/detections/1_prototype_video/average-1280.jpg"
              canvas2d={<Canvas />}
            >
              {redraw => (
                <Video onFrame={redraw} />
              )}
            </BackgroundSubtraction>
          </Surface>
        </div>
        <style jsx global>{`
          .canvas-container {
            width: 100%;
            height: 100%;
            position: absolute;
            top:0;
            left:0;
          }
          .canvas {
            display: block;
            will-change: transform;
            position: absolute;
            top:0;
            left:0;
            z-index: 2;
          }

          @media (min-aspect-ratio: 16/9) {
            .canvas {
              width: 100% !important;
              height: auto !important;
            }
          }

          @media (max-aspect-ratio: 16/9) {
            .canvas {
              width: auto !important;
              height: 100% !important;
            }
          }
        `}</style>
      </div>
    )
  }
}

export default connect()(WebGLPage);
