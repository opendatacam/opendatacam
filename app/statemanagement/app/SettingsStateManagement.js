import { fromJS } from 'immutable';
import axis from 'axios';
import SoundsManager from './SoundsManager';

// Initial state
const initialState = fromJS({
  showDebugUI: true,
  darkMode: false,
  soundEnabled: true
});

// Actions
const UPDATE_SETTINGS = 'Settings/UPDATE'

const SOUND_ON = 'Settings/SOUND_ON';
const SOUND_OFF = 'Settings/SOUND_OFF';

export function updateSettings(newSettings) {
  return {
    type: UPDATE_SETTINGS,
    payload: newSettings
  }
}

export function turnSoundOn() {
  return (dispatch, getState) => {
    
    SoundsManager.unMuteAll();

    dispatch({
      type: SOUND_ON
    });
  }
}

export function turnSoundOff() {
  return (dispatch, getState) => {
    
    SoundsManager.muteAll();

    dispatch({
      type: SOUND_OFF
    });
  }
}

// Reducer
export default function SettingsReducer(state = initialState, action = {}) {
  switch (action.type) {
    case UPDATE_SETTINGS:
      return state.merge(action.payload)
    case SOUND_ON:
      return state.set('soundEnabled', true)
    case SOUND_OFF:
      return state.set('soundEnabled', false)
    default:
      return state;
  }
}
