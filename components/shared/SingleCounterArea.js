import React, { Component } from 'react'
import { connect } from 'react-redux';

import { CIRCLE_RADIUS, POPOVER_HEIGHT, POPOVER_WIDTH, POPOVER_ARROW_SIZE } from '../../utils/constants';
import { COLORS } from '../../utils/colors';

import { DISPLAY_CLASSES } from '../../config.json';

class SingleCounterArea extends Component {

  constructor(props) {
    super(props);

    this.state = {
      showPopover : false
    }

    this.togglePopover = this.togglePopover.bind(this);
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
              className="area-popover"
              style={{
                  top: this.props.area.location.center.y - POPOVER_HEIGHT - CIRCLE_RADIUS / 2 - POPOVER_ARROW_SIZE - 5, 
                  left: this.props.area.location.center.x - POPOVER_WIDTH / 2
              }}
          >
              <div className="area-popover-title">
                  Neckator
              </div>
              <div className="area-popover-content">
                {/* TODO LIMIT to 6 ?, put on it's own component to reuse in dashboard */}
                {DISPLAY_CLASSES.map((counterClass) =>
                  <div className="area-popover-item" key={counterClass}>
                    <div className="area-popover-count">{this.props.counterData.get(counterClass) || 0}</div>
                    <img className="area-popover-icon" src={`/static/icons/counter/${counterClass}.svg`} />
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
                left: this.props.area.location.center.x - CIRCLE_RADIUS / 2,
                backgroundColor: COLORS[this.props.area.color]
            }} 
        >
        {this.props.counterData && this.props.counterData.get('_total') || 0}
        </div>
        <style jsx>{`
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

            .area-popover {
              position: absolute;
              background-color: black;
              color: white;
              z-index: 3;
              width: ${POPOVER_WIDTH}px;
              height: ${POPOVER_HEIGHT}px;
              background-color: black;
            }  

            .area-popover-title {
              background-color: #252525;
              width: 100%;
              padding: 5px;
              text-align: center;
              font-size: 20px;
            }

            .area-popover-content {
              display: flex;
              flex-wrap: wrap;
              padding: 5px;
              overflow: scroll;
            }

            .area-popover-item {
              display: flex;
              width: 75px;
              align-items: center;
              justify-content: center;
            }

            .area-popover-count {
              margin-right: 5px;
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
              border-top-color: black;
              border-width: ${POPOVER_ARROW_SIZE}px;
              margin-left: -${POPOVER_ARROW_SIZE}px;
            }
        `}</style>
      </React.Fragment>
    )
  }
}

export default SingleCounterArea;
