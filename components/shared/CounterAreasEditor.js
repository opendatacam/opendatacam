import React, { Component } from 'react'

import { connect } from 'react-redux';

import MenuCountingAreasEditor from './MenuCountingAreasEditor'

import { COLORS } from '../../utils/colors';

import { clearCountingArea, saveCountingAreaLocation, defaultCountingAreaValue, saveCountingAreaName } from '../../statemanagement/app/CounterStateManagement'
import AskCountingAreaName from './AskCountingAreaName';

class CounterAreasEditor extends Component {

  constructor(props) {
    super(props);

    this.state = {
      editorInitialized: false
    }

    // Fabric.js state
    this.lines = {}
    this.mouseDown = false;
  }

  initListeners() {

    this.editorCanvas.on('mouse:down', (o) => {
      if(this.lines[this.props.selectedCountingArea]) {
        this.editorCanvas.remove(this.lines[this.props.selectedCountingArea])
      }
      this.mouseDown = true;
      let pointer = this.editorCanvas.getPointer(o.e);
      let points = [ pointer.x, pointer.y, pointer.x, pointer.y ];
      this.lines[this.props.selectedCountingArea] = new fabric.Line(points, {
        strokeWidth: 5,
        fill: COLORS[this.props.countingAreas.getIn([this.props.selectedCountingArea, 'color'])],
        stroke: COLORS[this.props.countingAreas.getIn([this.props.selectedCountingArea, 'color'])],
        originX: 'center',
        originY: 'center'
      });
      this.editorCanvas.add(this.lines[this.props.selectedCountingArea]);
    });
    
    this.editorCanvas.on('mouse:move', (o) => {
      if (!this.mouseDown) return;
      let pointer = this.editorCanvas.getPointer(o.e);
      this.lines[this.props.selectedCountingArea].set({ x2: pointer.x, y2: pointer.y });
      
      // TODO STORE LINE DATA POINTS
      this.editorCanvas.renderAll();
    });
    
    this.editorCanvas.on('mouse:up', (o) => {
      let { x1, y1, x2, y2 } = this.lines[this.props.selectedCountingArea];
      this.props.dispatch(saveCountingAreaLocation(this.props.selectedCountingArea, {
        point1: { x:x1, y:y1},
        point2: { x:x2, y:y2},
        refResolution: {
          w: this.editorCanvas.width,
          h: this.editorCanvas.height
        }
      }))
      this.mouseDown = false;
    });
  }

  componentWillReceiveProps(newProps) {
    // We may have to delete some lines
    if(newProps.countingAreas !== this.props.countingAreas) {
      this.reRenderCountingAreasInEditor(newProps.countingAreas)
    }


    // TODO later in order to fix bug if resizing windows while in counter editing mode
    // if(newProps.canvasResolution !== this.props.canvasResolution) {
    //   this.editorCanvas.setDimensions({
    //     width: newProps.canvasResolution.get('w'),
    //     height: newProps.canvasResolution.get('h')
    //   });
    //   // TODO Update counting areas with new refResolution
    // }
  } 

  componentDidMount() {
    if(this.elCanvas) {
      
      // If no countingAreas exists already
      if(this.props.countingAreas.count((value) => value.get('location') !== undefined) === 0) {
        const { width, height } = this.elCanvas.getBoundingClientRect();
        this.editorCanvas = new fabric.Canvas(this.elCanvas, { selection: false, width: width, height: height });
      } else {
        // If some counting areas exists already
        const { refResolution } = this.props.countingAreas.find((val) => val.get('location') !== null).toJS().location;
        this.editorCanvas = new fabric.Canvas(this.elCanvas, { selection: false, width: refResolution.w, height: refResolution.h });
        this.reRenderCountingAreasInEditor(this.props.countingAreas)
      }

      if(this.props.selectedCountingArea) {
        this.initListeners();
      }
    }
  }

  reRenderCountingAreasInEditor(countingAreas) {
    // Clear canvas 
    this.editorCanvas.clear();
    this.lines = {}

    countingAreas.map((area, id) => {
      if(area.get('location') !== undefined) {
        let data = area.get('location').toJS();
        let color = area.get('color');
        let points = [ data.point1.x, data.point1.y, data.point2.x, data.point2.y ];
        this.lines[color] = new fabric.Line(points, {
          strokeWidth: 5,
          fill: COLORS[color],
          stroke: COLORS[color],
          originX: 'center',
          originY: 'center'
        });
        this.editorCanvas.add(this.lines[color]);
      }
    })
  }

  render () {

    const isEditing = Object.keys(this.props.countingAreas.toJS()).length > 0

    return (
      <div
        className="counting-areas-editor"
      >
        {this.props.askName &&
          <AskCountingAreaName
            save={(name) => this.props.dispatch(saveCountingAreaName(this.props.selectedCountingArea, name))}
          />
        }
        <MenuCountingAreasEditor />
        <canvas
          ref={(el) => this.elCanvas = el}
          width={this.props.canvasResolution.get('w')}
          height={this.props.canvasResolution.get('h')}
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
            :global(.canvas-container),.editor-canvas {
              width: 100% !important;
              height: auto !important;
            }
          }

          @media (max-aspect-ratio: 16/9) {
            :global(.canvas-container),.editor-canvas {
              width: auto !important;
              height: 100% !important;
            }
          }
        `}</style>
      </div>
    )
  }
}

export default connect((state) => {
  return {
    countingAreas: state.counter.get('countingAreas'),
    selectedCountingArea: state.counter.get('selectedCountingArea'),
    canvasResolution: state.viewport.get('canvasResolution'),
    askName: state.counter.get('askName')
  }
})(CounterAreasEditor)
