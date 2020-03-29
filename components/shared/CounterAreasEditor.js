import React, { Component } from 'react'

import { connect } from 'react-redux';

import MenuCountingAreasEditor from './MenuCountingAreasEditor'

import { saveCountingAreaLocation, saveCountingAreaName, EDITOR_MODE, deleteCountingArea, computeCountingAreasCenters, addCountingArea, computeDistance, setMode, toggleCountingAreaType } from '../../statemanagement/app/CounterStateManagement'
import AskNameModal from './AskNameModal';
import DeleteModal from './DeleteModal';
import InstructionsModal from './InstructionsModal'
import SingleCounterDirection from './SingleCounterDirection'
import { getCounterColor } from '../../utils/colors';

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
      this.props.dispatch(addCountingArea());

      this.mouseDown = true;
      let pointer = this.editorCanvas.getPointer(o.e);
      let points = [ pointer.x, pointer.y, pointer.x, pointer.y ];
      // Potential cause of bug if this.props.selectedCountingArea isn't
      // defined when we reach here
      this.lines[this.props.selectedCountingArea] = new fabric.Line(points, {
        strokeWidth: 5,
        fill: getCounterColor(this.props.countingAreas.getIn([this.props.selectedCountingArea, 'color'])),
        stroke: getCounterColor(this.props.countingAreas.getIn([this.props.selectedCountingArea, 'color'])),
        originX: 'center',
        originY: 'center'
      });
      this.editorCanvas.add(this.lines[this.props.selectedCountingArea]);
      this.editorCanvas.add(new fabric.Circle({
        radius: 5,
        fill: getCounterColor(this.props.countingAreas.getIn([this.props.selectedCountingArea, 'color'])),
        top: pointer.y,
        left: pointer.x,
        originX: 'center',
        originY: 'center'
      }));
    });
    
    this.editorCanvas.on('mouse:move', (o) => {
      if (!this.mouseDown) return;
      let pointer = this.editorCanvas.getPointer(o.e);
      this.lines[this.props.selectedCountingArea].set({ x2: pointer.x, y2: pointer.y });
      // TODO STORE LINE DATA POINTS
      this.editorCanvas.renderAll();
    });
    
    this.editorCanvas.on('mouse:up', (o) => {
      if (!this.mouseDown) return;
      let { x1, y1, x2, y2 } = this.lines[this.props.selectedCountingArea];
      let point1 = { x:x1, y:y1};
      let point2 = { x:x2, y:y2};
      // Only record if line distance if superior to some threshold to avoid single clicks
      if(computeDistance(point1, point2) > 50) {
        // Maybe use getCenterPoint to persist center
        this.props.dispatch(saveCountingAreaLocation(this.props.selectedCountingArea, {
          point1: point1,
          point2: point2,
          refResolution: {
            w: this.editorCanvas.width,
            h: this.editorCanvas.height
          }
        }))
      } else {
        // Cancel line, not long enough
        this.props.dispatch(deleteCountingArea(this.props.selectedCountingArea));
      }
      this.mouseDown = false;
    });
  }

  componentDidUpdate(prevProps) {
    // We may have to delete some lines
    if(prevProps.countingAreas !== this.props.countingAreas) {
      this.reRenderCountingAreasInEditor(this.props.countingAreas)
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
      const { width, height } = this.elCanvas.getBoundingClientRect();
      this.editorCanvas = new fabric.Canvas(this.elCanvas, { selection: false, width: width, height: height });
        
      // If no countingAreas exists already
      if(this.props.countingAreas.size === 0) {
        this.props.dispatch(setMode(EDITOR_MODE.SHOW_INSTRUCTION))
      } else {
        this.reRenderCountingAreasInEditor(this.props.countingAreas)
      }

      this.initListeners();
    }
  }

  reRenderCountingAreasInEditor(countingAreas) {
    // Clear canvas 
    this.editorCanvas.clear();
    this.lines = {}

    const { width, height } = this.elCanvas.getBoundingClientRect();

    countingAreas.map((area, id) => {
      if(area.get('location') !== undefined) {
        let data = area.get('location').toJS();
        let color = area.get('color');
        let reScalingFactorX = width / data.refResolution.w;
        let reScalingFactorY = height / data.refResolution.h;
        let points = [ data.point1.x * reScalingFactorX, data.point1.y * reScalingFactorY, data.point2.x * reScalingFactorX, data.point2.y * reScalingFactorY];
        this.lines[id] = new fabric.Line(points, {
          strokeWidth: 5,
          fill: getCounterColor(color),
          stroke: getCounterColor(color),
          originX: 'center',
          originY: 'center'
        });
        this.editorCanvas.add(this.lines[id]);
        this.editorCanvas.add(new fabric.Circle({
          radius: 5,
          fill: getCounterColor(color),
          top: data.point1.y * reScalingFactorY,
          left: data.point1.x * reScalingFactorX,
          originX: 'center',
          originY: 'center'
        }));
        this.editorCanvas.add(new fabric.Circle({
          radius: 5,
          fill: getCounterColor(color),
          top: data.point2.y * reScalingFactorY,
          left: data.point2.x * reScalingFactorX,
          originX: 'center',
          originY: 'center'
        }));
      }
    })
  }

  render () {
    return (
      <div
        className="counting-areas-editor"
      >
        {this.props.mode === EDITOR_MODE.SHOW_INSTRUCTION &&
          <InstructionsModal
            close={() => this.props.dispatch(setMode(EDITOR_MODE.EDIT))}
          />
        }
        {this.props.mode === EDITOR_MODE.ASKNAME &&
          <AskNameModal
            save={(name) => this.props.dispatch(saveCountingAreaName(this.props.selectedCountingArea, name))}
            cancel={(name) => {
              this.props.dispatch(deleteCountingArea(this.props.selectedCountingArea))
              this.props.dispatch(setMode(EDITOR_MODE.EDIT))
            }}
          />
        }
        {this.props.mode === EDITOR_MODE.DELETE &&
          <DeleteModal
            countingAreasWithCenters={this.props.countingAreasWithCenters}
            delete={(id) => this.props.dispatch(deleteCountingArea(id))}
            cancel={() => { this.props.dispatch(setMode(EDITOR_MODE.EDIT)) }}
          />
        }
        {this.props.countingAreasWithCenters.entrySeq().map(([id, countingArea]) =>
          <React.Fragment key={id}>
            {countingArea.get('computed') &&
              <SingleCounterDirection 
                key={id}
                area={countingArea.toJS()}
                toggleDirection={() => this.props.dispatch(toggleCountingAreaType(id, countingArea.get('type')))}
              />
            }
          </React.Fragment>
        )}
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
            z-index: ${this.props.mode === EDITOR_MODE.ASKNAME || 
                       this.props.mode === EDITOR_MODE.SHOW_INSTRUCTION ||
                       this.props.mode === EDITOR_MODE.DELETE ? '7' : '2'};
          }

          {/* @media (min-aspect-ratio: 16/9) {
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
          } */}
        `}</style>
      </div>
    )
  }
}

export default connect((state) => {

  const countingAreasWithCenters = computeCountingAreasCenters(state.counter.get('countingAreas'), state.viewport.get('canvasResolution'))

  return {
    countingAreas: state.counter.get('countingAreas'), // Need to inject this as is it for componentDidUpdate comparison
    countingAreasWithCenters: countingAreasWithCenters,
    selectedCountingArea: state.counter.get('selectedCountingArea'),
    canvasResolution: state.viewport.get('canvasResolution'),
    mode: state.counter.get('mode')
  }
})(CounterAreasEditor)
