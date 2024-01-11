import { createSlice } from '@reduxjs/toolkit';

// Initial state
const initialState = {
  listenersInitialized: false,
  deviceOrientation: 'none',
  canvasResolution: {
    w: 1280,
    h: 720,
  },
  // TODO LATER
  // Maybe can rid of this by directly sending only the percentage value
  // This means original resolution of the YOLO detections & tracker
  // image field in opendatacam class on server
  // This should by set by the server
  originalResolution: {
    w: 0,
    h: 0,
  },
};

export function getCanvasResolution() {
  const { innerWidth } = window;
  const { innerHeight } = window;

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
    h: innerHeight,
  };
}

const viewportSlice = createSlice({
  name: 'viewport',
  initialState,
  reducers: {
    // Give case reducers meaningful past-tense "event"-style names
    listenersInitialized(state) {
      state.listenersInitialized = true;
    },
    setCanvasResolution(state, action) {
      state.canvasResolution.w = action.payload.w;
      state.canvasResolution.h = action.payload.h;
    },
    setOriginalResolution(state, action) {
      state.originalResolution.w = action.payload.w;
      state.originalResolution.h = action.payload.h;
    },
    setPortrait(state) {
      state.deviceOrientation = 'portrait';
    },
    setLandscape(state) {
      state.deviceOrientation = 'landscape';
    }
  },
});

// `createSlice` automatically generated action creators with these names.
// export them as named exports from this "slice" file
export const {
  listenersInitialized,
  setCanvasResolution,
  setLandscape,
  setOriginalResolution,
  setPortrait,
} = viewportSlice.actions;

// Export the slice reducer as the default export
export default viewportSlice.reducer;

export function handleOrientationChange(dispatch) {
  if (window.orientation === -90 || window.orientation === 90 || window.screen.orientation.type.startsWith('landscape')) {
    dispatch(setLandscape());
  } else if (window.screen.orientation.type.startsWith('portrait') || window.orientation !== undefined) {
    dispatch(setPortrait());
  }
  dispatch(setCanvasResolution(getCanvasResolution()));
}

export function initViewportListeners() {
  return (dispatch, getState) => {
    // Only if not initialized
    if (!getState().viewport.listenersInitialized) {
      dispatch(listenersInitialized());
      window.addEventListener('orientationchange', () => {
        handleOrientationChange(dispatch);
      });
      window.screen.orientation.addEventListener('change', () => {
        handleOrientationChange(dispatch);
      });
      handleOrientationChange(dispatch);

      let resizeDebounceTimeout = null;
      window.addEventListener('resize', () => {
        if (resizeDebounceTimeout) {
          // clear the timeout
          clearTimeout(resizeDebounceTimeout);
        }
        // start timing for event "completion"
        resizeDebounceTimeout = setTimeout(() => {
          dispatch(setCanvasResolution(getCanvasResolution()));
        }, 250);
      });
    }
  };
}
