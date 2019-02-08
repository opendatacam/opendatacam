import { fromJS } from 'immutable'
import axios from 'axios';
import { MODE } from '../../utils/constants';
import { getURLData } from '../../server/utils/urlHelper';

// Initial state
const initialState = fromJS({
  urlData: {},
  recordingStatus: {
    isRecording: false
  },
  yoloStatus: {
    isStarted: false,
    isStarting: true
  },
  mode: MODE.LIVEVIEW
})

// Actions
const SET_URLDATA = 'App/SET_URLDATA'
const SET_MODE = 'App/SET_MODE'
const UPDATE_APPSTATE = 'App/UPDATE_APPSTATE'

export function startRecording() {
  return (dispatch, getState) => {
    // Ping webservice to start storing data on server
    axios.get('/recording/start');
  }
}

export function stopRecording() {
  return (dispatch, getState) => {
    // Ping webservice to stop storing data on server
    axios.get('/recording/stop');
  }
}

export function updateAppState(data) {
  return {
    type: UPDATE_APPSTATE,
    payload: data
  }
}

export function setMode(mode) {
  return {
    type: SET_MODE,
    payload: mode
  }
}

export function setURLData(req) {
  return {
    type: SET_URLDATA,
    payload: getURLData(req)
  }
}

// Reducer
export default function AppReducer (state = initialState, action = {}) {
  switch (action.type) {
    case SET_URLDATA:
      return state.set('urlData', fromJS(action.payload))
    case SET_MODE:
      return state.set('mode', action.payload)
    case UPDATE_APPSTATE: 
      return state.set('yoloStatus', action.payload.yoloStatus)
                  .set('recordingStatus', action.payload.recordingStatus)
    default:
      return state
  }
}
