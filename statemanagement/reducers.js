import { combineReducers } from 'redux'
import app from './app/AppStateManagement'
import counter from './app/CounterStateManagement'
import viewport from './app/ViewportStateManagement'
import tracker from './app/TrackerStateManagement'
import history from './app/HistoryStateManagement'
import usersettings from './app/UserSettingsStateManagement'

export default combineReducers({
  app,
  counter,
  tracker,
  history,
  viewport,
  usersettings
})
