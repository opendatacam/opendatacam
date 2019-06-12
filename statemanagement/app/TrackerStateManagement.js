import { fromJS } from 'immutable'

// Initial state
const initialState = fromJS({
  trackerData: {
    frameIndex: 0,
    data: []
  }
})

// Actions
const UPDATE_DATA = 'Tracker/UPDATE_DATA'

export function getTrackerAccuracyNbFrameBuffer() {
  return window.CONFIG.TRACKER_ACCURACY_DISPLAY.nbFrameBuffer;
}

export function getTrackerAccuracySettings() {
  return window.CONFIG.TRACKER_ACCURACY_DISPLAY.settings;
}

export function updateTrackerData(trackerDataLastFrame) {
  return (dispatch, getState) => {

    // Update tracker raw data
    dispatch({
      type: UPDATE_DATA,
      payload: trackerDataLastFrame
    })
  }
}

// Reducer
export default function TrackerReducer (state = initialState, action = {}) {
  switch (action.type) {
    case UPDATE_DATA:
      return state.set("trackerData", fromJS(action.payload));
    default:
      return state
  }
}
