import { fromJS } from 'immutable';
import axios from 'axios';

// Initial state
const initialState = fromJS({
  src: "https://player.vimeo.com/external/235911346.hd.mp4?s=079f01de35d181dbef705e7ec51da623b2f78de3",
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
