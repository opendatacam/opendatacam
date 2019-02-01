import { fromJS } from 'immutable'

// Initial state
const initialState = fromJS({
  listenersInitialized: false,
  deviceOrientation: 'none',
  canvasResolution: {
    w: 1280,
    h: 720
  },
  // Maybe can rid of this by directly sending only the percentage value
  originalResolution: {
    w: 1280,
    h: 720
  }
})


/** 
 *  TODO LATER, copy stuff from beat the traffic ViewportStateManagement to handle any canvas size / ratio depending on innerWith / innerHeight
 * **/

// Actions
const SET_PORTRAIT = 'Viewport/SET_PORTRAIT'
const SET_LANDSCAPE = 'Viewport/SET_LANDSCAPE'
const INIT_LISTENERS = 'Viewport/INIT_LISTENERS'

export function handleOrientationChange (dispatch) {
  // console.log(window.orientation)
  if (window.orientation === -90 || window.orientation === 90) {
    // console.log('landscape')
    dispatch(setLandscape())
  } else if (window.orientation !== undefined) {
    // console.log('portrait')
    dispatch(setPortrait())
  }
}

export function initViewportListeners () {
  return (dispatch, getState) => {
    // Only if not initialized
    if (!getState().viewport.get('listenersInitialized')) {
      dispatch({
        type: INIT_LISTENERS
      })
      // console.log('init orientation change listener')
      window.addEventListener(
        'orientationchange',
        handleOrientationChange.bind(this, dispatch)
      )
      handleOrientationChange(dispatch)
    }
  }
}

export function setLandscape () {
  return {
    type: SET_LANDSCAPE
  }
}

export function setPortrait () {
  return {
    type: SET_PORTRAIT
  }
}

// Reducer
export default function ViewportStateManagement (
  state = initialState,
  action = {}
) {
  switch (action.type) {
    case SET_LANDSCAPE:
      return state.set('deviceOrientation', 'landscape')
    case SET_PORTRAIT:
      return state.set('deviceOrientation', 'portrait')
    case INIT_LISTENERS:
      return state.set('listenersInitialized', true)
    default:
      return state
  }
}
