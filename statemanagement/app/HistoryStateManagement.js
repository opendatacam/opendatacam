import { createSlice } from '@reduxjs/toolkit';
import axios from 'axios';

const DEFAULT_LIMIT = 20;
const DEFAULT_OFFSET = 0;

// Initial state
const initialState = {
  recordingHistory: [],
  isFetchingHistory: false,
  fetchHistoryError: null,
  recordingsCursor: {
    limit: DEFAULT_LIMIT,
    offset: DEFAULT_OFFSET,
    total: 0,
  },
};

export function fetchHistory(offset = DEFAULT_OFFSET, limit = DEFAULT_LIMIT) {
  return (dispatch) => {
    // dispatch({ type: FETCH_HISTORY_START });
    dispatch(fetchHistoryStarted());

    axios.get(`/recordings?offset=${offset}&limit=${limit}`).then((response) => {
      dispatch(fetchHistorySuccess(response.data.recordings));
      dispatch(updateRecordingsCursor({
        total: response.data.total,
        offset: response.data.offset,
        limit: response.data.limit,
      }));
    }, () => {
      dispatch(fetchHistoryError());
    });
  };
}

export function deleteRecording(recordingId) {
  return (dispatch) => {
    dispatch(recordingDeleted(recordingId));
    axios.delete(`/recording/${recordingId}`);
  };
}

const historySlice = createSlice({
  name: 'history',
  initialState,
  reducers: {
    // Give case reducers meaningful past-tense "event"-style names
    fetchHistorySuccess(state, action) {
      state.recordingHistory = action.payload;
      state.isFetchingHistory = false;
      state.fetchHistoryError = false;
    },
    fetchHistoryError(state) {
      state.isFetchingHistory = false;
      state.fetchHistoryError = false;
    },
    updateRecordingsCursor(state, action) {
      state.recordingsCursor = action.payload;
    },
    fetchHistoryStarted(state) {
      state.isFetchingHistory = true;
      state.fetchHistoryError = false;
    },
    recordingDeleted(state, action) {
      state.recordingHistory = state.recordingHistory.filter((h) => h.id !== action.payload);
    },
  },
});

// `createSlice` automatically generated action creators with these names.
// export them as named exports from this "slice" file
export const {
  fetchHistorySuccess,
  fetchHistoryError,
  updateRecordingsCursor,
  fetchHistoryStarted,
  recordingDeleted,
} = historySlice.actions;

// Export the slice reducer as the default export
export default historySlice.reducer;
