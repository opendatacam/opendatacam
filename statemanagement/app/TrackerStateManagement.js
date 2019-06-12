import { fromJS } from 'immutable'

// Initial state
const initialState = fromJS({
  trackerData: {
    frameIndex: 0,
    data: []
  },
  trackerAccuracyBuffer: []
})

// Actions
const UPDATE_DATA = 'Tracker/UPDATE_DATA'
const UPDATE_ACCURACY_BUFFER = 'Tracker/UPDATE_ACCURACY_BUFFER'

export function getAccuracyNbFrameBuffer() {
  return window.CONFIG.TRACKER_ACCURACY_DISPLAY.nbFrameBuffer;
}

export function updateTrackerData(trackerDataLastFrame) {
  return (dispatch, getState) => {

    // Update tracker raw data
    dispatch({
      type: UPDATE_DATA,
      payload: trackerDataLastFrame
    })

    // Update accuracy buffer
    // Get only "zombies" from tracker data 
    dispatch({
      type: UPDATE_ACCURACY_BUFFER,
      payload: trackerDataLastFrame.data.filter((trackedItem) => trackedItem.isZombie === true)
    })
  }
}

// Reducer
export default function TrackerReducer (state = initialState, action = {}) {
  switch (action.type) {
    case UPDATE_DATA:
      return state.set("trackerData", fromJS(action.payload));
    case UPDATE_ACCURACY_BUFFER:
      // If buffer is full
      if(state.get('trackerAccuracyBuffer').size > getAccuracyNbFrameBuffer()) {
        // remove first frame before pushing new one
        return state.update('trackerAccuracyBuffer', list => list.shift().push(fromJS(action.payload)))
      } else {
        return state.update('trackerAccuracyBuffer', list => list.push(fromJS(action.payload)))
      }
    default:
      return state
  }
}
