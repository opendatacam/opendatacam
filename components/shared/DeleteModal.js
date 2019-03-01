import React, { Component } from 'react';
import CanvasEngine from '../canvas/CanvasEngine';
import { MODE, CIRCLE_RADIUS, CANVAS_RENDERING_MODE } from '../../utils/constants';
import { COLORS } from '../../utils/colors';

class DeleteModal extends Component {

  render() {

    return (
      <div className="overlay">
        {this.props.countingAreasWithCenters.entrySeq().map(([id, countingArea]) =>
          <div
            className="circle"
            key={id}
            onClick={() => this.props.delete(id)}
            style={{
                top: countingArea.getIn(['location','center','y']) - (CIRCLE_RADIUS) / 2, 
                left: countingArea.getIn(['location','center','x']) - (CIRCLE_RADIUS) / 2,
                backgroundColor: COLORS[countingArea.get('color')]
            }}
          >
            <img className="icon" src="/static/icons/icon-delete.svg" />
          </div>
        )}
        
        <CanvasEngine mode={CANVAS_RENDERING_MODE.COUNTING_AREAS} />
        <style jsx>{`
          .overlay {
            position: fixed;
            left: 0;
            top: 0;
            width: 100%;
            height: 100%;
            background-color: rgba(0,0,0,0.8);
            z-index: 5;
          }

          .circle {
            position: absolute;
            border-radius: ${CIRCLE_RADIUS}px;
            z-index: 2;
            min-width: ${CIRCLE_RADIUS}px;
            height: ${CIRCLE_RADIUS}px;
            line-height: ${CIRCLE_RADIUS}px;
            font-size: 16px;
            font-weight: bold;
            padding-left: 5px;
            padding-right: 5px;
            color: black;
            text-align: center;
            cursor: pointer;
          }
        `}</style>
      </div>
    )
  }
}

export default DeleteModal;
