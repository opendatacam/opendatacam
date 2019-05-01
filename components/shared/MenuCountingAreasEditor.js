import React, { Component } from 'react'
import { connect } from 'react-redux'
import SVG from 'react-inlinesvg';

import { selectCountingArea, deleteCountingArea, addCountingArea, setMode, EDITOR_MODE } from '../../statemanagement/app/CounterStateManagement'

import { COLORS, AVAILABLE_COLORS, evaluateCSSVariable } from '../../utils/colors';

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
        {this.props.mode !== EDITOR_MODE.DELETE &&
          <>
            <button
              className="btn btn-default p-0 rounded-l shadow"
              onClick={() => this.handleDelete()}
            >
              <SVG 
                className="w-12 h-12 svg-icon flex items-center" 
                cacheGetRequests={true}
                src={`/static/icons/ui/delete.svg`} 
                aria-label="icon delete"
              />
            </button>
            <button
              className="btn btn-default p-0 rounded-r shadow btn-default--active"
            >
              <SVG 
                className="w-12 h-12 svg-icon flex items-center" 
                cacheGetRequests={true}
                src={`/static/icons/ui/addline.svg`} 
                aria-label="icon edit"
              />
            </button>
          </>
        }
        {this.props.mode === EDITOR_MODE.DELETE &&
          <button
            className="btn btn-default p-0 rounded shadow"
            onClick={() => this.props.dispatch(setMode(EDITOR_MODE.EDIT))}
          >
            <SVG 
              className="w-12 h-12 svg-icon flex items-center" 
              cacheGetRequests={true}
              src={`/static/icons/ui/close.svg`} 
              aria-label="icon edit"
            />
          </button>
        }
        <style jsx>{`
          .menu-active-areas {
            display: flex;
            position: fixed;
            bottom: 1.5rem;
            left: 1.5rem;
            z-index: 5;
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
    mode: state.counter.get('mode')
  }
})(MenuCountingAreasEditor)
