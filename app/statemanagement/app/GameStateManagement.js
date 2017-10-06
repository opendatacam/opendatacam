import { fromJS } from 'immutable';
import axios from 'axios';

// Initial state
const initialState = fromJS({
  score: 0
});

// Actions
const INCREMENT_SCORE = 'Game/INCREMENT_SCORE'
const RESET_SCORE = 'Game/RESET_SCORE'

export function incrementScore() {
  return {
    type: INCREMENT_SCORE
  }
}

export function resetScore() {
  return {
    type: RESET_SCORE
  }
}

// Reducer
export default function GameReducer(state = initialState, action = {}) {
  switch (action.type) {
    case INCREMENT_SCORE:
      return state.set('score', state.get('score') + 1)
    case RESET_SCORE:
      return state.set('score', 0)
    default:
      return state;
  }
}
