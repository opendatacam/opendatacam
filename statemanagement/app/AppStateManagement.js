import { fromJS } from 'immutable'
import axios from 'axios';
import { MODE } from '../../utils/constants';



// Initial state
const initialState = fromJS({
  urlData: {},
  isRecording: false,
  mode: MODE.LIVEVIEW
})

// Actions
const START_RECORDING = 'App/START_RECORDING'
const STOP_RECORDING = 'App/STOP_RECORDING'
const SET_URLDATA = 'App/SET_URLDATA'
const SET_MODE = 'App/SET_MODE'

export function startRecording () {
  return (dispatch, getState) => {
    // Ping webservice to start storing data on server
    axios.post('/recording/start',{
      countingAreas: getState().counter.get('countingAreas').toJS()
    });

    // Notify UI we started recording
    dispatch({
      type: START_RECORDING
    })
  }
}

export function stopCounting() {
  return (dispatch, getState) => {
    // Ping webservice to stop storing data on server
    axios.get('/recording/stop');

    // Notify UI we stop recording
    dispatch({
      type: STOP_RECORDING
    })
  }
}

export function setMode(mode) {
  return {
    type: SET_MODE,
    payload: mode
  }
}

function getURLData(req) {
  let protocol = 'http';
  if(req.headers['x-forwarded-proto'] === 'https') {
    protocol = 'https';
  }

  const parsedUrl = req.get('Host').split(':');
  if(parsedUrl.length > 1) {
    return {
      address: parsedUrl[0],
      port: parsedUrl[1],
      protocol
    }
  } else {
    return {
      address: parsedUrl[0],
      port: 80,
      protocol
    }
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
    case START_RECORDING:
      return state.set('isRecording', true)
    case STOP_RECORDING:
      return state.set('isRecording', false)
    case SET_URLDATA:
      return state.set('urlData', fromJS(action.payload))
    case SET_MODE:
      return state.set('mode', action.payload)
    default:
      return state
  }
}
