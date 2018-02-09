import { fromJS } from 'immutable'
import axios from 'axios';
import { AVAILABLE_COLORS } from '../../utils/colors';

// Initial state
const initialState = fromJS({
  countingData: {
    currentFPS: 0,
    currentTime: 0,
    yoloStarted: false,
    yoloIsStarting: false
  },
  countingAreas: {
    yellow: null,
    turquoise: null
  },
  selectedCountingArea: 'yellow'
})

// Actions
const FETCH_COUNTINGDATA_SUCCESS = 'Counter/FETCH_COUNTINGDATA'
const SELECT_COUNTING_AREA = 'Counter/SELECT_COUNTING_AREA'
const CLEAR_COUNTING_AREA = 'Counter/CLEAR_COUNTING_AREA'
const SAVE_COUNTING_AREA = 'Counter/SAVE_COUNTING_AREA'
const ADD_COUNTING_AREA = 'Counter/ADD_COUNTING_AREA'

export function fetchCountingData() {
  return (dispatch, getState) => {
    axios.get('/counter/dashboard').then((response) => {
      dispatch({
        type: FETCH_COUNTINGDATA_SUCCESS,
        payload: response.data
      })
    });
  }
}

export function exportCountingData() {
  return (dispatch, getState) => {
    let link = document.createElement("a");
    link.href = '/counter/export';
    link.click();
  }
}

export function selectCountingArea(color) {
  return {
    type: SELECT_COUNTING_AREA,
    payload: color
  }
}

export function selectNextCountingArea() {
  return (dispatch, getState) => {
    let countingAreas = Object.keys(getState().counter.get('countingAreas').toJS());
    let selectedArea = getState().counter.get('selectedCountingArea');
    let index = countingAreas.indexOf(selectedArea);
    if((index + 1) > (countingAreas.length - 1)) {
      // Select first item
      dispatch(selectCountingArea(countingAreas[0]))
    } else {
      dispatch(selectCountingArea(countingAreas[index + 1]))
    }
  }
}

export function selectPreviousCountingArea() {
  return (dispatch, getState) => {
    let countingAreas = Object.keys(getState().counter.get('countingAreas').toJS());
    let selectedArea = getState().counter.get('selectedCountingArea');
    let index = countingAreas.indexOf(selectedArea);
    if(index - 1 < 0) {
      // Select last item
      dispatch(selectCountingArea(countingAreas[countingAreas.length - 1]))
    } else {
      dispatch(selectCountingArea(countingAreas[index - 1]))
    }
  }
}

export function clearCountingArea(color) {
  return {
    type: CLEAR_COUNTING_AREA,
    payload: color
  }
}

export function addCountingArea() {
  return (dispatch, getState) => {

    const usedColors = Object.keys(getState().counter.get('countingAreas').toJS());

    const unUsedColors = AVAILABLE_COLORS.filter((color) => usedColors.indexOf(color) === -1)

    if(unUsedColors) {
      dispatch({
        type: ADD_COUNTING_AREA,
        payload: unUsedColors[0]
      })
    }
  }
}

export function saveCountingArea(color, data) {
  return {
    type: SAVE_COUNTING_AREA,
    payload: {
      color: color,
      data: data
    }
  }
}

// Reducer
export default function CounterReducer (state = initialState, action = {}) {
  switch (action.type) {
    case FETCH_COUNTINGDATA_SUCCESS:
      return state.set('countingData', fromJS(action.payload))
    case SELECT_COUNTING_AREA:
      return state.set('selectedCountingArea', action.payload)
    case CLEAR_COUNTING_AREA:
      return state.setIn(['countingAreas', action.payload], null)
    case SAVE_COUNTING_AREA:
      return state.setIn(['countingAreas', action.payload.color], fromJS(action.payload.data))
    case ADD_COUNTING_AREA:
      return state.setIn(['countingAreas', action.payload], null)
    default:
      return state
  }
}
