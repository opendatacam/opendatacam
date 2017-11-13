import { fromJS } from 'immutable';
import axios from 'axios';

import { playVideo, pauseVideo, resetVideo } from './VideoStateManagement';
import { selectVideo } from './AppStateManagement';

import SoundsManager from './SoundsManager';

// Initial state
const initialState = fromJS({
  score: 0,
  killedItems: [],
  missedItems: [],
  maxMissed: 20,
  currentLevel: 1,
  isPlaying: false,
  finished: false,
  failed: false,
  nbTotalLevel: 2
});

// Actions
const INCREMENT_SCORE = 'Game/INCREMENT_SCORE'
const RESET_SCORE = 'Game/RESET_SCORE'

const ADD_MISSED_ITEM = 'Game/ADD_MISSED_ITEM'
const ADD_KILLED_ITEM = 'Game/ADD_KILLED_ITEM'

const START_LEVEL = 'Game/START_LEVEL'
const FAILED_LEVEL = 'Game/FAILED_LEVEL'
const RETRY = 'Game/RETRY'
const FINISHED_LEVEL = 'Game/FINISHED_LEVEL'
const SET_CURRENT_LEVEL = 'Game/SET_CURRENT_LEVEL'

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

    // TODO Maybe move to the dispatch of the UI, so we keep consistent 
    // that all sound triggering are done from the views
    SoundsManager.playSound('main');

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

export function retry() {
  return (dispatch, getState) => {

    if(getState().game.get('currentLevel') === 1) {
      // Reset the video
      dispatch(resetVideo());
    } else {
      dispatch(loadLevel(1));
    }

    // Notify UI we are re-starting the game
    dispatch({
      type: RETRY
    });
  }
}

export function levelFinished() {
  return {
    type: FINISHED_LEVEL
  }
}

export function setCurrentLevel(level) {
  return {
    type: SET_CURRENT_LEVEL,
    payload: level
  }
}

export function loadLevel(level) {
  return (dispatch, getState) => {

    const video = getState().app.get('availableVideos').find((video) => 
                    video.get('level') === level
                  );

    // Select video for that level
    dispatch(selectVideo(video.get('name')));

    dispatch(setCurrentLevel(level));
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
      return state.set('isPlaying', true)
                  .set('failed', false)
                  .set('finished', false)
    case FAILED_LEVEL:
      return state.set('failed', true)
                  .set('isPlaying', false)
    case FINISHED_LEVEL:
      return state.set('finished', true)
                  .set('isPlaying', false)
    case SET_CURRENT_LEVEL:
      return state.set('currentLevel', action.payload)
                  .set('isPlaying', false)
                  .set('finished', false)
                  .set('failed', false)
    case RETRY:
      return state.merge(initialState)
    default:
      return state;
  }
}
