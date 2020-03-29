import React, { Component } from 'react'

import { ICON_DIRECTION_SIZE, CIRCLE_RADIUS, COUNTING_AREA_TYPE } from '../../utils/constants';

import { getCounterColor } from '../../utils/colors';

class SingleCounterDirection extends Component {

  render () {

    return (
      <React.Fragment>
        <div
            className="circle"
            onClick={() => this.props.toggleDirection()}
            style={{
                top: this.props.area.location.center.y - CIRCLE_RADIUS / 2, 
                left: this.props.area.location.center.x - CIRCLE_RADIUS / 2,
                backgroundColor: getCounterColor(this.props.area.color)
            }} 
        >
          {this.props.area.type === COUNTING_AREA_TYPE.BIDIRECTIONAL &&
            <img className="icon-direction" src="/static/icons/ui/arrow-double.svg" />
          }
          {this.props.area.type === COUNTING_AREA_TYPE.LEFTRIGHT_TOPBOTTOM &&
            <img className="icon-direction" src="/static/icons/ui/arrow-up.svg" />
          }
          {this.props.area.type === COUNTING_AREA_TYPE.RIGHTLEFT_BOTTOMTOP &&
            <img className="icon-direction" src="/static/icons/ui/arrow-down.svg" />
          }
        </div>
        <style jsx>{`
            .circle {
                position: absolute;
                border-radius: ${CIRCLE_RADIUS}px;
                z-index: 5;
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
                display: flex;
                align-items: center;
            }  

            .icon-direction {
              width: ${ICON_DIRECTION_SIZE}px;
              height: ${ICON_DIRECTION_SIZE}px;
              transform: rotate(${this.props.area.computed.lineBearings[0] + 90}deg);
            }
        `}</style>
      </React.Fragment>
    )
  }
}

export default SingleCounterDirection;
