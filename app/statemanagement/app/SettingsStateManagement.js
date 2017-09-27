import { fromJS } from 'immutable';
import axios from 'axios';

// Initial state
const initialState = fromJS({
  showDebugUI: true
});

// Actions
const TOGGLE_SHOW_DEBUGUI = 'Settings/TOGGLE_SHOW_DEBUGUI';

export function toggleTest() {
  return {
    type: TOGGLE_SHOW_DEBUGUI
  }
}

// Reducer
export default function SettingsReducer(state = initialState, action = {}) {
  switch (action.type) {
    case TOGGLE_SHOW_DEBUGUI:
      return state.set('showDebugUI', !state.get('showDebugUI'));
    default:
      return state;
  }
}
