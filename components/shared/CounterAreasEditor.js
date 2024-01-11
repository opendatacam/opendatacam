import React, { Component } from 'react';

import { connect } from 'react-redux';

import MenuCountingAreasEditor from './MenuCountingAreasEditor';

import {
  addCountingArea,
  computeCountingAreasCenters,
  deleteCountingArea,
  EDITOR_MODE,
  saveCountingAreaLocation,
  saveCountingAreaName,
  setMode,
  toggleCountingAreaType,
} from '../../statemanagement/app/CounterStateManagement';
import AskNameModal from './AskNameModal';
import DeleteModal from './DeleteModal';
import InstructionsModal from './InstructionsModal';
import SingleCounterDirection from './SingleCounterDirection';
import { getCounterColor } from '../../utils/colors';

function computeDistance(point1, point2) {
  const xDist = (point2.x - point1.x) ** 2;
  const yDist = (point2.y - point1.y) ** 2;
  return Math.sqrt(xDist + yDist);
}

class CounterAreasEditor extends Component {
  constructor(props) {
    super(props);

    this.state = {
      editorInitialized: false,
    };

    this.escFunction = this.escFunction.bind(this);

    // Fabric.js state
    this.currentLine = null;
    this.currentPolygon = null;

    this.isDrawing = false;
    this.points = [];
  }

  checkIfClosedPolygon(point) {
    let radius = 15;
    if (this.points.length > 2) {
      const circleCenter = this.points[0];

      const dist_points = (point.x - circleCenter.x) * (point.x - circleCenter.x) + (point.y - circleCenter.y) * (point.y - circleCenter.y);
      radius *= radius;

      if (dist_points < radius) {
        return true;
      }

      return false;
    }

    return false;
  }

  resetDrawing() {
    this.isDrawing = false;
    this.points = [];
    this.currentPolygon = null;
    this.currentLine = null;
  }

  escFunction(event) {
    // Prevent catching esc key press from delete or ask name modal
    if (this.props.mode === EDITOR_MODE.EDIT_LINE || this.props.mode === EDITOR_MODE.EDIT_POLYGON) {
      if (event.keyCode === 27) {
        this.props.dispatch(deleteCountingArea(this.props.selectedCountingArea));
        this.resetDrawing();
      }
    }
  }

  initListeners() {
    this.editorCanvas.on('mouse:down', (o) => {
      if (!this.isDrawing) {
        const areaType = this.props.mode === EDITOR_MODE.EDIT_LINE ? 'bidirectional' : 'polygon';
        this.props.dispatch(addCountingArea(areaType));
      }

      this.isDrawing = true;
      const pointer = this.editorCanvas.getPointer(o.e);

      if (this.props.mode === EDITOR_MODE.EDIT_POLYGON) {
        if (this.checkIfClosedPolygon(pointer)) {
          // Close polygon
          this.points.push(this.points[0]);
          // Save polygon
          this.props.dispatch(saveCountingAreaLocation(this.props.selectedCountingArea, {
            points: this.points,
            refResolution: {
              w: this.editorCanvas.width,
              h: this.editorCanvas.height,
            },
          }));

          // Reset editor
          this.isDrawing = false;
          this.points = [];
          return;
        }

        this.points.push(pointer);

        this.editorCanvas.remove(this.currentPolygon);
        this.currentPolygon = new fabric.Polygon(this.points, {
          strokeWidth: 5,
          fill: getCounterColor(this.props.countingAreas.getIn([this.props.selectedCountingArea, 'color'])),
          stroke: getCounterColor(this.props.countingAreas.getIn([this.props.selectedCountingArea, 'color'])),
          opacity: 0.3,
          selectable: false,
          hasBorders: false,
          hasControls: false,
        });

        this.editorCanvas.add(this.currentPolygon);
      }

      if (this.props.mode === EDITOR_MODE.EDIT_LINE) {
        this.points.push(pointer);
        // We finished the line
        if (this.points.length > 1) {
          this.isDrawing = false;
          const point1 = { x: this.points[0].x, y: this.points[0].y };
          const point2 = { x: this.points[1].x, y: this.points[1].y };
          // Only record if line distance if superior to some threshold to avoid single clicks
          if (computeDistance(point1, point2) > 50) {
            // Maybe use getCenterPoint to persist center
            this.props.dispatch(saveCountingAreaLocation(this.props.selectedCountingArea, {
              points: this.points,
              refResolution: {
                w: this.editorCanvas.width,
                h: this.editorCanvas.height,
              },
            }));
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

      // Init line of last two points
      const lineCoord = [pointer.x, pointer.y, pointer.x, pointer.y];
      // For touch devices, draw previous line
      if (this.points.length > 1) {
        this.currentLine.set({ x2: pointer.x, y2: pointer.y });
      }

      this.currentLine = new fabric.Line(lineCoord, {
        strokeWidth: 5,
        fill: getCounterColor(this.props.countingAreas.getIn([this.props.selectedCountingArea, 'color'])),
        stroke: getCounterColor(this.props.countingAreas.getIn([this.props.selectedCountingArea, 'color'])),
        originX: 'center',
        originY: 'center',
      });
      this.editorCanvas.add(this.currentLine);

      this.editorCanvas.add(new fabric.Circle({
        radius: 5,
        fill: getCounterColor(this.props.countingAreas.getIn([this.props.selectedCountingArea, 'color'])),
        top: pointer.y,
        left: pointer.x,
        originX: 'center',
        originY: 'center',
      }));
    });

    this.editorCanvas.on('mouse:move', (o) => {
      if (!this.isDrawing) return;

      const pointer = this.editorCanvas.getPointer(o.e);
      this.currentLine.set({ x2: pointer.x, y2: pointer.y });
      // TODO STORE LINE DATA POINTS
      this.editorCanvas.renderAll();
    });
  }

  componentDidMount() {
    if (this.elCanvas) {
      const { width, height } = this.elCanvas.getBoundingClientRect();
      this.editorCanvas = new fabric.Canvas(this.elCanvas, { selection: false, width, height });

      // If no countingAreas exists already
      if (Object.keys(this.props.countingAreas).length === 0) {
        this.props.dispatch(setMode(EDITOR_MODE.SHOW_INSTRUCTION));
      } else {
        this.reRenderCountingAreasInEditor(this.props.countingAreas);
      }

      this.initListeners();
    }

    document.addEventListener('keydown', this.escFunction, false);
  }

  componentDidUpdate(prevProps) {
    // We may have to delete some lines
    //console.debug('componentDidUpdate');
    //console.debug(this.props.countingAreas);
    if (prevProps.countingAreas !== this.props.countingAreas) {
      this.reRenderCountingAreasInEditor(this.props.countingAreas);
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

  componentWillUnmount() {
    document.removeEventListener('keydown', this.escFunction, false);
  }

  reRenderCountingAreasInEditor(countingAreas) {
    // Clear canvas
    this.editorCanvas.clear();
    this.resetDrawing();

    const { width, height } = this.elCanvas.getBoundingClientRect();

    Object.values(countingAreas).forEach((area) => {
      if (area.location !== undefined) {
        const data = area.location;
        const { color } = area;
        const reScalingFactorX = width / data.refResolution.w;
        const reScalingFactorY = height / data.refResolution.h;

        // Rescale points
        const points = data.points.map((point) => ({
          x: point.x * reScalingFactorX,
          y: point.y * reScalingFactorY,
        }));

        for (let index = 0; index < points.length; index++) {
          const point = points[index];
          // Draw circle
          this.editorCanvas.add(new fabric.Circle({
            radius: 5,
            fill: getCounterColor(color),
            top: point.y,
            left: point.x,
            originX: 'center',
            originY: 'center',
          }));

          // Draw line connecting to previous point
          if (index > 0) {
            const coordinates = [points[index - 1].x, points[index - 1].y,
              points[index].x, points[index].y];
            this.editorCanvas.add(new fabric.Line(coordinates, {
              strokeWidth: 5,
              fill: getCounterColor(color),
              stroke: getCounterColor(color),
              originX: 'center',
              originY: 'center',
            }));
          }
        }

        // Draw polygon if length > 2
        if (points.length > 2) {
          this.editorCanvas.add(new fabric.Polygon(points, {
            strokeWidth: 5,
            fill: getCounterColor(color),
            stroke: getCounterColor(color),
            opacity: 0.3,
            selectable: false,
            hasBorders: false,
            hasControls: false,
          }));
        }
      }
    });
  }

  render() {
    return (
      <div
        className="counting-areas-editor"
      >
        {this.props.mode === EDITOR_MODE.SHOW_INSTRUCTION
          && (
          <InstructionsModal
            close={() => this.props.dispatch(setMode(EDITOR_MODE.EDIT_LINE))}
          />
          )}
        {this.props.mode === EDITOR_MODE.ASKNAME
          && (
          <AskNameModal
            save={(name) => {
              this.props.dispatch(saveCountingAreaName(this.props.selectedCountingArea, name));
              this.props.dispatch(setMode(this.props.lastEditingMode));
            }}
            cancel={(name) => {
              this.props.dispatch(deleteCountingArea(this.props.selectedCountingArea));
              this.props.dispatch(setMode(this.props.lastEditingMode));
            }}
          />
          )}
        {this.props.mode === EDITOR_MODE.DELETE
          && (
          <DeleteModal
            countingAreasWithCenters={this.props.countingAreasWithCenters}
            delete={(id) => this.props.dispatch(deleteCountingArea(id))}
            cancel={() => this.props.dispatch(setMode(this.props.lastEditingMode))}
          />
          )}
        {Object.entries(this.props.countingAreasWithCenters).forEach(([id, countingArea]) => (
          <React.Fragment key={id}>
            {countingArea.type !== 'polygon' && countingArea.computed && countingArea.location
              && (
              <SingleCounterDirection
                key={id}
                area={countingArea}
                toggleDirection={() => this.props.dispatch(toggleCountingAreaType(id, countingArea.type))}
              />
              )}
          </React.Fragment>
        ))}
        <MenuCountingAreasEditor />
        <canvas
          ref={(el) => this.elCanvas = el}
          width={this.props.canvasResolution.w}
          height={this.props.canvasResolution.h}
          className="editor-canvas"
        />
        <style jsx>
          {`
          .counting-areas-editor,.editor-canvas  {
            position: absolute;
            top: 0;
            right: 0;
            left: 0;
            bottom: 0;
            z-index: ${this.props.mode === EDITOR_MODE.ASKNAME
                       || this.props.mode === EDITOR_MODE.SHOW_INSTRUCTION
                       || this.props.mode === EDITOR_MODE.DELETE ? '7' : '2'};
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
        `}
        </style>
      </div>
    );
  }
}

export default connect((state, ownProps) => {
  // console.debug({ event: 'connect called', counter: state.counter });
  // console.debug(state.counter.countingAreas);
  const countingAreasWithCenters = computeCountingAreasCenters(state.counter.countingAreas,
    state.viewport.canvasResolution);

  return {
    // Need to inject this as is it for componentDidUpdate comparison
    countingAreas: state.counter.countingAreas,
    countingAreasWithCenters,
    selectedCountingArea: state.counter.selectedCountingArea,
    canvasResolution: state.viewport.canvasResolution,
    mode: state.counter.mode,
    lastEditingMode: state.counter.lastEditingMode,
  };
})(CounterAreasEditor);
