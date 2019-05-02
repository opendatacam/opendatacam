import { fromJS } from 'immutable'
import axios from 'axios';

const DEFAULT_LIMIT = 20;
const DEFAULT_OFFSET = 0;

// Initial state
const initialState = fromJS({
  recordingHistory: [],
  isFetchingHistory: false,
  fetchHistoryError: null,
  recordingsCursor: {
    limit: DEFAULT_LIMIT, 
    offset: DEFAULT_OFFSET,
    total: 0
  }
})

// Actions
const FETCH_HISTORY_SUCCESS = 'History/FETCH_HISTORY_SUCCESS'
const FETCH_HISTORY_START = 'History/FETCH_HISTORY_START'
const FETCH_HISTORY_ERROR = 'History/FETCH_HISTORY_ERROR'
const UPDATE_RECORDINGS_CURSOR = 'History/UPDATE_RECORDINGS_CURSOR'
const DELETE_RECORDING = 'History/DELETE_RECORDING'

export function fetchHistory(offset = DEFAULT_OFFSET, limit = DEFAULT_LIMIT) {
  return (dispatch, getState) => {
    dispatch({
      type: FETCH_HISTORY_START
    });

    axios.get(`/recordings?offset=${offset}&limit=${limit}`).then((response) => {
      dispatch(fetchHistorySuccess(response.data.recordings));
      dispatch(updateRecordingsCursor({
        total: response.data.total,
        offset: response.data.offset,
        limit: response.data.limit
      }));
    }, () => {
      dispatch(fetchHistoryError());
    });
  }
}

export function fetchHistorySuccess(data) {
  return {
    type: FETCH_HISTORY_SUCCESS,
    payload: data
  }
}

export function fetchHistoryError() {
  return {
    type: FETCH_HISTORY_ERROR
  }
}

export function updateRecordingsCursor(data) {
  return {
    type: UPDATE_RECORDINGS_CURSOR,
    payload: data
  }
}

export function deleteRecording(recordingId) {
  return (dispatch, getState) => {
    dispatch({
      type: DELETE_RECORDING,
      payload: recordingId
    })
    axios.delete(`/recording/${recordingId}`)
  }
}

// Reducer
export default function HistoryReducer (state = initialState, action = {}) {
  switch (action.type) {
    case FETCH_HISTORY_START:
      return state.set("isFetchingHistory", true)
                  .set("fetchHistoryError", false)
    case FETCH_HISTORY_SUCCESS:
      return state.set("recordingHistory", fromJS(action.payload))
                  .set("isFetchingHistory", false)
                  .set("fetchHistoryError", false)
    case FETCH_HISTORY_ERROR:
      return state.set("isFetchingHistory", false)
                  .set("fetchHistoryError", false)
    case UPDATE_RECORDINGS_CURSOR:
      return state.set('recordingsCursor', fromJS(action.payload))
    case DELETE_RECORDING:
      return state.updateIn(['recordingHistory'], recordingHistory => recordingHistory.delete(
              recordingHistory.findIndex((value) => value.get('_id') === action.payload)
            ))
    default:
      return state
  }
}
