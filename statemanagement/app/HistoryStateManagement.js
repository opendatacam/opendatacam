import { fromJS } from 'immutable'
import axios from 'axios';

// Initial state
const initialState = fromJS({
  recordingHistory: [],
  isFetchingHistory: false,
  fetchHistoryError: null
})

// Actions
const FETCH_HISTORY_SUCCESS = 'History/FETCH_HISTORY_SUCCESS'
const FETCH_HISTORY_START = 'History/FETCH_HISTORY_START'
const FETCH_HISTORY_ERROR = 'History/FETCH_HISTORY_ERROR'

export function fetchHistory() {
  return (dispatch, getState) => {
    dispatch({
      type: FETCH_HISTORY_START
    });

    axios.get('/recordings').then((response) => {
      dispatch(fetchHistorySuccess(response.data));
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
    default:
      return state
  }
}
