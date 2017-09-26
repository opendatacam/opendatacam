import { createStore, applyMiddleware } from 'redux'
import Immutable from 'immutable';
import { composeWithDevTools } from 'redux-devtools-extension'
import thunkMiddleware from 'redux-thunk'
import reducers from './reducers.js'

const enhancer = composeWithDevTools(
  applyMiddleware(thunkMiddleware)
)

export const initStore = (initialState) => {
  if (typeof window === 'undefined') {
    let store = createStore(reducers, initialState, enhancer);
    return store;
  } else {
    if (!window.store) {
      //For each key of initialState, convert to Immutable object
      //Because SSR passed it as plain object
      Object.keys(initialState).map(function(key, index) {
        initialState[key] = Immutable.fromJS(initialState[key]);
      });
      window.store = createStore(reducers, initialState, enhancer)
    }
    return window.store
  }
  return store;
}
