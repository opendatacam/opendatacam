import { fromJS } from 'immutable'

// Initial state
const initialState = fromJS({
    dimmerOpacity: 0.1,
    darkMode: false
})

const LOCALSTORAGE_KEY = 'opendatacam'

// Actions
const SET_USERSETTING = 'UserSettings/SET_USERSETTING'

export function loadUserSettings() {
    return (dispatch, getState) => {

        // Load localstorage content into reducer
        let persistedData = window.localStorage.getItem('opendatacam');
        if(persistedData) {
            let parsedData = JSON.parse(persistedData);
            Object.keys(parsedData).map((key) => {
                dispatch(setUserSetting(key, parsedData[key]))
            })

            // TODO for each key setUserSetting
        } else {
            // Nothing persisted yet, persist default
            persistUserSettings(initialState.toJS());
        }
    }
}

function persistUserSettings(userSettings) {
    // Persist
    localStorage.setItem(LOCALSTORAGE_KEY, JSON.stringify(userSettings));
}

export function setUserSetting(userSetting, value) {
    return (dispatch, getState) => {

        dispatch({
            type: SET_USERSETTING,
            payload: {
                userSetting,
                value
            }
        })

        // Specific side effect for darkMode
        if (userSetting === 'darkMode' && value === true) {
            document.getElementsByTagName("body")[0].className = 'theme-dark';
        } else if(userSetting === 'darkMode' && value === false) {
            document.getElementsByTagName("body")[0].className = '';
        }

        // Persist
        persistUserSettings(getState().usersettings.toJS());
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
