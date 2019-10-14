import { fromJS } from 'immutable'
import axios from 'axios';
import { MODE } from '../../utils/constants';
import { getURLData } from '../../server/utils/urlHelper';
import { updateTrackerData } from './TrackerStateManagement';
import { updateCounterSummary, updateTrackerSummary, resetCountingAreas, restoreCountingAreas } from './CounterStateManagement';
import { fetchHistory } from './HistoryStateManagement';
import { setOriginalResolution } from './ViewportStateManagement';

// Initial state
const initialState = fromJS({
  urlData: {},
  recordingStatus: {
    requestedFileRecording: false,
    isRecording: false,
    currentFPS: 0,
    recordingId: null,
    dateStarted: null,
    filename: ''
  },
  yoloStatus: {
    isStarted: false,
    isStarting: true
  },
  uiSettings: {
    counterEnabled: true,
    pathfinderEnabled: true,
    heatmapEnabled: false
  },
  isListeningToYOLO: false,
  mode: MODE.LIVEVIEW,
  showMenu: false,
  isListeningToServerData: false,
  eventSourceServerData: null,
  config: {}
})

// Actions
const SET_URLDATA = 'App/SET_URLDATA'
const SET_MODE = 'App/SET_MODE'
const SHOW_MENU = 'App/SHOW_MENU'
const HIDE_MENU = 'App/HIDE_MENU'
const UPDATE_APPSTATE = 'App/UPDATE_APPSTATE'
const SET_UI_SETTING = 'App/SET_UI_SETTING'
const RESTORE_UI_SETTINGS = 'App/RESTORE_UI_SETTINGS'
const START_LISTENING_SERVERDATA = 'App/START_LISTENING_SERVERDATA'
// TODO LATER HANDLE STOP LISTENING ...
const STOP_LISTENING_SERVERDATA = 'App/STOP_LISTENING_SERVERDATA'
const LOAD_CONFIG = 'App/LOAD_CONFIG'

export function startRecording() {
  return (dispatch, getState) => {
    // Ping webservice to start storing data on server
    axios.get('/recording/start');
    
    dispatch(fetchHistory());

    // If not counting areas defined, go to live view and remove counter button
    const isAtLeastOneCountingAreasDefined = getState().counter.get('countingAreas').size > 0;
    if(!isAtLeastOneCountingAreasDefined && getState().app.get('mode') === MODE.COUNTERVIEW) {
      // Go to Liveview
      dispatch(setMode(MODE.LIVEVIEW));
    }
  }
}

export function stopRecording() {
  return (dispatch) => {
    // Ping webservice to stop storing data on server
    axios.get('/recording/stop');
    dispatch(fetchHistory());
  }
}

export function loadConfig(req) {
  return (dispatch) => {
    return new Promise((resolve, reject) => {
      let urlData = getURLData(req);
      let session = req && req.session ? req.session : null
      let url = `${urlData.protocol}://${urlData.address}:${urlData.port}/config`;

      axios({
        method: 'get',
        url: url,
        credentials: 'same-origin',
        data: {'session': session}
      }).then((response) => {
        dispatch({
          type: LOAD_CONFIG,
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
    });
  }
}

export function restoreUiSettings(req) {
  return (dispatch) => {
    return new Promise((resolve, reject) => {
      let urlData = getURLData(req);
      let session = req && req.session ? req.session : null
      let url = `${urlData.protocol}://${urlData.address}:${urlData.port}/ui`;

      axios({
        method: 'get',
        url: url,
        credentials: 'same-origin',
        data: {'session': session}
      }).then((response) => {
        dispatch({
          type: RESTORE_UI_SETTINGS,
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
    });
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

export function setUiSetting(uiSetting, value) {
  return (dispatch, getState) => {

    // Side effects
    const currentMode = getState().app.get('mode');

    // If on pathview and disable pathfinder, go to liveview
    if(uiSetting === "pathfinderEnabled" && 
       value === false &&
       currentMode === MODE.PATHVIEW) {
      dispatch(setMode(MODE.LIVEVIEW));
    }

    // If disabling counter while on counterview
    if(uiSetting === "counterEnabled" && 
       value === false &&
       currentMode === MODE.COUNTERVIEW) {

      // Go to Liveview
      dispatch(setMode(MODE.LIVEVIEW));

      // If recording, stop recording
      if(getState().app.getIn(["recordingStatus", "isRecording"]) === true) {
        dispatch(stopRecording());
      }

      // Reset any counter areas defined
      dispatch(resetCountingAreas())
    }
    
    dispatch({
      type: SET_UI_SETTING,
      payload: {
        uiSetting,
        value
      }
    })

    // Persist ui settings on server
    axios.post('/ui', getState().app.get('uiSettings').toJS());
  
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
    case SET_UI_SETTING:
        return state.setIn(['uiSettings', action.payload.uiSetting], fromJS(action.payload.value))
    case RESTORE_UI_SETTINGS:
      return state.set('uiSettings', fromJS(action.payload))
    case LOAD_CONFIG:
      return state.set('config', fromJS(action.payload))
    case UPDATE_APPSTATE: 
      return state.set('yoloStatus', fromJS(action.payload.yoloStatus))
                  .set('isListeningToYOLO', action.payload.isListeningToYOLO)
                  .set('recordingStatus', fromJS(action.payload.recordingStatus))
    default:
      return state
  }
}
