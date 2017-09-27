import { fromJS } from 'immutable';
import axios from 'axios';

// Initial state
const initialState = fromJS({
  src: "/static/sample/sample-video.mp4",
  isPlaying: false,
  isPaused: false,
  isLoading: false,
  isReadyToPlay: false,
  error: null
});

// Actions

const SET_VIDEO_READY = 'Video/SET_VIDEO_READY';
const SET_VIDEO_LOADING = 'Video/SET_VIDEO_LOADING';
const SET_VIDEO_PLAYING = 'Video/SET_VIDEO_PLAYING';
const SET_VIDEO_PAUSED = 'Video/SET_VIDEO_PAUSED';


export function setVideoReady() {
  return {
    type: SET_VIDEO_READY
  }
}
export function setVideoLoading() {
  return {
    type: SET_VIDEO_LOADING
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
    case SET_VIDEO_READY:
      return state.set('isReadyToPlay', true);
    case SET_VIDEO_LOADING:
      return state.set('isLoading', true);
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
