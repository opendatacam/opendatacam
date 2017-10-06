import { fromJS } from 'immutable';
import axios from 'axios';

// Initial state
const initialState = fromJS({
  data: {},
  isFetching: false,
  fetched: false,
  error: null
});

// Actions
const FETCH_OBJECTTRACKER_START = 'ObjectTracker/FETCH_OBJECTTRACKER_START';
const FETCH_OBJECTTRACKER_ERROR = 'ObjectTracker/FETCH_OBJECTTRACKER_ERROR';
const FETCH_OBJECTTRACKER_SUCCESS = 'ObjectTracker/FETCH_OBJECTTRACKER_SUCCESS';

export function startFetchingObjectTracker() {
  return {
    type: FETCH_OBJECTTRACKER_START
  };
}

export function fetchObjectTrackerSuccess(detections) {
  return {
    type: FETCH_OBJECTTRACKER_SUCCESS,
    payload: detections
  };
}

export function fetchObjectTrackerError(error) {
  return {
    type: FETCH_OBJECTTRACKER_ERROR,
    payload: new Error(),
    error: true
  };
}

export function fetchObjectTracker(src) {
  return (dispatch, getState) => {
    return new Promise((resolve, reject) => {
      // Notify UI we are fetching stuff
      dispatch(startFetchingObjectTracker());

      axios.get(src).then((response) => {
        dispatch(fetchObjectTrackerSuccess(response.data));
        resolve();
      }, (error) => {
        dispatch(fetchObjectTrackerError(error));
        reject();
      });
    });
  };
}

// Reducer
export default function ObjectTrackerReducer(state = initialState, action = {}) {
  switch (action.type) {
    case FETCH_OBJECTTRACKER_START:
      return state.set('isFetching', true)
                  .set('fetched', false)
                  .set('error', null)
                  .set('data', {});
    case FETCH_OBJECTTRACKER_SUCCESS:
      return state.set('isFetching', false)
                  .set('fetched', true)
                  .set('data', action.payload);
    case FETCH_OBJECTTRACKER_ERROR:
      return state.set('isFetching', false)
                  .set('fetched', false)
                  .set('error', action.payload);
    default:
      return state;
  }
}
