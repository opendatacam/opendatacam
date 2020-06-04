import React, { Component } from 'react'
import { connect } from 'react-redux';

import { ICON_DIRECTION_SIZE, CIRCLE_RADIUS, POPOVER_HEIGHT, POPOVER_WIDTH, POPOVER_ARROW_SIZE, COUNTING_AREA_TYPE } from '../../utils/constants';

import SVG from 'react-inlinesvg';
import OpenMoji from './OpenMoji';
import { getCounterColor, getDisplayClasses } from '../../utils/colors';

class SingleCounterArea extends Component {

  constructor(props) {
    super(props);

    this.state = {
      showPopover : false
    }

    this.togglePopover = this.togglePopover.bind(this);

    this.DISPLAY_CLASSES = getDisplayClasses();
  }


  componentDidMount() {

  }

  componentWillUnmount() {

  }

  togglePopover() {
    if(this.state.showPopover) {
      this.setState({
        showPopover: false
      })
    } else {
      this.setState({
        showPopover: true
      })
    }
  }

  render () {

    // TODO POSITION BOTTOM IN CASE NO SPACE ON TOP

    return (
      <React.Fragment>
        {this.props.counterData && this.state.showPopover &&
          <div 
              className="area-popover bg-default text-inverse"
              style={{
                  top: this.props.area.location.center.y - POPOVER_HEIGHT - CIRCLE_RADIUS / 2 - POPOVER_ARROW_SIZE - 5, 
                  left: this.props.area.location.center.x - POPOVER_WIDTH / 2
              }}
          >
              <h4 className="area-popover-title border-b border-default-soft text-center py-2">
                {this.props.area.name}
              </h4>
              <div className="area-popover-content">
                {/* TODO LIMIT to 6 ?, put on it's own component to reuse in dashboard */}
                {this.DISPLAY_CLASSES.slice(0, Math.min(this.DISPLAY_CLASSES.length, 6)).map((counterClass) =>
                  <div className="area-popover-item mb-1" key={counterClass.class}>
                    <div className="area-popover-count mr-2">{this.props.counterData.get(counterClass.class) || 0}</div>
                    <OpenMoji
                      hexcode={counterClass.hexcode}
                      class={counterClass.class}
                    />
                  </div>
                )}
              </div>
          </div>
        }
        <div
            className="circle"
            onClick={this.togglePopover}
            style={{
                top: this.props.area.location.center.y - CIRCLE_RADIUS / 2, 
                left: this.props.area.location.center.x - CIRCLE_RADIUS / 2 - (ICON_DIRECTION_SIZE + 5) / 2,
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
          <div className="counter-value">
            {this.props.counterData && this.props.counterData.get('_total') || 0}
          </div>
        </div>
        <style jsx>{`
            .circle {
                position: absolute;
                border-radius: ${CIRCLE_RADIUS}px;
                z-index: 2;
                min-width: ${CIRCLE_RADIUS + ICON_DIRECTION_SIZE + 5}px;
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

            .counter-value {
              min-width: ${CIRCLE_RADIUS - ICON_DIRECTION_SIZE - 3}px;
              margin-left: 3px;
            }

            .area-popover {
              position: absolute;
              z-index: 3;
              width: ${POPOVER_WIDTH}px;
              height: ${POPOVER_HEIGHT}px;
            }  

            .area-popover-title {
              width: 100%;
            }

            .area-popover-content {
              display: flex;
              flex-wrap: wrap;
              padding: 5px;
              overflow: hidden;
            }

            .area-popover-item {
              display: flex;
              width: 75px;
              align-items: center;
              justify-content: center;
            }

            .area-popover:after {
              top: 100%;
              left: 50%;
              border: solid transparent;
              content: " ";
              height: 0;
              width: 0;
              position: absolute;
              pointer-events: none;
              border-color: rgba(0, 0, 0, 0);
              border-top-color: var(--color-default);
              border-width: ${POPOVER_ARROW_SIZE}px;
              margin-left: -${POPOVER_ARROW_SIZE}px;
            }
        `}</style>
      </React.Fragment>
    )
  }
}

export default SingleCounterArea;
