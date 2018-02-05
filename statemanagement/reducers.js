import { combineReducers } from 'redux'
import app from './app/AppStateManagement'
import counter from './app/CounterStateManagement'
import viewport from './app/ViewportStateManagement'

export default combineReducers({
  app,
  counter,
  viewport
})
