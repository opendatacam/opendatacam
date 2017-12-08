import { fromJS } from 'immutable'
import axios from 'axios';

// Initial state
const initialState = fromJS({
  countingData: {}
})

// Actions
const FETCH_COUNTINGDATA_SUCCESS = 'Counter/FETCH_COUNTINGDATA'

export function fetchCountingData() {
  return (dispatch, getState) => {
    axios.get('/counter/data').then((response) => {
      dispatch({
        type: FETCH_COUNTINGDATA_SUCCESS,
        payload: response.data
      })
    });
  }
}

// Reducer
export default function CounterReducer (state = initialState, action = {}) {
  switch (action.type) {
    case FETCH_COUNTINGDATA_SUCCESS:
      return state.set('countingData', fromJS(action.payload))
    default:
      return state
  }
}
