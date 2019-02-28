import { fromJS } from 'immutable'
import axios from 'axios';
import { AVAILABLE_COLORS } from '../../utils/colors';

// Initial state
const initialState = fromJS({
  countingAreas: {},
  selectedCountingArea: 'yellow',
  counterDashboard: {}
})

// Actions
const SELECT_COUNTING_AREA = 'Counter/SELECT_COUNTING_AREA'
const DELETE_COUNTING_AREA = 'Counter/DELETE_COUNTING_AREA'
const SAVE_COUNTING_AREA = 'Counter/SAVE_COUNTING_AREA'
const ADD_COUNTING_AREA = 'Counter/ADD_COUNTING_AREA'
const RESTORE_COUNTING_AREAS = 'Counter/RESTORE_COUNTING_AREAS'
const UPDATE_COUNTERDASHBOARD = 'Counter/UPDATE_COUNTERDASHBOARD'

export function updateCounterDashboard(data) {
  return {
    type: UPDATE_COUNTERDASHBOARD,
    payload: data
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

export function deleteCountingArea(color) {
  return (dispatch, getState) => {

    dispatch({
      type: DELETE_COUNTING_AREA,
      payload: color
    });

    // Select one remaining counting areas
    const remainingCountingAreas = Object.keys(getState().counter.get('countingAreas').toJS());
    if(remainingCountingAreas.length > 0) {
      dispatch(selectCountingArea(remainingCountingAreas[remainingCountingAreas.length - 1]));
    }
    dispatch(registerCountingAreasOnServer());
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

      dispatch(selectCountingArea(unUsedColors[0]));
    }
  }
}

export function saveCountingArea(color, data) {
  return (dispatch, getState) => {
    dispatch({
      type: SAVE_COUNTING_AREA,
      payload: {
        color: color,
        data: data
      }
    });

    dispatch(registerCountingAreasOnServer());
  }
}

export function restoreCountingAreas(countingAreas) {
  return {
    type: RESTORE_COUNTING_AREAS,
    payload: countingAreas
  }
}

// TODO LATER , introduce Redux saga here to make it more explicit that this is triggered by
// => SAVE_COUNTING_AREA
// => DELETE_COUNTING_AREA
export function registerCountingAreasOnServer() {
  return (dispatch, getState) => {
    // Ping webservice to start storing data on server
    axios.post('/counter/areas',{
      countingAreas: getState().counter.get('countingAreas').toJS()
    });
  }
}



// Reducer
export default function CounterReducer (state = initialState, action = {}) {
  switch (action.type) {
    case SELECT_COUNTING_AREA:
      return state.set('selectedCountingArea', action.payload)
    case DELETE_COUNTING_AREA:
      return state.deleteIn(['countingAreas', action.payload])
    case SAVE_COUNTING_AREA:
      return state.setIn(['countingAreas', action.payload.color], fromJS(action.payload.data))
    case ADD_COUNTING_AREA:
      return state.setIn(['countingAreas', action.payload], null)
    case RESTORE_COUNTING_AREAS:
      return state.set('countingAreas', fromJS(action.payload))
    case UPDATE_COUNTERDASHBOARD:
      return state.setIn(['counterDashboard'], fromJS(action.payload))
    default:
      return state
  }
}
