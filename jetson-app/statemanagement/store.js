import { createStore, applyMiddleware, compose } from 'redux'
import Immutable from 'immutable'
import thunkMiddleware from 'redux-thunk'
import reducers from './reducers.js'

const composeEnhancers =
  process.env.NODE_ENV !== 'production' &&
  typeof window === 'object' &&
  window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__
    ? window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__({
      // Specify here name, actionsBlacklist, actionsCreators and other options
    })
    : compose

const enhancer = composeEnhancers(
  applyMiddleware(thunkMiddleware)
  // other store enhancers if any
)

export const initStore = initialState => {
  if (typeof window === 'undefined') {
    let store = createStore(reducers, initialState, enhancer)
    return store
  } else {
    if (!window.store) {
      // For each key of initialState, convert to Immutable object
      // Because SSR passed it as plain object
      Object.keys(initialState).map(function (key, index) {
        initialState[key] = Immutable.fromJS(initialState[key])
      })
      window.store = createStore(reducers, initialState, enhancer)
    }
    return window.store
  }
}
