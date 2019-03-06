import React, { Component } from 'react'
import { connect } from 'react-redux'

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
              className="btn btn-default inline-flex items-center rounded-l shadow"
              onClick={() => this.handleDelete()}
            >
              <img className="icon" src="/static/icons/icon-delete.svg" className="w-5" />
            </button>
            <button
              className="btn btn-default inline-flex items-center rounded-r shadow btn-default--active"
            >
              <img className="icon" src="/static/icons/icon-addline-blue.svg" className="w-7" />
            </button>
          </>
        }
        {this.props.mode === EDITOR_MODE.DELETE &&
          <button
            className="btn btn-default inline-flex items-center shadow rounded"
            onClick={() => this.props.dispatch(setMode(EDITOR_MODE.EDIT))}
          >
            <img className="icon" src="/static/icons/icon-close.svg" />
          </button>
        }
        <style jsx>{`
          .menu-active-areas{
            height: 3rem;
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
