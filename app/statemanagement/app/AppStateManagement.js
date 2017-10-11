import { fromJS } from 'immutable';
import axios from 'axios';

import { fetchRawDetections } from './RawDetectionsStateManagement';
import { fetchObjectTracker } from './ObjectTrackerStateManagement';
import { setVideoSrc } from './VideoStateManagement';
import { resetScore } from './GameStateManagement';

// Initial state
const initialState = fromJS({
  availableVideos: [{
      name: "1_prototype_video",
      level: 2,
      vimeoId: "235911346",
      originalResolution: {
        w: 1920,
        h: 1080
      },
      sources: {
        hd: "https://player.vimeo.com/external/235911346.hd.mp4?s=079f01de35d181dbef705e7ec51da623b2f78de3"
      }
    },{
      name: "level_1",
      level: 1,
      vimeoId: "237563941",
      originalResolution: {
        w: 1280,
        h: 720
      },
      sources: {
        // hd: "/static/detections/level_1/level_1.mp4",
        hd: "https://player.vimeo.com/external/237563941.hd.mp4?s=521162fbd4ba420ea6a2d04dcdf123c0a74a23e4"
      }
    }
  ],
  selectedVideo: "level_1"
});

// Actions
const SELECT_VIDEO = 'App/SELECT_VIDEO'

let pathStatic = '/static/detections';

export function getRawDetectionPath(videoName) {
  return `${pathStatic}/${videoName}/rawdetections.txt`;
}

export function getTrackerDataPath(videoName) {
  return `${pathStatic}/${videoName}/tracker.json`;
}

export function getAverageImgPath(videoName) {
  return `${pathStatic}/${videoName}/average-1280.jpg`;
}

export function selectDefaultVideo() {
  return (dispatch, getState) => {
    dispatch(selectVideo(getState().app.get('selectedVideo')));
  }
}

export function selectVideo(name) {
  return (dispatch, getState) => {
    return new Promise((resolve, reject) => {

      dispatch({
        type: SELECT_VIDEO,
        payload: name
      });

      const videoSelected = getState().app.get('availableVideos').find((video) => {
        return video.get('name') === name
      });

      // Set video src
      dispatch(setVideoSrc(videoSelected.getIn(['sources','hd'])));

      // Fetch detection and object tracking data
      dispatch(fetchRawDetections(getRawDetectionPath(videoSelected.get('name'), videoSelected.get('vimeoId'))));
      dispatch(fetchObjectTracker(getTrackerDataPath(videoSelected.get('name'), videoSelected.get('vimeoId'))));
    
      // Reset Score
      dispatch(resetScore());
    });
  }
}

// Reducer
export default function SettingsReducer(state = initialState, action = {}) {
  switch (action.type) {
    case SELECT_VIDEO:
      return state.set('selectedVideo', action.payload)
    default:
      return state;
  }
}
