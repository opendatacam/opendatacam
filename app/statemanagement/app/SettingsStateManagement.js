import { fromJS } from 'immutable';
import axios from 'axios';

// Initial state
const initialState = fromJS({
  showDebugUI: true
});

// Actions
const UPDATE_SETTINGS = 'Settings/UPDATE'

export function updateSettings(newSettings) {
  return {
    type: UPDATE_SETTINGS,
    payload: newSettings
  }
}

// Reducer
export default function SettingsReducer(state = initialState, action = {}) {
  switch (action.type) {
    case UPDATE_SETTINGS:
      return state.merge(action.payload)
    default:
      return state;
  }
}
