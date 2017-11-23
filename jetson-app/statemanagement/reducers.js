import { combineReducers } from 'redux'
import app from './app/AppStateManagement'
import counter from './app/CounterStateManagement'

export default combineReducers({
  app,
  counter
})
