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
    this.isDrawing = false;
    this.polygon = {}
    this.points = []
  }

  checkIfClosedPolygon(point) {
    var radius = 6;
    if (this.points.length > 2) {
      var circleCenter = this.points[0];

      var dist_points = (point.x - circleCenter.x) * (point.x - circleCenter.x) + (point.y - circleCenter.y) * (point.y - circleCenter.y);
      radius *= radius;

      if (dist_points < radius) {
        return true;
      }

      return false;
    }
  }

  initListeners() {

    this.editorCanvas.on('mouse:down', (o) => {
      console.log('mouse down');
      if (!this.isDrawing) {
        let areaType = this.props.mode === EDITOR_MODE.EDIT_LINE ? 'bidirectional' : 'polygon';
        this.props.dispatch(addCountingArea(areaType));
        console.log('add counting area')
      }

      this.isDrawing = true;
      let pointer = this.editorCanvas.getPointer(o.e);

      if(this.props.mode === EDITOR_MODE.EDIT_POLYGON) {
        if (this.checkIfClosedPolygon(pointer)) {

          // this.points.push(this.points[0]);
          console.log('TODO save polygon')
          // this.props.dispatch(saveCountingPolygonLocation(this.props.selectedCountingPolygon, {
          //   point1: this.points[0],
          //   point2: this.points[1],
          //   refResolution: {
          //     w: this.editorCanvas.width,
          //     h: this.editorCanvas.height
          //   },
          //   polygon: this.points
          // }));

          this.isDrawing = false;
          this.points = []
          return;
        }
        else {
          this.points.push(pointer);
        }

        this.editorCanvas.remove(this.polygon[this.props.selectedCountingArea]);
        this.polygon[this.props.selectedCountingArea] = new fabric.Polygon(this.points, {
          strokeWidth: 5,
          fill: getCounterColor(this.props.countingAreas.getIn([this.props.selectedCountingArea, 'color'])),
          stroke: getCounterColor(this.props.countingAreas.getIn([this.props.selectedCountingArea, 'color'])),
          opacity: 0.3,
          selectable: false,
          hasBorders: false,
          hasControls: false,
        });

        console.log('add polygon to canvas')
        this.editorCanvas.add(this.polygon[this.props.selectedCountingArea]);
      }

      if(this.props.mode === EDITOR_MODE.EDIT_LINE) {
        this.points.push(pointer);
        // We finished the line
        if(this.points.length > 1) {
          this.isDrawing = false;
          let point1 = { x: this.points[0].x, y: this.points[0].y};
          let point2 = { x: this.points[1].x, y: this.points[1].y};
          // Only record if line distance if superior to some threshold to avoid single clicks
          if(computeDistance(point1, point2) > 50) {
            // Maybe use getCenterPoint to persist center
            this.props.dispatch(saveCountingAreaLocation(this.props.selectedCountingArea, {
              points: this.points,
              refResolution: {
                w: this.editorCanvas.width,
                h: this.editorCanvas.height
              }
            }))
          } else {
            // Cancel line, not long enough
            this.props.dispatch(deleteCountingArea(this.props.selectedCountingArea));
          }
          this.points = [];
          this.isDrawing = false;
          return;
        }
      }

      // Potential cause of bug if this.props.selectedCountingArea isn't
      // defined when we reach here

      // Draw line of last two points
      var lineCoord = [pointer.x, pointer.y, pointer.x, pointer.y]
      if(this.lines.length > 1) {
        lineCoord = [this.points[this.lines.length - 2].x, this.points[this.lines.length - 2].y, this.points[this.lines.length - 1].x, this.points[this.lines.length - 1].y]
      }

      this.lines[this.props.selectedCountingArea] = new fabric.Line(lineCoord, {
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
      console.log('mouse move');
      if (!this.isDrawing) return;

      let pointer = this.editorCanvas.getPointer(o.e);
      this.lines[this.props.selectedCountingArea].set({ x2: pointer.x, y2: pointer.y });
      // TODO STORE LINE DATA POINTS
      this.editorCanvas.renderAll();
    });

    this.editorCanvas.on('mouse:up', (o) => {
      console.log('mouse up');

      console.log('do stuff on mouse up')

      // let { x1, y1, x2, y2 } = this.lines[this.props.selectedCountingArea];
      // let point1 = { x:x1, y:y1};
      // let point2 = { x:x2, y:y2};
      // Only record if line distance if superior to some threshold to avoid single clicks
      // if(computeDistance(point1, point2) > 50) {
      //   // Maybe use getCenterPoint to persist center
      //   this.props.dispatch(saveCountingAreaLocation(this.props.selectedCountingArea, {
      //     point1: point1,
      //     point2: point2,
      //     refResolution: {
      //       w: this.editorCanvas.width,
      //       h: this.editorCanvas.height
      //     }
      //   }))
      // } else {
      //   // Cancel line, not long enough
      //   this.props.dispatch(deleteCountingArea(this.props.selectedCountingArea));
      // }
      // this.mouseDown = false;
    });
  }

  componentDidUpdate(prevProps) {
    // We may have to delete some lines
    if(prevProps.countingAreas !== this.props.countingAreas) {
      this.reRenderCountingAreasInEditor(this.props.countingAreas)
    }

    // We may have changed mode
    // TODO

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
        let points = [ data.points[0].x * reScalingFactorX, data.points[0].y * reScalingFactorY, data.points[1].x * reScalingFactorX, data.points[1].y * reScalingFactorY];
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
          top: data.points[0].y * reScalingFactorY,
          left: data.points[0].x * reScalingFactorX,
          originX: 'center',
          originY: 'center'
        }));
        this.editorCanvas.add(new fabric.Circle({
          radius: 5,
          fill: getCounterColor(color),
          top: data.points[1].y * reScalingFactorY,
          left: data.points[1].x * reScalingFactorX,
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
            close={() => this.props.dispatch(setMode(EDITOR_MODE.EDIT_LINE))}
          />
        }
        {this.props.mode === EDITOR_MODE.ASKNAME &&
          <AskNameModal
            save={(name) => this.props.dispatch(saveCountingAreaName(this.props.selectedCountingArea, name))}
            cancel={(name) => {
              this.props.dispatch(deleteCountingArea(this.props.selectedCountingArea))
              this.props.dispatch(setMode(EDITOR_MODE.EDIT_LINE))
            }}
          />
        }
        {this.props.mode === EDITOR_MODE.DELETE &&
          <DeleteModal
            countingAreasWithCenters={this.props.countingAreasWithCenters}
            delete={(id) => this.props.dispatch(deleteCountingArea(id))}
            cancel={() => { this.props.dispatch(setMode(EDITOR_MODE.EDIT_LINE)) }}
          />
        }
        {this.props.countingAreasWithCenters.entrySeq().map(([id, countingArea]) =>
          <React.Fragment key={id}>
            {countingArea.get('computed') && countingArea.get('location') &&
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
