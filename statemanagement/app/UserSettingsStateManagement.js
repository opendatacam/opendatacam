import { createSlice } from '@reduxjs/toolkit';

const LOCALSTORAGE_KEY = 'opendatacam';

// Initial state
const initialState = {
  dimmerOpacity: 0.1,
  darkMode: false,
};

function persistUserSettings(userSettings) {
  // Persist
  localStorage.setItem(LOCALSTORAGE_KEY, JSON.stringify(userSettings));
}

const userSettingsSlice = createSlice({
  name: 'usersettings',
  initialState,
  reducers: {
    // Give case reducers meaningful past-tense "event"-style names
    setUserSetting(state, action) {
      // Specific side effect for darkMode
      const { key, value } = action.payload;
      if (key === 'darkMode' && value === true) {
        document.getElementsByTagName('body')[0].className = 'theme-dark';
      } else if (key === 'darkMode' && value === false) {
        document.getElementsByTagName('body')[0].className = '';
      }

      state[key] = value;

      // Persist
      persistUserSettings(state);
    },
  },
})

// `createSlice` automatically generated action creators with these names.
// export them as named exports from this "slice" file
export const { setUserSetting, } = userSettingsSlice.actions;

// Export the slice reducer as the default export
export default userSettingsSlice.reducer;

export function loadUserSettings() {
  return (dispatch) => {
    // Load localstorage content into reducer
    const persistedData = window.localStorage.getItem('opendatacam');
    if (persistedData) {
      const parsedData = JSON.parse(persistedData);
      Object.keys(parsedData).forEach((key) => {
        dispatch(setUserSetting({ key, value: parsedData[key] }));
      });
    } else {
      // Nothing persisted yet, persist default
      persistUserSettings(initialState);
    }
  };
}
