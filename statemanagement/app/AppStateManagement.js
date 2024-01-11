import { createSlice } from '@reduxjs/toolkit';
import axios from 'axios';
import { MODE } from '../../utils/constants';
import { updateTrackerData } from './TrackerStateManagement';
import {
  updateCounterSummary, updateTrackerSummary, resetCountingAreas,
} from './CounterStateManagement';
import { fetchHistory } from './HistoryStateManagement';
import { setOriginalResolution } from './ViewportStateManagement';

// Initial state
const initialState = {
  urlData: {},
  recordingStatus: {
    requestedFileRecording: false,
    isRecording: false,
    currentFPS: 0,
    recordingId: null,
    dateStarted: null,
    filename: '',
  },
  yoloStatus: {
    isStarted: false,
    isStarting: true,
  },
  uiSettings: {
    counterEnabled: true,
    pathfinderEnabled: true,
    heatmapEnabled: false,
  },
  isListeningToYOLO: false,
  mode: MODE.LIVEVIEW,
  showMenu: false,
  isListeningToServerData: false,
  config: {},
};

export function stopRecording() {
  return (dispatch) => {
    // Ping webservice to stop storing data on server
    axios.get('/recording/stop');
    dispatch(fetchHistory());
  };
}

const appSlice = createSlice({
  name: 'app',
  initialState,
  reducers: {
    // Give case reducers meaningful past-tense "event"-style names
    listeningToServerData(state) {
      state.isListeningToServerData = true;
    },
    updateAppState(state, action) {
      state.yoloStatus = action.payload.yoloStatus;
      state.isListeningToYOLO = action.payload.isListeningToYOLO;
      state.recordingStatus = action.payload.recordingStatus;
    },
    setURLData(state, action) {
      state.urlData = action.payload;
    },
    showMenu(state) {
      state.showMenu = true;
    },
    hideMenu(state) {
      state.showMenu = false;
    },
    setMode(state, action) {
      state.mode = action.payload;
    },
    configLoaded(state, action) {
      state.config = action.payload;
      window.CONFIG = action.payload;
    },
    uiSettingsRestored(state, action) {
      state.uiSettings = action.payload;
    },
    uiSettingChanged(state, action) {
      state.uiSettings[action.payload.setting] = action.payload.value;
    },
  },
})

// `createSlice` automatically generated action creators with these names.
// export them as named exports from this "slice" file
export const {
  listeningToServerData,
  updateAppState,
  setURLData,
  showMenu,
  hideMenu,
  setMode,
  configLoaded,
  uiSettingsRestored,
  uiSettingChanged,
} = appSlice.actions;

// Export the slice reducer as the default export
export default appSlice.reducer;

export function startListeningToServerData() {
  return (dispatch, getState) => {
    const eventSource = new EventSource('/tracker/sse');
    dispatch(listeningToServerData());

    // On new tracker data coming from server, update redux store
    eventSource.onmessage = (msg) => {
      // Parse JSON
      const message = JSON.parse(msg.data);
      if (message.videoResolution) {
        const isWUpdate = getState().viewport.originalResolution.w !== message.videoResolution.w;
        const isHUpdate = getState().viewport.originalResolution.h !== message.videoResolution.h;
        if (isWUpdate || isHUpdate) {
          dispatch(setOriginalResolution(message.videoResolution));
        }
      }

      dispatch(updateAppState(message.appState));
      dispatch(updateTrackerData(message.trackerDataForLastFrame));
      dispatch(updateCounterSummary(message.counterSummary));
      dispatch(updateTrackerSummary(message.trackerSummary));
    };
  };
}

export function startRecording() {
  return (dispatch, getState) => {
    // Ping webservice to start storing data on server
    axios.get('/recording/start');

    dispatch(fetchHistory());

    // If not counting areas defined, go to live view and remove counter button
    const isAtLeastOneCountingAreasDefined = getState().counter.countingAreas.size > 0;
    if (!isAtLeastOneCountingAreasDefined && getState().app.mode === MODE.COUNTERVIEW) {
      // Go to Liveview
      dispatch(setMode(MODE.LIVEVIEW));
    }
  };
}

export function loadConfig() {
  return (dispatch) => new Promise((resolve, reject) => {
    axios({
      method: 'get',
      url: '/config',
      credentials: 'same-origin',
    }).then((response) => {
      dispatch(configLoaded(response.data));
      resolve();
    }, (error) => {
      reject(error);
    }).catch((error) => {
      reject(error);
    });
  });
}

export function restoreUiSettings() {
  return (dispatch) => new Promise((resolve, reject) => {
    axios({
      method: 'get',
      url: '/ui',
      credentials: 'same-origin',
    }).then((response) => {
      dispatch(uiSettingsRestored(response.data));
      resolve();
    }, (error) => {
      reject(error);
    }).catch((error) => {
      reject(error);
    });
  });
}

export function setUiSetting(uiSetting, value) {
  return (dispatch, getState) => {
    // Side effects
    const currentMode = getState().app.mode;

    // If on pathview and disable pathfinder, go to liveview
    if (uiSetting === 'pathfinderEnabled'
       && value === false
       && currentMode === MODE.PATHVIEW) {
      dispatch(setMode(MODE.LIVEVIEW));
    }

    // If disabling counter while on counterview
    if (uiSetting === 'counterEnabled'
       && value === false
       && currentMode === MODE.COUNTERVIEW) {
      // Go to Liveview
      dispatch(setMode(MODE.LIVEVIEW));

      // If recording, stop recording
      if (getState().app.recordingStatus.isRecording === true) {
        dispatch(stopRecording());
      }

      // Reset any counter areas defined
      dispatch(resetCountingAreas());
    }

    dispatch(uiSettingChanged({ setting: uiSetting, value }));

    // Persist ui settings on server
    axios.post('/ui', getState().app.uiSettings);
  };
}
