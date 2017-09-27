import { fromJS } from 'immutable';
import axios from 'axios';

// Initial state
const initialState = fromJS({
  src: "/static/sample/sample-detections.txt",
  data: {},
  isFetching: false,
  fetched: false,
  error: null
});

// Actions
const FETCH_RAWDETECTIONS_START = 'RawDetections/FETCH_RAWDETECTIONS_START';
const FETCH_RAWDETECTIONS_ERROR = 'RawDetections/FETCH_RAWDETECTIONS_ERROR';
const FETCH_RAWDETECTIONS_SUCCESS = 'RawDetections/FETCH_RAWDETECTIONS_SUCCESS';

export function startFetchingRawDetections() {
  return {
    type: FETCH_RAWDETECTIONS_START
  };
}

export function fetchRawDetectionsSuccess(detections) {
  return {
    type: FETCH_RAWDETECTIONS_SUCCESS,
    payload: detections
  };
}

export function fetchRawDetectionsError(error) {
  return {
    type: FETCH_RAWDETECTIONS_ERROR,
    payload: new Error(),
    error: true
  };
}

export function fetchRawDetections() {
  return (dispatch, getState) => {
    return new Promise((resolve, reject) => {
      // Notify UI we are fetching stuff
      dispatch(startFetchingRawDetections());

      axios.get(getState().rawDetections.get('src')).then((response) => {
        // Parse txt file
        let rawDetections = {};
        let lines = response.data.split('\n');
        lines.forEach(function(line) {
          if(line) {
            let detection = JSON.parse(line);
            rawDetections[detection.frame] = detection.detections;
          }
        });
        dispatch(fetchRawDetectionsSuccess(rawDetections));
        resolve();
      }, (error) => {
        dispatch(fetchRawDetectionsError(error));
        reject();
      });
    });
  };
}

// Reducer
export default function RawDetectionsReducer(state = initialState, action = {}) {
  switch (action.type) {
    case FETCH_RAWDETECTIONS_START:
      return state.set('isFetching', true)
                  .set('fetched', false)
                  .set('error', null)
    case FETCH_RAWDETECTIONS_SUCCESS:
      return state.set('isFetching', false)
                  .set('fetched', true)
                  .set('data', action.payload);
    case FETCH_RAWDETECTIONS_ERROR:
      return state.set('isFetching', false)
                  .set('fetched', false)
                  .set('error', action.payload);
    default:
      return state;
  }
}
