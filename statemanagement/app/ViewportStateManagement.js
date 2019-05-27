import { fromJS } from 'immutable'

// Initial state
const initialState = fromJS({
  listenersInitialized: false,
  deviceOrientation: 'none',
  canvasResolution: {
    w: 1280,
    h: 720
  },
  // TODO LATER
  // Maybe can rid of this by directly sending only the percentage value
  // This means original resolution of the YOLO detections & tracker
  // image field in opendatacam class on server
  // This should by set by the server
  originalResolution: {
    w: 0,
    h: 0
  }
})

// Actions
const SET_PORTRAIT = 'Viewport/SET_PORTRAIT'
const SET_LANDSCAPE = 'Viewport/SET_LANDSCAPE'
const INIT_LISTENERS = 'Viewport/INIT_LISTENERS'
const SET_CANVAS_RESOLUTION = 'Viewport/SET_CANVAS_RESOLUTION'
const SET_ORIGINAL_RESOLUTION = 'Viewport/SET_ORIGINAL_RESOLUTION'

export function handleOrientationChange (dispatch) {
  // console.log(window.orientation)
  if (window.orientation === -90 || window.orientation === 90) {
    // console.log('landscape')
    dispatch(setLandscape())
  } else if (window.orientation !== undefined) {
    // console.log('portrait')
    dispatch(setPortrait())
  }
  dispatch(setCanvasResolution(getCanvasResolution()))
}

export function initViewportListeners () {
  return (dispatch, getState) => {
    // Only if not initialized
    if (!getState().viewport.get('listenersInitialized')) {
      dispatch({
        type: INIT_LISTENERS
      })
      // console.log('init orientation change listener')
      window.addEventListener('orientationchange', handleOrientationChange.bind(this, dispatch))
      handleOrientationChange(dispatch)
      dispatch(setCanvasResolution(getCanvasResolution()))


      let resizeDebounceTimeout = null;
      window.addEventListener('resize', () => {
        if (resizeDebounceTimeout) {
          // clear the timeout
          clearTimeout(resizeDebounceTimeout);
        }
        // start timing for event "completion"
        resizeDebounceTimeout = setTimeout(() => 
          dispatch(setCanvasResolution(getCanvasResolution())), 
        250)
      })
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

export function setCanvasResolution (size) {
  return {
    type: SET_CANVAS_RESOLUTION,
    payload: size
  }
}

export function setOriginalResolution (resolution) {
  return {
    type: SET_ORIGINAL_RESOLUTION,
    payload: resolution
  }
}

export function getCanvasResolution () {
  let innerWidth = window.innerWidth
  let innerHeight = window.innerHeight

  // if (innerWidth / innerHeight < 16 / 9) {
  //   // Height is 100% and there is a scroll on the width
  //   return {
  //     w: innerHeight * 16 / 9,
  //     h: innerHeight
  //   }
  // } else {
  //   // Width is 100% and there is a scroll on the height
  //   return {
  //     w: innerWidth,
  //     h: innerWidth * 9 / 16
  //   }
  // }

  return {
    w: innerWidth,
    h: innerHeight
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
    case SET_CANVAS_RESOLUTION:
      return state.set('canvasResolution', fromJS(action.payload))
    case SET_ORIGINAL_RESOLUTION:
      return state.set('originalResolution', fromJS(action.payload))
    default:
      return state
  }
}
