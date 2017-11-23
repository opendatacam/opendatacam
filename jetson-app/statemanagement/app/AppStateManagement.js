import { fromJS } from 'immutable'

// Initial state
const initialState = fromJS({
  isCounting: false
})

// Actions
const START_COUNTING = 'App/START_COUNTING'
const STOP_COUNTING = 'App/STOP_COUNTING'

export function startCounting () {
  return (dispatch, getState) => {

    // Ping webservice to start yolo and shutdown webcam stream
    // TODO

    // Notify UI we start counting
    dispatch({
      type: START_COUNTING
    })
  }
}

export function stopCounting() {
  return {
    type: STOP_COUNTING
  }
}



// Reducer
export default function AppReducer (state = initialState, action = {}) {
  switch (action.type) {
    case START_COUNTING:
      return state.set('isCounting', true)
    case STOP_COUNTING:
      return state.set('isCounting', false)
    default:
      return state
  }
}
