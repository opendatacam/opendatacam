import { fromJS } from 'immutable';
import axios from 'axios';

// Initial state
const initialState = fromJS({
  test: true
});

// Actions
const TOGGLE_TEST = 'App/TOGGLE_TEST';

export function toggleTest() {
  return {
    type: TOGGLE_TEST
  }
}

// Reducer
export default function AppReducer(state = initialState, action = {}) {
  switch (action.type) {
    case TOGGLE_TEST:
      return state.set('test', !state.test);
    default:
      return state;
  }
}
