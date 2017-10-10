import { fromJS } from 'immutable';
import axios from 'axios';

// Initial state
const initialState = fromJS({
  score: 0,
  missedItems: [] 
});

// Actions
const INCREMENT_SCORE = 'Game/INCREMENT_SCORE'
const RESET_SCORE = 'Game/RESET_SCORE'

const ADD_MISSED_ITEM = 'Game/ADD_MISSED_ITEM'

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

export function addMissedItem(id) {
  return {
    type: ADD_MISSED_ITEM,
    payload: id
  }
}

// Reducer
export default function GameReducer(state = initialState, action = {}) {
  switch (action.type) {
    case INCREMENT_SCORE:
      return state.set('score', state.get('score') + 1)
    case RESET_SCORE:
      return state.set('score', 0)
    case ADD_MISSED_ITEM:
      return state.update('missedItems', (missedItems) => missedItems.push(action.payload));
    default:
      return state;
  }
}
