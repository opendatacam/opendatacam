import { fromJS } from 'immutable'

// Initial state
const initialState = fromJS({
    dimmerOpacity: 0.1,
    darkMode: false
})

// Actions
const SET_USERSETTING = 'App/SET_USERSETTING'

export function setUserSetting(userSetting, value) {
    return {
        type: SET_USERSETTING,
        payload: {
            userSetting,
            value
        }
    }
}

// Reducer
export default function ViewportStateManagement(
    state = initialState,
    action = {}
) {
    switch (action.type) {
        case SET_USERSETTING:
            return state.set(action.payload.userSetting, fromJS(action.payload.value))
        default:
            return state
    }
}
