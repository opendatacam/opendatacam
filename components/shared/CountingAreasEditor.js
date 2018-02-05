import React, { Component } from 'react'

import MenuCountingAreasEditor from './MenuCountingAreasEditor'

class CountingAreasEditor extends Component {

  constructor(props) {
    super(props);

    this.state = {
      editorInitialized: false
    }
  }

  initListeners() {

    let isDown,line;

    this.editorCanvas.on('mouse:down', (o) => {
      if(this.line) {
        this.editorCanvas.remove(this.line)
      }
      isDown = true;
      var pointer = this.editorCanvas.getPointer(o.e);
      var points = [ pointer.x, pointer.y, pointer.x, pointer.y ];
      this.line = new fabric.Line(points, {
        strokeWidth: 5,
        fill: 'red',
        stroke: 'red',
        originX: 'center',
        originY: 'center'
      });
      this.editorCanvas.add(this.line);
    });
    
    this.editorCanvas.on('mouse:move', (o) => {
      if (!isDown) return;
      var pointer = this.editorCanvas.getPointer(o.e);
      this.line.set({ x2: pointer.x, y2: pointer.y });
      // TODO STORE LINE DATA POINTS
      this.editorCanvas.renderAll();
    });
    
    this.editorCanvas.on('mouse:up', (o) => {
      isDown = false;
    });
  }

  componentDidMount() {
    if(this.elCanvas) {
      const { width, height } = this.elCanvas.getBoundingClientRect();
      this.editorCanvas = new fabric.Canvas(this.elCanvas, { selection: false, width: width, height: height });
      // this.initListeners();
    }
  }

  render () {
    return (
      <div
        className="counting-areas-editor"
      >
        <MenuCountingAreasEditor />
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

export default CountingAreasEditor
