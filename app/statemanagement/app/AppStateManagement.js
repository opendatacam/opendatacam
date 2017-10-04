import { fromJS } from 'immutable';
import axios from 'axios';

import { fetchRawDetections } from './RawDetectionsStateManagement';
import { fetchObjectTracker } from './ObjectTrackerStateManagement';
import { setVideoSrc } from './VideoStateManagement';

// Initial state
const initialState = fromJS({
  availableVideos: [{
      name: "1_prototype_video",
      vimeoId: "235911346",
      sources: {
        hd: "https://player.vimeo.com/external/235911346.hd.mp4?s=079f01de35d181dbef705e7ec51da623b2f78de3"
      }
    },{
      name: "2_prototype_video",
      vimeoId: "236716453",
      sources: {
        hd: "https://player.vimeo.com/external/236716453.hd.mp4?s=e04a63be206412806f3c615a5d06b596e9774547"
      }
    }
  ],
  selectedVideo: "1_prototype_video"
});

// Actions
const SELECT_VIDEO = 'App/SELECT_VIDEO'

export function getRawDetectionPath(videoName, vimeoId) {
  return `/static/detections/${videoName}/${vimeoId}_rawdetections.txt`;
}

export function getTrackerDataPath(videoName, vimeoId) {
  return `/static/detections/${videoName}/${vimeoId}_tracker.json`;
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
