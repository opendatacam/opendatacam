import { fromJS } from 'immutable'
import axios from 'axios';
import { AVAILABLE_COLORS } from '../../utils/colors';
import uuidv4 from 'uuid/v4'

// Initial state
const initialState = fromJS({
  countingAreas: {},
  selectedCountingArea: null,
  askName: false,
  counterDashboard: {}
})

// Actions
const SELECT_COUNTING_AREA = 'Counter/SELECT_COUNTING_AREA'
const DELETE_COUNTING_AREA = 'Counter/DELETE_COUNTING_AREA'
const SAVE_COUNTING_AREA_LOCATION = 'Counter/SAVE_COUNTING_AREA_LOCATION'
const ASK_COUNTING_AREA_NAME = 'Counter/ASK_COUNTING_AREA_NAME'
const SAVE_COUNTING_AREA_NAME = 'Counter/SAVE_COUNTING_AREA_NAME'
const ADD_COUNTING_AREA = 'Counter/ADD_COUNTING_AREA'
const RESTORE_COUNTING_AREAS = 'Counter/RESTORE_COUNTING_AREAS'
const UPDATE_COUNTERDASHBOARD = 'Counter/UPDATE_COUNTERDASHBOARD'


export function updateCounterDashboard(data) {
  return {
    type: UPDATE_COUNTERDASHBOARD,
    payload: data
  }
}

export function selectCountingArea(id) {
  return {
    type: SELECT_COUNTING_AREA,
    payload: id
  }
}

export function deleteCountingArea(id) {
  return (dispatch, getState) => {

    dispatch({
      type: DELETE_COUNTING_AREA,
      payload: id
    });

    dispatch(registerCountingAreasOnServer());
  }
}

export function addCountingArea() {
  return (dispatch, getState) => {

    let newCountingAreaId = uuidv4();

    // Get a color unused
    let color = AVAILABLE_COLORS.find((potentialColor) => {
      return getState().counter.get('countingAreas').findEntry((value) => value.get('color') === potentialColor) === undefined
    })

    dispatch({
      type: ADD_COUNTING_AREA,
      payload: {
        id: newCountingAreaId,
        color: color
      }
    })

    dispatch(selectCountingArea(newCountingAreaId));
  }
}

export function saveCountingAreaLocation(id, location) {
  return (dispatch, getState) => {

    dispatch({
      type: SAVE_COUNTING_AREA_LOCATION,
      payload: {
        location,
        id
      }
    });

    if(!getState().counter.getIn(['countingAreas', id, 'name'])) {
      dispatch(askForCountingAreaName());
    } else {
      dispatch(registerCountingAreasOnServer());
    }
  }
}

export function saveCountingAreaName(id, name) {
  return (dispatch, getState) => {
    dispatch({
      type: SAVE_COUNTING_AREA_NAME,
      payload: {
        id,
        name
      }
    })

    dispatch(registerCountingAreasOnServer());
  }
}

export function askForCountingAreaName() {
  return {
    type: ASK_COUNTING_AREA_NAME
  }
}

export function restoreCountingAreas(countingAreas) {
  return {
    type: RESTORE_COUNTING_AREAS,
    payload: countingAreas
  }
}

// TODO LATER , introduce Redux saga here to make it more explicit that this is triggered by
// => SAVE_COUNTING_AREA_LOCATION
// => SAVE_COUNTING_AREA_NAME
// => DELETE_COUNTING_AREA
export function registerCountingAreasOnServer() {
  return (dispatch, getState) => {
    // Ping webservice to start storing data on server
    axios.post('/counter/areas',{
      countingAreas: getState().counter.get('countingAreas').toJS()
    });
  }
}


// export function selectNextCountingArea() {
//   return (dispatch, getState) => {
//     let countingAreas = Object.keys(getState().counter.get('countingAreas').toJS());
//     let selectedArea = getState().counter.get('selectedCountingArea');
//     let index = countingAreas.indexOf(selectedArea);
//     if((index + 1) > (countingAreas.length - 1)) {
//       // Select first item
//       dispatch(selectCountingArea(countingAreas[0]))
//     } else {
//       dispatch(selectCountingArea(countingAreas[index + 1]))
//     }
//   }
// }

// export function selectPreviousCountingArea() {
//   return (dispatch, getState) => {
//     let countingAreas = Object.keys(getState().counter.get('countingAreas').toJS());
//     let selectedArea = getState().counter.get('selectedCountingArea');
//     let index = countingAreas.indexOf(selectedArea);
//     if(index - 1 < 0) {
//       // Select last item
//       dispatch(selectCountingArea(countingAreas[countingAreas.length - 1]))
//     } else {
//       dispatch(selectCountingArea(countingAreas[index - 1]))
//     }
//   }
// }


// Reducer
export default function CounterReducer (state = initialState, action = {}) {
  switch (action.type) {
    case SELECT_COUNTING_AREA:
      return state.set('selectedCountingArea', action.payload)
    case DELETE_COUNTING_AREA:
      return state.deleteIn(['countingAreas', action.payload])
    case SAVE_COUNTING_AREA_LOCATION:
      return state.setIn(['countingAreas', action.payload.id, 'location'], fromJS(action.payload.location))
    case SAVE_COUNTING_AREA_NAME:
      return state.set('askName', false)
                  .setIn(['countingAreas', action.payload.id, 'name'], action.payload.name)
    case ASK_COUNTING_AREA_NAME:
      return state.set('askName', true)
    case ADD_COUNTING_AREA:
      return state.setIn(['countingAreas', action.payload.id], fromJS({
        color: action.payload.color
      }))
    case RESTORE_COUNTING_AREAS:
      return state.set('countingAreas', fromJS(action.payload))
    case UPDATE_COUNTERDASHBOARD:
      return state.setIn(['counterDashboard'], fromJS(action.payload));
    default:
      return state
  }
}
