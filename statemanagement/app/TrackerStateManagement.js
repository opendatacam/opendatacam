import { createSlice } from '@reduxjs/toolkit';

// Initial state
const initialState = {
  trackerData: {
    frameIndex: 0,
    data: [],
  },
};

export function getTrackerAccuracyNbFrameBuffer() {
  return window.CONFIG.TRACKER_ACCURACY_DISPLAY.nbFrameBuffer;
}

export function getTrackerAccuracySettings() {
  return window.CONFIG.TRACKER_ACCURACY_DISPLAY.settings;
}

const trackerSlice = createSlice({
  name: 'tracker',
  initialState,
  reducers: {
    // Give case reducers meaningful past-tense "event"-style names
    updateTrackerData(state, action) {
      state.trackerData = action.payload;
    },
  },
});

// `createSlice` automatically generated action creators with these names.
// export them as named exports from this "slice" file
export const {
  updateTrackerData,
} = trackerSlice.actions;

// Export the slice reducer as the default export
export default trackerSlice.reducer;
