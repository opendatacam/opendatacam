import { fromJS } from 'immutable';
import axios from 'axios';

import { playVideo, pauseVideo, resetVideo } from './VideoStateManagement';

// Initial state
const initialState = fromJS({
  score: 0,
  killedItems: [],
  missedItems: [],
  maxMissed: 5,
  status: {
    currentLevel: 1,
    isPlaying: false,
    finished: false,
    failed: false
  }
});

// Actions
const INCREMENT_SCORE = 'Game/INCREMENT_SCORE'
const RESET_SCORE = 'Game/RESET_SCORE'

const ADD_MISSED_ITEM = 'Game/ADD_MISSED_ITEM'
const ADD_KILLED_ITEM = 'Game/ADD_KILLED_ITEM'

const START_LEVEL = 'Game/START_LEVEL'
const FAILED_LEVEL = 'Game/FAILED_LEVEL'
const RETRY_LEVEL = 'Game/RETRY_LEVEL'
const FINISHED_LEVEL = 'Game/FINISHED_LEVEL'

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
  return (dispatch, getState) => {
    dispatch({
      type: ADD_MISSED_ITEM,
      payload: id
    });

    // Check is we haven't failed the level
    if(getState().game.get('missedItems').size >= getState().game.get('maxMissed')) {
      dispatch(failedLevel());
    }
  }
}

export function addKilledItem(id) {
  return {
    type: ADD_KILLED_ITEM,
    payload: id
  }
}

export function startLevel() {
  return (dispatch, getState) => {

    // Notify UI we are starting the level
    dispatch({
      type: START_LEVEL
    });

    // Play the video
    dispatch(playVideo())
  }
}

export function failedLevel() {
  return (dispatch, getState) => {

    // Notify UI we are starting the level
    dispatch({
      type: FAILED_LEVEL
    });

    // Stop the video
    dispatch(pauseVideo())
  }
}

export function retryLevel() {
  return (dispatch, getState) => {

    // Notify UI we are starting the level
    dispatch({
      type: RETRY_LEVEL
    });

    // Reset the video
    dispatch(resetVideo())
  }
}

export function levelFinished() {
  return {
    type: FINISHED_LEVEL
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
    case ADD_KILLED_ITEM:
      return state.update('killedItems', (killedItems) => killedItems.push(action.payload));
    case START_LEVEL:
      return state.setIn(['status','isPlaying'], true)
                  .setIn(['status','failed'], false)
                  .setIn(['status','finished'], false)
    case FAILED_LEVEL:
      return state.setIn(['status','failed'], true)
                  .setIn(['status','isPlaying'], false)
    case FINISHED_LEVEL:
      return state.setIn(['status','finished'], true)
                  .setIn(['status','isPlaying'], false)
    case RETRY_LEVEL:
      return state.merge(initialState)
    default:
      return state;
  }
}
