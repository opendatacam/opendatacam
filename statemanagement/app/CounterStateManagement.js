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
  EDIT_LINE: 'edit_line',
  EDIT_POLYGON: 'edit_polygon',
  ASKNAME: 'askname',
  DELETE: 'delete',
  SHOW_INSTRUCTION: 'showinstruction'
}

// Initial state
const initialState = fromJS({
  countingAreas: {},
  selectedCountingArea: null,
  mode: EDITOR_MODE.EDIT_LINE, // oneOf EDITOR_MODE
  lastEditingMode: EDITOR_MODE.EDIT_LINE,
  counterSummary: {},
  trackerSummary: {} 
})

// Actions
const SELECT_COUNTING_AREA = 'Counter/SELECT_COUNTING_AREA'
const DELETE_COUNTING_AREA = 'Counter/DELETE_COUNTING_AREA'
const SAVE_COUNTING_AREA_LOCATION = 'Counter/SAVE_COUNTING_AREA_LOCATION'
const SAVE_COUNTING_AREA_BEARING = 'Counter/SAVE_COUNTING_AREA_BEARING'
const SAVE_COUNTING_AREA_TYPE = 'Counter/SAVE_COUNTING_AREA_TYPE'
const SET_MODE = 'Counter/SET_MODE'
const SET_LAST_EDITING_MODE = 'Counter/SET_LAST_EDITING_MODE'
const SAVE_COUNTING_AREA_NAME = 'Counter/SAVE_COUNTING_AREA_NAME'
const ADD_COUNTING_AREA = 'Counter/ADD_COUNTING_AREA'
const RESTORE_COUNTING_AREAS = 'Counter/RESTORE_COUNTING_AREAS'
const RESET_COUNTING_AREAS = 'Counter/RESET_COUNTING_AREAS'
const UPDATE_COUNTERSUMMARY = 'Counter/UPDATE_COUNTERSUMMARY'
const UPDATE_TRACKERSUMMARY = 'Counter/UPDATE_TRACKERSUMMARY'


export function setMode(mode) {
  return (dispatch, getState) => {
    // If leaving editing mode, store last editing mode for when we go back
    if(getState().counter.get('mode') === EDITOR_MODE.EDIT_LINE || getState().counter.get('mode') === EDITOR_MODE.EDIT_POLYGON) {

      // If new mode is also editing, store new mode
      if(mode === EDITOR_MODE.EDIT_LINE || mode === EDITOR_MODE.EDIT_POLYGON) {
        dispatch({
          type: SET_LAST_EDITING_MODE,
          payload: mode
        });
      } else {
        dispatch({
          type: SET_LAST_EDITING_MODE,
          payload: getState().counter.get('mode')
        });
      }
    }

    dispatch({
      type: SET_MODE,
      payload: mode
    });
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
      dispatch(setMode(getState().counter.get('lastEditingMode')));
    }
    dispatch(registerCountingAreasOnServer());
  }
}

export function addCountingArea(type = "bidirectional") {
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
        type: type
      }
    })

    dispatch(selectCountingArea(newCountingAreaId));
  }
}

export function saveCountingAreaLocation(id, location) {
  return (dispatch, getState) => {

    //Compute bearing of the line (if polygon of the first line)
    let lineBearing = computeLineBearing(location.points[0].x, -location.points[0].y, location.points[1].x, -location.points[1].y);
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
      type: SAVE_COUNTING_AREA_BEARING,
      payload: {
        lineBearings,
        id
      }
    })

    dispatch({
      type: SAVE_COUNTING_AREA_LOCATION,
      payload: {
        location,
        id
      }
    });

    if(!getState().counter.getIn(['countingAreas', id, 'name'])) {
      dispatch(setMode(EDITOR_MODE.ASKNAME));
    }
    // TODO UPDATE server side part to handle array of points instead of just point1, point2
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
      let points = location.get('points').toJS();
      let x1 = points[0].x
      let y1 = points[0].y
      let x2 = points[1].x
      let y2 = points[1].y

      return data.setIn(['location','center'], scalePoint(
        {
          x: Math.abs(x2 - x1) / 2 + Math.min(x1, x2),
          y: Math.abs(y2 - y1) / 2 + Math.min(y1, y2)
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
    case SAVE_COUNTING_AREA_BEARING:
      return state.setIn(['countingAreas', action.payload.id, 'computed', 'lineBearings'], fromJS(action.payload.lineBearings))
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
    case SET_LAST_EDITING_MODE:
      return state.set('lastEditingMode', action.payload)
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
