import { fromJS } from 'immutable'
import { updateAppState } from './AppStateManagement';

// Initial state
const initialState = fromJS({
    trackerData: {
        frameIndex: 0,
        data: []
    },
    isListening: false,
    eventSource: null
})

// Actions
const START_LISTENING = 'Tracker/START_LISTENING'
const UPDATE_DATA = 'Tracker/UPDATE_DATA'

// TODO LATER HANDLE STOP LISTENING ...
const STOP_LISTENING = 'Tracker/STOP_LISTENING'

// Make more sence to move this global listener to AppStateManagement and just update Tracker data here
// Because there is not only tracker data, there is app state, and also recordingData soon
export function startListeningToTrackerData() {
  return (dispatch, getState) => {
    const eventSource = new EventSource("/tracker/sse");
    dispatch({
        type: START_LISTENING,
        payload: eventSource
    })

    // On new tracker data coming from server, update redux store
    eventSource.onmessage = (msg) => {
        // Parse JSON
        let message = JSON.parse(msg.data);

        dispatch({
            type: UPDATE_DATA,
            payload: message.trackerDataForLastFrame
        })

        dispatch(updateAppState(message.appState))
    }
  }
}

// Reducer
export default function TrackerReducer (state = initialState, action = {}) {
  switch (action.type) {
    case START_LISTENING:
        return state.set("isListening", true).set("eventSource", action.payload);
    case UPDATE_DATA:
        return state.set("trackerData", fromJS(action.payload));
    default:
      return state
  }
}
