import { fromJS } from 'immutable'
import axios from 'axios';
import { MODE } from '../../utils/constants';
import { getURLData } from '../../server/utils/urlHelper';
import { updateTrackerData } from './TrackerStateManagement';
import { updateCounterSummary, updateTrackerSummary } from './CounterStateManagement';
import { fetchHistory } from './HistoryStateManagement';

// Initial state
const initialState = fromJS({
  urlData: {},
  recordingStatus: {
    isRecording: false,
    currentFPS: 0
  },
  yoloStatus: {
    isStarted: false,
    isStarting: true
  },
  isListeningToYOLO: false,
  mode: MODE.LIVEVIEW,
  isListeningToServerData: false,
  eventSourceServerData: null
})

// Actions
const SET_URLDATA = 'App/SET_URLDATA'
const SET_MODE = 'App/SET_MODE'
const UPDATE_APPSTATE = 'App/UPDATE_APPSTATE'
const START_LISTENING_SERVERDATA = 'App/START_LISTENING_SERVERDATA'
// TODO LATER HANDLE STOP LISTENING ...
const STOP_LISTENING_SERVERDATA = 'App/STOP_LISTENING_SERVERDATA'

export function startRecording() {
  return (dispatch) => {
    // Ping webservice to start storing data on server
    axios.get('/recording/start');
    dispatch(fetchHistory());
  }
}

export function stopRecording() {
  return (dispatch) => {
    // Ping webservice to stop storing data on server
    axios.get('/recording/stop');
    dispatch(fetchHistory());
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

export function startListeningToServerData() {
  return (dispatch, getState) => {
    const eventSource = new EventSource("/tracker/sse");
    dispatch({
        type: START_LISTENING_SERVERDATA,
        payload: eventSource
    })

    // On new tracker data coming from server, update redux store
    eventSource.onmessage = (msg) => {
        // Parse JSON
        let message = JSON.parse(msg.data);
        dispatch(updateTrackerData(message.trackerDataForLastFrame))
        dispatch(updateAppState(message.appState))
        dispatch(updateCounterSummary(message.counterSummary))
        dispatch(updateTrackerSummary(message.trackerSummary))
    }
  }
}

// Reducer
export default function AppReducer (state = initialState, action = {}) {
  switch (action.type) {
    case START_LISTENING_SERVERDATA:
        return state.set("isListeningToServerData", true).set("eventSourceServerData", action.payload);
    case SET_URLDATA:
      return state.set('urlData', fromJS(action.payload))
    case SET_MODE:
      return state.set('mode', action.payload)
    case UPDATE_APPSTATE: 
      return state.set('yoloStatus', fromJS(action.payload.yoloStatus))
                  .set('isListeningToYOLO', action.payload.isListeningToYOLO)
                  .set('recordingStatus', fromJS(action.payload.recordingStatus))
    default:
      return state
  }
}
