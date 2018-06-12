import React, { Component } from 'react'

import { connect } from 'react-redux';

import { COLORS } from '../../utils/colors';

class CountingAreasVisualizer extends Component {

  constructor(props) {
    super(props);

    this.state = {
      editorInitialized: false
    }

    // Fabric.js state
    this.lines = {}
    this.mouseDown = false;
  }

  componentWillReceiveProps(newProps) {
    if(newProps.color !== this.props.color) {
      this.reRenderCountingAreasInViewer(newProps.color)
    }
  } 

  componentDidMount() {
    if(this.elCanvas) {
      const { width, height } = this.elCanvas.getBoundingClientRect();
      this.editorCanvas = new fabric.Canvas(this.elCanvas, { selection: false, width: width, height: height });

      if(this.props.color) {
        this.reRenderCountingAreasInViewer(this.props.color)
      }
    }
  }

  reRenderCountingAreasInViewer(color) {
    // Clear canvas 
    this.editorCanvas.clear();
    this.lines = {}

    const area = this.props.countingAreas.get(color);
    let data = area.toJS();
    let points = [ data.point1.x1, data.point1.y1, data.point2.x2, data.point2.y2 ];
    this.lines[color] = new fabric.Line(points, {
      strokeWidth: 5,
      fill: COLORS[color],
      stroke: COLORS[color],
      opacity: 0.5,
      originX: 'center',
      originY: 'center'
    });
    this.editorCanvas.add(this.lines[color]);
  }

  render () {

    const isEditing = Object.keys(this.props.countingAreas.toJS()).length > 0

    return (
      <div
        className="counting-areas-editor"
      >
        <canvas
          ref={(el) => this.elCanvas = el}
          width={1280}
          height={720}
          className="editor-canvas" />
        <style jsx>{`
          .counting-areas-editor,.editor-canvas  {
            position: absolute;
            top: 0;
            right: 0;
            left: 0;
            bottom: 0;
          }

          @media (min-aspect-ratio: 16/9) {
            .editor-canvas {
              width: 100%;
              height: auto;
            }
          }

          @media (max-aspect-ratio: 16/9) {
            .editor-canvas {
              width: auto;
              height: 100%;
            }
          }
        `}</style>
      </div>
    )
  }
}

export default connect((state) => {
  return {
    countingAreas: state.counter.get('countingAreas')
  }
})(CountingAreasVisualizer)
