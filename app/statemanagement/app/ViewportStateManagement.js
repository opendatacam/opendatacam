import { fromJS } from 'immutable';
import axios from 'axios';

// Initial state
const initialState = fromJS({
  orientationListenerInit: false,
  orientation: null
});

// Actions
const SET_PORTRAIT = 'Viewport/SET_PORTRAIT';
const SET_LANDSCAPE = 'Viewport/SET_LANDSCAPE';
const INIT_ORIENTATION_LISTENER = 'Viewport/INIT_ORIENTATION_LISTENER';


export function handleOrientationChange(dispatch) {
  if(window.orientation === -90 || window.orientation === 90) {
    console.log('landscape');
    dispatch(setLandscape());
  } else {
    console.log('portrait');
    dispatch(setPortrait());
  }
}

export function initOrientationListener() {
  return (dispatch, getState) => {
    
    //Only if not initialized
    if(!getState().viewport.get('orientationListenerInit')) {
      dispatch({
        type: INIT_ORIENTATION_LISTENER
      });
      console.log('init orientation change listener');
      window.addEventListener('orientationchange', handleOrientationChange.bind(this, dispatch));
      handleOrientationChange(dispatch);
    }
  }
}

export function setLandscape() {
  return {
    type: SET_LANDSCAPE
  }
}

export function setPortrait() {
  return {
    type: SET_PORTRAIT
  }
}

// Reducer
export default function ViewportStateManagement(state = initialState, action = {}) {
  switch (action.type) {
    case SET_LANDSCAPE:
      return state.set('orientation', 'landscape')
    case SET_PORTRAIT:
      return state.set('orientation', 'portrait')
    case INIT_ORIENTATION_LISTENER:
      return state.set('orientationListenerInit', true)
    default:
      return state;
  }
}
