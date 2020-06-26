import { fromJS } from 'immutable'
import axios from 'axios';
import uuidv4 from 'uuid/v4'
import { scalePoint } from '../../utils/resolution';
import { getURLData } from '../../server/utils/urlHelper';
import { getAvailableCounterColors, getDefaultCounterColor } from '../../utils/colors.js';
import { computeLineBearing } from '../../server/tracker/utils';
import { COUNTING_AREA_TYPE } from '../../utils/constants';

// Rename this to CounterEditorStateManagement

export const EDITOR_MODE = {
  EDIT: 'edit',
  ASKNAME: 'askname',
  DELETE: 'delete',
  SHOW_INSTRUCTION: 'showinstruction'
}

// Initial state
const initialState = fromJS({
  countingAreas: {},
  selectedCountingArea: null,
  mode: EDITOR_MODE.EDIT, // oneOf EDITOR_MODE
  counterSummary: {},
  trackerSummary: {} 
})

// Actions
const SELECT_COUNTING_AREA = 'Counter/SELECT_COUNTING_AREA'
const DELETE_COUNTING_AREA = 'Counter/DELETE_COUNTING_AREA'
const SAVE_COUNTING_AREA_LOCATION = 'Counter/SAVE_COUNTING_AREA_LOCATION'
const SAVE_COUNTING_AREA_TYPE = 'Counter/SAVE_COUNTING_AREA_TYPE'
const SET_MODE = 'Counter/SET_MODE'
const SAVE_COUNTING_AREA_NAME = 'Counter/SAVE_COUNTING_AREA_NAME'
const ADD_COUNTING_AREA = 'Counter/ADD_COUNTING_AREA'
const RESTORE_COUNTING_AREAS = 'Counter/RESTORE_COUNTING_AREAS'
const RESET_COUNTING_AREAS = 'Counter/RESET_COUNTING_AREAS'
const UPDATE_COUNTERSUMMARY = 'Counter/UPDATE_COUNTERSUMMARY'
const UPDATE_TRACKERSUMMARY = 'Counter/UPDATE_TRACKERSUMMARY'


export function setMode(mode) {
  return {
    type: SET_MODE,
    payload: mode
  }
}

export function updateCounterSummary(data) {
  return {
    type: UPDATE_COUNTERSUMMARY,
    payload: data
  }
}

export function updateTrackerSummary(data) {
  return {
    type: UPDATE_TRACKERSUMMARY,
    payload: data
  }
}

export function selectCountingArea(id) {
  return {
    type: SELECT_COUNTING_AREA,
    payload: id
  }
}

export function resetCountingAreas() {
  return (dispatch, getState) => {
    dispatch({
      type: RESET_COUNTING_AREAS
    });

    dispatch(registerCountingAreasOnServer());
  }
}

export function deleteCountingArea(id) {
  return (dispatch, getState) => {

    dispatch({
      type: DELETE_COUNTING_AREA,
      payload: id
    });

    if(getState().counter.get('countingAreas').size === 0) {
      dispatch(setMode(EDITOR_MODE.EDIT));
    }
    dispatch(registerCountingAreasOnServer());
  }
}

export function addCountingArea() {
  return (dispatch, getState) => {

    // TODO Before adding a counting area, verify if selectedCountingArea is complete, otherwise delete it

    let newCountingAreaId = uuidv4();

    const AVAILABLE_COLORS = getAvailableCounterColors();
    const DEFAULT_COLOR = getDefaultCounterColor();

    // Get a color unused
    let color = AVAILABLE_COLORS.find((potentialColor) => {
      return getState().counter.get('countingAreas').findEntry((value) => value.get('color') === potentialColor) === undefined
    })

    if(!color) {
      color = DEFAULT_COLOR;
    }

    dispatch({
      type: ADD_COUNTING_AREA,
      payload: {
        id: newCountingAreaId,
        color: color,
        type: "bidirectional"
      }
    })

    dispatch(selectCountingArea(newCountingAreaId));
  }
}

export function saveCountingAreaLocation(id, location) {
  return (dispatch, getState) => {

    // Compute bearing
    let lineBearing = computeLineBearing(location.point1.x, -location.point1.y, location.point2.x, -location.point2.y);
    // in both directions
    let lineBearings = [0,0];
    if(lineBearing >= 180) {
      lineBearings[0] = lineBearing - 180;
      lineBearings[1] = lineBearing;
    } else {
      lineBearings[0] = lineBearing;
      lineBearings[1] = lineBearing + 180;
    }


    dispatch({
      type: SAVE_COUNTING_AREA_LOCATION,
      payload: {
        location,
        id,
        lineBearings
      }
    });

    if(!getState().counter.getIn(['countingAreas', id, 'name'])) {
      dispatch(setMode(EDITOR_MODE.ASKNAME));
    }
    dispatch(registerCountingAreasOnServer());
  }
}

export function toggleCountingAreaType(id, currentDirection) {
  return (dispatch, getState) => {

    let newDirection = COUNTING_AREA_TYPE.BIDIRECTIONAL;

    if(currentDirection === COUNTING_AREA_TYPE.BIDIRECTIONAL) {
      newDirection = COUNTING_AREA_TYPE.LEFTRIGHT_TOPBOTTOM;
    } else if(currentDirection === COUNTING_AREA_TYPE.LEFTRIGHT_TOPBOTTOM) {
      newDirection = COUNTING_AREA_TYPE.RIGHTLEFT_BOTTOMTOP;
    }

    dispatch({
      type: SAVE_COUNTING_AREA_TYPE,
      payload: {
        type: newDirection,
        id
      }
    });

    dispatch(registerCountingAreasOnServer());
  }
}

export function saveCountingAreaName(id, name) {
  return (dispatch, getState) => {
    // console.log('saveName')
    dispatch({
      type: SAVE_COUNTING_AREA_NAME,
      payload: {
        id,
        name
      }
    })

    dispatch(registerCountingAreasOnServer());
    dispatch(setMode(EDITOR_MODE.EDIT));
  }
}

export function restoreCountingAreasFromJSON(data) {
  return (dispatch) => {
    dispatch({
      type: RESTORE_COUNTING_AREAS,
      payload: data
    })
    dispatch(registerCountingAreasOnServer());
  }
}

export function restoreCountingAreas(req) {
  return (dispatch) => {
    return new Promise((resolve, reject) => {
      if(req) {
        let urlData = getURLData(req);
        let session = req && req.session ? req.session : null
        let url = `${urlData.protocol}://${urlData.address}:${urlData.port}/counter/areas`;

        axios({
          method: 'get',
          url: url,
          credentials: 'same-origin',
          data: {'session': session}
        }).then((response) => {
          dispatch({
            type: RESTORE_COUNTING_AREAS,
            payload: response.data
          })
          resolve();
        }, (error) => {
          console.log(error);
          reject();
        }).catch((error) => {
          console.log(error)
          reject();
        });
      } else {
        axios({
          method: 'get',
          url: '/counter/areas',
        }).then((response) => {
          dispatch({
            type: RESTORE_COUNTING_AREAS,
            payload: response.data
          })
          resolve();
        }, (error) => {
          console.log(error);
          reject();
        }).catch((error) => {
          console.log(error)
          reject();
        });
      }
    });
  }
}

// TODO LATER , introduce Redux saga here to make it more explicit that this is triggered by
// => SAVE_COUNTING_AREA_LOCATION
// => SAVE_COUNTING_AREA_NAME
// => DELETE_COUNTING_AREA
// => SAVE_COUNTING_AREA_TYPE
export function registerCountingAreasOnServer() {
  return (dispatch, getState) => {
    // Ping webservice to start storing data on server
    axios.post('/counter/areas',{
      countingAreas: getState().counter.get('countingAreas').toJS()
    });
  }
}

export function computeCountingAreasCenters(countingAreas, canvasResolution) {
  return countingAreas.map((data, id) => {
    let location = data.get('location');
    if(location) {
      return data.setIn(['location','center'], scalePoint(
        {
          x: Math.abs(location.getIn(['point2','x']) - location.getIn(['point1','x'])) / 2 + Math.min(location.getIn(['point1','x']), location.getIn(['point2','x'])),
          y: Math.abs(location.getIn(['point2','y']) - location.getIn(['point1','y'])) / 2 + Math.min(location.getIn(['point1','y']), location.getIn(['point2','y']))
        }, 
        canvasResolution.toJS(), 
        location.get('refResolution').toJS()
      ))
    } else {
      return data;
    }
  })
}

export function computeDistance(point1, point2) {
  return Math.sqrt(Math.pow(point2.x - point1.x, 2) + Math.pow(point2.y - point1.y, 2))
}

// Reducer
export default function CounterReducer (state = initialState, action = {}) {
  switch (action.type) {
    case SELECT_COUNTING_AREA:
      return state.set('selectedCountingArea', action.payload)
    case DELETE_COUNTING_AREA:
      return state.deleteIn(['countingAreas', action.payload])
    case SAVE_COUNTING_AREA_LOCATION:
      return state.setIn(['countingAreas', action.payload.id, 'location'], fromJS(action.payload.location))
                  .setIn(['countingAreas', action.payload.id, 'computed', 'lineBearings'], fromJS(action.payload.lineBearings))
    case SAVE_COUNTING_AREA_NAME:
      return state.setIn(['countingAreas', action.payload.id, 'name'], action.payload.name)
    case SAVE_COUNTING_AREA_TYPE:
      return state.setIn(['countingAreas', action.payload.id, 'type'], action.payload.type)
    case ADD_COUNTING_AREA:
      return state.setIn(['countingAreas', action.payload.id], fromJS({
        color: action.payload.color,
        type: action.payload.type
      }))
    case RESET_COUNTING_AREAS:
      return state.set('countingAreas', fromJS({}))
    case SET_MODE:
      return state.set('mode', action.payload)
    case RESTORE_COUNTING_AREAS:
      return state.set('countingAreas', fromJS(action.payload))
    case UPDATE_COUNTERSUMMARY:
      return state.setIn(['counterSummary'], fromJS(action.payload));
    case UPDATE_TRACKERSUMMARY:
      return state.setIn(['trackerSummary'], fromJS(action.payload));
    default:
      return state
  }
}
