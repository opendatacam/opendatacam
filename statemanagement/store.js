import { createStore, applyMiddleware } from 'redux';
import thunkMiddleware from 'redux-thunk';
import { fromJS } from 'immutable';
import reducers from './reducers';

export const makeStore = (initialState, { isServer }) => {
  const middlewares = [thunkMiddleware];
  const middlewareEnhancer = applyMiddleware(...middlewares);

  if (isServer) {
    const store = createStore(reducers, initialState, middlewareEnhancer);
    return store;
  }
  if (!window.store) {
    // For each key of initialState, convert to Immutable object
    // Because SSR passed it as plain object
    Object.keys(initialState).map((key) => {
      initialState[key] = fromJS(initialState[key]);
    });
    window.store = createStore(reducers, initialState, middlewareEnhancer);
  }
  return window.store;
};
