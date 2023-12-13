import { configureStore } from '@reduxjs/toolkit';

import viewportReducer from './app/ViewportStateManagement';
import appReducer from './app/AppStateManagement';
import usersettingsReducer from './app/UserSettingsStateManagement';
import counterReducer from './app/CounterStateManagement';
import trackerReducer from './app/TrackerStateManagement';
import historyReducer from './app/HistoryStateManagement';

export const store = configureStore({
  // Automatically calls `combineReducers`
  reducer: {
    app: appReducer,
    counter: counterReducer,
    history: historyReducer,
    tracker: trackerReducer,
    usersettings: usersettingsReducer,
    viewport: viewportReducer,
  },
});

export default store;
