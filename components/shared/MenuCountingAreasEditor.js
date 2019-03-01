import React, { Component } from 'react'
import { connect } from 'react-redux'

import { selectCountingArea, deleteCountingArea, addCountingArea, setMode, EDITOR_MODE } from '../../statemanagement/app/CounterStateManagement'

import { COLORS, AVAILABLE_COLORS } from '../../utils/colors';

class MenuCountingAreasEditor extends Component {

  handleDelete() {
    if(this.props.countingAreas.size > 1) {
      this.props.dispatch(setMode(EDITOR_MODE.DELETE))
    } else {
      this.props.dispatch(deleteCountingArea(this.props.countingAreas.keySeq().first()))
    }
  }

  render () {

    return (
      <div className="menu-active-areas">
        {this.props.countingAreas.size > 0 && this.props.mode !== EDITOR_MODE.DELETE &&
          <div
            className="btn"
            onClick={() => this.handleDelete()}
          >
            <img className="icon" src="/static/icons/icon-delete.svg" />
          </div>
        }
        {this.props.mode === EDITOR_MODE.DELETE &&
          <div
            className="btn"
            onClick={() => this.props.dispatch(setMode(EDITOR_MODE.EDIT))}
          >
            <img className="icon" src="/static/icons/icon-close.svg" />
          </div>
        }
        {/* {Object.keys(this.props.countingAreas.toJS()).map((color) =>
          <div 
            key={color}
            className={`new-color
              ${color} 
              button 
              ${color === this.props.selectedCountingArea ? 'selected' : ''}
            `}
            onClick={() => this.props.dispatch(selectCountingArea(color))}
          />
        )}
        {Object.keys(AVAILABLE_COLORS).length > Object.keys(this.props.countingAreas.toJS()).length  && 
          <div
            className="plus button"
            onClick={() => this.props.dispatch(addCountingArea())}
          >
            <img className="icon" src="/static/icons/icon-plus.svg" />
          </div>
        } */}
        <style jsx>{`
          .menu-active-areas{
            height: 3rem;
            display: flex;
            position: fixed;
            bottom: 1.5rem;
            left: 1.5rem;
            z-index: 5;
          }
      
          .menu-active-areas .btn{
            width: 2.5rem;
            height: 2.5rem;
            margin-right: 1.5rem;
            border: 5px solid transparent;
            transition: 100ms;
            display: flex;
            justify-content: center;
            align-items: center;
          }
      
          .menu-active-areas .btn{
            background-color: white;
          }
          .menu-active-areas .btn:hover {
            border: 5px solid #D6D6D6;
          }
          
          {/* .menu-active-areas .yellow {
            background-color: ${COLORS.yellow};
          }
          .menu-active-areas .yellow:hover,
          .menu-active-areas .yellow.selected {
            border: 5px solid ${COLORS.yellowBorder};
          }
          .menu-active-areas .turquoise {
            background-color: ${COLORS.turquoise};
          }
          .menu-active-areas .turquoise:hover,
          .menu-active-areas .turquoise.selected {
            border: 5px solid ${COLORS.turquoiseBorder};
          }

          .menu-active-areas .green {
            background-color: ${COLORS.green};
          }
          .menu-active-areas .green:hover,
          .menu-active-areas .green.selected {
            border: 5px solid ${COLORS.greenBorder};
          }

          .menu-active-areas .purple {
            background-color: ${COLORS.purple};
          }
          .menu-active-areas .purple:hover,
          .menu-active-areas .purple.selected {
            border: 5px solid ${COLORS.purpleBorder};
          } */}
        `}</style>
      </div>
    )
  }
}

export default connect((state) => {
  return {
    countingAreas: state.counter.get('countingAreas'),
    selectedCountingArea: state.counter.get('selectedCountingArea'),
    mode: state.counter.get('mode')
  }
})(MenuCountingAreasEditor)
