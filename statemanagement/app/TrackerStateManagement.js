import { fromJS } from 'immutable'
import axios from 'axios';

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
        dispatch({
            type: UPDATE_DATA,
            payload: JSON.parse(msg.data)
        })
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
