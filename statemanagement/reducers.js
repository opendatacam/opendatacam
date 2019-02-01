import { combineReducers } from 'redux'
import app from './app/AppStateManagement'
import counter from './app/CounterStateManagement'
import viewport from './app/ViewportStateManagement'
import tracker from './app/TrackerStateManagement'

export default combineReducers({
  app,
  counter,
  tracker,
  viewport
})
