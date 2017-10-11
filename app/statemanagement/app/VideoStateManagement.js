import { fromJS } from 'immutable';
import axios from 'axios';

// Initial state
const initialState = fromJS({
  src: null,
  isPlaying: false,
  isPaused: false,
  isReadyToPlay: false,
  error: null,
  duration: null
});

// Actions

const SET_VIDEO_SRC = 'Video/SET_VIDEO_SRC';
const SET_VIDEO_READY = 'Video/SET_VIDEO_READY';
const SET_VIDEO_PLAYING = 'Video/SET_VIDEO_PLAYING';
const SET_VIDEO_PAUSED = 'Video/SET_VIDEO_PAUSED';

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

export function setVideoPlaying() {
  return {
    type: SET_VIDEO_PLAYING
  }
}

export function setVideoPaused() {
  return {
    type: SET_VIDEO_PAUSED
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
    case SET_VIDEO_PLAYING:
      return state.set('isPlaying', true)
                  .set('isPaused', false);
    case SET_VIDEO_PAUSED:
      return state.set('isPaused', true)
                  .set('isPlaying', false);
    default:
      return state;
  }
}
