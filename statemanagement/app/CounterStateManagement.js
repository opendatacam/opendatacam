import axios from 'axios';
import { createSlice } from '@reduxjs/toolkit';
import { v4 as uuidv4 } from 'uuid';
import { scalePoint } from '../../utils/resolution';
import { getAvailableCounterColors, getDefaultCounterColor } from '../../utils/colors';
import { computeLineBearing } from '../../server/tracker/utils';
import { COUNTING_AREA_TYPE } from '../../utils/constants';

// Rename this to CounterEditorStateManagement

export const EDITOR_MODE = {
  EDIT_LINE: 'edit_line',
  EDIT_POLYGON: 'edit_polygon',
  ASKNAME: 'askname',
  DELETE: 'delete',
  SHOW_INSTRUCTION: 'showinstruction',
};

// Initial state
const initialState = {
  countingAreas: {},
  selectedCountingArea: null,
  mode: EDITOR_MODE.EDIT_LINE, // oneOf EDITOR_MODE
  lastEditingMode: EDITOR_MODE.EDIT_LINE,
  counterSummary: {},
  trackerSummary: {},
};

// Actions
const SAVE_COUNTING_AREA_LOCATION = 'Counter/SAVE_COUNTING_AREA_LOCATION';
const SAVE_COUNTING_AREA_BEARING = 'Counter/SAVE_COUNTING_AREA_BEARING';
const SAVE_COUNTING_AREA_TYPE = 'Counter/SAVE_COUNTING_AREA_TYPE';
const SAVE_COUNTING_AREA_NAME = 'Counter/SAVE_COUNTING_AREA_NAME';

// TODO LATER , introduce Redux saga here to make it more explicit that this is triggered by
// => SAVE_COUNTING_AREA_LOCATION
// => SAVE_COUNTING_AREA_NAME
// => DELETE_COUNTING_AREA
// => SAVE_COUNTING_AREA_TYPE
export function registerCountingAreasOnServer() {
  return (dispatch, getState) => {
    // Ping webservice to start storing data on server
    axios.post('/counter/areas', {
      countingAreas: getState().counter.countingAreas,
    });
  };
}

export function resetCountingAreas() {
  return (dispatch) => {
    dispatch(countingAreaReset());
    dispatch(registerCountingAreasOnServer());
  };
}

export function deleteCountingArea(id) {
  return (dispatch, getState) => {
    dispatch(countingAreasDeleted(id));

    if (Object.keys(getState().counter.countingAreas).length === 0) {
      dispatch(setMode(getState().counter.lastEditingMode));
    }
    dispatch(registerCountingAreasOnServer());
  };
}

export function addCountingArea(type = 'bidirectional') {
  return (dispatch, getState) => {
    // TODO Before adding a counting area, verify if selectedCountingArea is complete, otherwise
    // delete it

    const newCountingAreaId = uuidv4();

    const AVAILABLE_COLORS = getAvailableCounterColors();
    const DEFAULT_COLOR = getDefaultCounterColor();

    /* eslint-disable */
    // We disable eslint because it will inline the filters and make the code harder to read

    // Get a color unused
    let color = AVAILABLE_COLORS.find((potentialColor) => {
      const areas = Object.values(getState().counter.countingAreas);
      const areaWithSameColor = areas.find((area) => {
        return area.color === potentialColor;
      });
      return areaWithSameColor === undefined;
    });
    /* eslint-enable */

    if (!color) {
      color = DEFAULT_COLOR;
    }

    const ret = {
      id: newCountingAreaId,
      color,
      type,
    };
    dispatch(countingAreaAdded(ret));
    dispatch(selectCountingArea(newCountingAreaId));

    return ret;
  };
}

export function saveCountingAreaLocation(id, location) {
  return (dispatch, getState) => {
    // Compute bearing of the line (if polygon of the first line)
    const lineBearing = computeLineBearing(location.points[0].x,
      -location.points[0].y,
      location.points[1].x,
      -location.points[1].y);
    // in both directions
    const lineBearings = [0, 0];
    if (lineBearing >= 180) {
      lineBearings[0] = lineBearing - 180;
      lineBearings[1] = lineBearing;
    } else {
      lineBearings[0] = lineBearing;
      lineBearings[1] = lineBearing + 180;
    }

    dispatch({
      type: SAVE_COUNTING_AREA_BEARING,
      payload: {
        lineBearings,
        id,
      },
    });

    dispatch({
      type: SAVE_COUNTING_AREA_LOCATION,
      payload: {
        location,
        id,
      },
    });

    if (!getState().counter.getIn(['countingAreas', id, 'name'])) {
      dispatch(setMode(EDITOR_MODE.ASKNAME));
    }
    // TODO UPDATE server side part to handle array of points instead of just point1, point2
    dispatch(registerCountingAreasOnServer());
  };
}

export function toggleCountingAreaType(id, currentDirection) {
  return (dispatch) => {
    let newDirection = COUNTING_AREA_TYPE.BIDIRECTIONAL;

    if (currentDirection === COUNTING_AREA_TYPE.BIDIRECTIONAL) {
      newDirection = COUNTING_AREA_TYPE.LEFTRIGHT_TOPBOTTOM;
    } else if (currentDirection === COUNTING_AREA_TYPE.LEFTRIGHT_TOPBOTTOM) {
      newDirection = COUNTING_AREA_TYPE.RIGHTLEFT_BOTTOMTOP;
    }

    dispatch({
      type: SAVE_COUNTING_AREA_TYPE,
      payload: {
        type: newDirection,
        id,
      },
    });

    dispatch(registerCountingAreasOnServer());
  };
}

export function saveCountingAreaName(id, name) {
  return (dispatch) => {
    // console.log('saveName')
    dispatch({
      type: SAVE_COUNTING_AREA_NAME,
      payload: {
        id,
        name,
      },
    });

    dispatch(registerCountingAreasOnServer());
  };
}

export function computeCountingAreasCenters(countingAreas, canvasResolution) {
  const ret = {};
  Object.entries(countingAreas).forEach((entry) => {
    const key = entry[0];
    const data = entry[1];

    const { location } = data;
    if (location) {
      const { points } = location;
      const x1 = points[0].x;
      const y1 = points[0].y;
      const x2 = points[1].x;
      const y2 = points[1].y;

      ret[key].location.center = scalePoint(
        {
          x: Math.abs(x2 - x1) / 2 + Math.min(x1, x2),
          y: Math.abs(y2 - y1) / 2 + Math.min(y1, y2),
        },
        canvasResolution.toJS(),
        location.get('refResolution').toJS(),
      );
    } else {
      // return data;
      ret[key] = data;
    }
  });
  return ret;
}

// Reducer
export function CounterReducer(state = initialState, action = {}) {
  switch (action.type) {
    case SAVE_COUNTING_AREA_LOCATION:
      return state.setIn(['countingAreas', action.payload.id, 'location'], fromJS(action.payload.location));
    case SAVE_COUNTING_AREA_BEARING:
      return state.setIn(['countingAreas', action.payload.id, 'computed', 'lineBearings'], fromJS(action.payload.lineBearings));
    case SAVE_COUNTING_AREA_NAME:
      return state.setIn(['countingAreas', action.payload.id, 'name'], action.payload.name);
    case SAVE_COUNTING_AREA_TYPE:
      return state.setIn(['countingAreas', action.payload.id, 'type'], action.payload.type);
    default:
      return state;
  }
}

const counterSlice = createSlice({
  name: 'counter',
  initialState,
  reducers: {
    // Give case reducers meaningful past-tense "event"-style names
    countingAreasRestored(state, action) {
      state.countingAreas = action.payload;
    },
    updateCounterSummary(state, action) {
      state.counterSummary = action.payload;
    },
    updateTrackerSummary(state, action) {
      state.trackerSummary = action.payload;
    },
    setLastEditingMode(state, action) {
      state.lastEditingMode = action.payload;
    },
    counterModeSet(state, action) {
      state.mode = action.payload;
    },
    selectCountingArea(state, action) {
      console.debug({event: "selectCountingArea", action});
      state.selectedCountingArea = action.payload;
    },
    countingAreaAdded(state, action) {
      console.debug({event: "countingAreaAdded", action});
      state.countingAreas[action.payload.id] = {
        color: action.payload.color,
        type: action.payload.type,
      };
    },
    countingAreasDeleted(state, action) {
      delete state.countingAreas[action.payload];
    },
    countingAreaReset(state) {
      state.countingAreas = {};
    },
  },
});

// `createSlice` automatically generated action creators with these names.
// export them as named exports from this "slice" file
export const {
  countingAreasRestored,
  updateCounterSummary,
  updateTrackerSummary,
  setLastEditingMode,
  counterModeSet,
  selectCountingArea,
  countingAreaAdded,
  countingAreasDeleted,
  countingAreaReset,
} = counterSlice.actions;

// Export the slice reducer as the default export
export default counterSlice.reducer;

export function restoreCountingAreas() {
  return (dispatch) => new Promise((resolve, reject) => {
    axios({
      method: 'get',
      url: '/counter/areas',
    }).then((response) => {
      dispatch(countingAreasRestored(response.data));
      resolve();
    }, (error) => {
      reject(error);
    }).catch((error) => {
      reject(error);
    });
  });
}

export function restoreCountingAreasFromJSON(data) {
  return (dispatch) => {
    dispatch(restoreCountingAreas(data));
    dispatch(registerCountingAreasOnServer());
  };
}

export function setMode(mode) {
  return (dispatch, getState) => {
    // If leaving editing mode, store last editing mode for when we go back
    const isEditLine = getState().counter.mode === EDITOR_MODE.EDIT_LINE;
    const isEditPolygon = getState().counter.mode === EDITOR_MODE.EDIT_POLYGON;
    if (isEditLine || isEditPolygon) {
      // If new mode is also editing, store new mode
      if (mode === EDITOR_MODE.EDIT_LINE || mode === EDITOR_MODE.EDIT_POLYGON) {
        dispatch(setLastEditingMode(mode));
      } else {
        dispatch(setLastEditingMode(getState().counter.mode));
      }
    }

    dispatch(counterModeSet(mode));
  };
}
