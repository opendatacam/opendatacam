import { fromJS } from 'immutable'
import axios from 'axios';
import { MODE } from '../../utils/constants';
import { getURLData } from '../../server/utils/urlHelper';
import { updateTrackerData } from './TrackerStateManagement';
import { updateCounterSummary, updateTrackerSummary } from './CounterStateManagement';
import { fetchHistory } from './HistoryStateManagement';
import { setOriginalResolution } from './ViewportStateManagement';

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
  showMenu: false,
  userSettings: {
    dimmerOpacity: 0.1,
    darkMode: false,
    counter: true,
    pathfinder: true
  },
  isListeningToServerData: false,
  eventSourceServerData: null
})

// Actions
const SET_URLDATA = 'App/SET_URLDATA'
const SET_MODE = 'App/SET_MODE'
const SHOW_MENU = 'App/SHOW_MENU'
const HIDE_MENU = 'App/HIDE_MENU'
const UPDATE_APPSTATE = 'App/UPDATE_APPSTATE'
const SET_USERSETTING = 'App/SET_USERSETTING'
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

export function showMenu() {
  return {
    type: SHOW_MENU
  }
}

export function hideMenu() {
  return {
    type: HIDE_MENU
  }
}

export function setUserSetting(setting, value) {
  return {
    type: SET_USERSETTING,
    payload: {
      setting,
      value
    }
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
      if(message.videoResolution) {
        dispatch(setOriginalResolution(message.videoResolution))
      }
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
    case SHOW_MENU:
      return state.set('showMenu', true)
    case HIDE_MENU:
      return state.set('showMenu', false)
    case SET_USERSETTING:
      return state.setIn(['userSettings', action.payload.setting], fromJS(action.payload.value))
    case UPDATE_APPSTATE: 
      return state.set('yoloStatus', fromJS(action.payload.yoloStatus))
                  .set('isListeningToYOLO', action.payload.isListeningToYOLO)
                  .set('recordingStatus', fromJS(action.payload.recordingStatus))
    default:
      return state
  }
}
