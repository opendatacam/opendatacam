import React, { Component } from 'react'
import { connect } from 'react-redux'

import { selectCountingArea, deleteCountingArea, addCountingArea } from '../../statemanagement/app/CounterStateManagement'

import { COLORS, AVAILABLE_COLORS } from '../../utils/colors';

class MenuCountingAreasEditor extends Component {

  render () {
    return (
      <div className="menu-active-areas">
        {Object.keys(this.props.countingAreas.toJS()).length > 0 &&
          <div
            className="delete button"
            onClick={() => this.props.dispatch(deleteCountingArea(this.props.selectedCountingArea))}
          >
            <img className="icon" src="/static/icons/icon-delete.svg" />
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
      
          .menu-active-areas .button{
            width: 2.5rem;
            height: 2.5rem;
            margin-right: 1.5rem;
            border: 5px solid transparent;
            transition: 100ms;
            display: flex;
            justify-content: center;
            align-items: center;
          }
      
          .menu-active-areas .delete{
            background-color: white;
          }
          .menu-active-areas .delete:hover {
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
    selectedCountingArea: state.counter.get('selectedCountingArea')
  }
})(MenuCountingAreasEditor)
