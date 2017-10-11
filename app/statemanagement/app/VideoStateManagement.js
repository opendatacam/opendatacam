import { fromJS } from 'immutable';
import axios from 'axios';

import { levelFinished } from '../../statemanagement/app/GameStateManagement';

// Initial state
const initialState = fromJS({
  src: null,
  isPlaying: false,
  isPaused: false,
  isReadyToPlay: false,
  isAtBeggining: true,
  error: null,
  duration: null,
  currentTime: 0
});

// Actions

const SET_VIDEO_SRC = 'Video/SET_VIDEO_SRC';
const SET_VIDEO_READY = 'Video/SET_VIDEO_READY';
const PLAY_VIDEO = 'Video/PLAY_VIDEO';
const PAUSE_VIDEO = 'Video/PAUSE_VIDEO';
const RESET_VIDEO = 'Video/RESET_VIDEO';
const UPDATE_CURRENTTIME = 'Video/UPDATE_CURRENTTIME';

export function setVideoSrc(src) {
  return {
    type: SET_VIDEO_SRC,
    payload: src
  }
}

export function setVideoReady(metadata) {
  return {
    type: SET_VIDEO_READY,
    payload: metadata
  }
}

export function playVideo() {
  return {
    type: PLAY_VIDEO
  }
}

export function pauseVideo() {
  return {
    type: PAUSE_VIDEO
  }
}

export function resetVideo() {
  return {
    type: RESET_VIDEO
  }
}

export function setVideoEnded() {
  return (dispatch, getState) => {
    // Notify game that video has ended
    dispatch(levelFinished());

    dispatch({
      type: PAUSE_VIDEO
    });
  }
}

export function updateCurrentTime(time) {
  return {
    type: UPDATE_CURRENTTIME,
    payload: time
  }
}

// Reducer
export default function VideoReducer(state = initialState, action = {}) {
  switch (action.type) {
    case SET_VIDEO_SRC:
      return state.merge(initialState)
                  .set('src', action.payload)
    case SET_VIDEO_READY:
      return state.set('isReadyToPlay', true)
                  .set('duration', action.payload.duration);
    case PLAY_VIDEO:
      return state.set('isPlaying', true)
                  .set('isAtBeggining', false);
    case PAUSE_VIDEO:
      return state.set('isPlaying', false);
    case RESET_VIDEO:
      return state.set('isAtBeggining', true);
    case UPDATE_CURRENTTIME:
      return state.set('currentTime', action.payload)
    default:
      return state;
  }
}
