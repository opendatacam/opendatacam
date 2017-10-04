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
    },{
      name: "3_prototype_video",
      vimeoId: "236435165",
      sources: {
        hd: "https://player.vimeo.com/external/236435165.hd.mp4?s=a7bd82eb7f057f3236bc15de3429b310af93731d&profile_id=174"
      }
    },{
      name: "4_prototype_video",
      vimeoId: "236435268",
      sources: {
        hd: "https://player.vimeo.com/external/236435268.hd.mp4?s=39665614d2c8959038702854cdd90d3a4f65a3a8&profile_id=174"
      }
    },
    {
      name: "5_prototype_video",
      vimeoId: "236435345",
      sources: {
        hd: "https://player.vimeo.com/external/236435345.hd.mp4?s=df68f13a9098e51ef4b8b4e02ce84e34c0499ff7&profile_id=174"
      }
    },
    {
      name: "6_prototype_video",
      vimeoId: "236435387",
      sources: {
        hd: "https://player.vimeo.com/external/236435387.hd.mp4?s=3624aca3a9dbda98fe6bfd83fa54c2ffe1a187c9&profile_id=174"
      }
    },
    {
      name: "7_prototype_video",
      vimeoId: "236435419",
      sources: {
        hd: "https://player.vimeo.com/external/236435419.hd.mp4?s=dea1bb8ee4bd1809c2db7d7c1d5660922f98b3bb&profile_id=174"
      }
    },{
      name: "8_prototype_video",
      vimeoId: "236435464",
      sources: {
        hd: "https://player.vimeo.com/external/236435464.hd.mp4?s=48186cbe28b6570b0d703c778cec4bac4ceea29b&profile_id=174"
      }
    },{
      name: "9_prototype_video",
      vimeoId: "236435506",
      sources: {
        hd: "https://player.vimeo.com/external/236435506.hd.mp4?s=9b9e27c34d96c6704fccb5c109b3badaaf86f7d8&profile_id=174"
      }
    }
  ],
  selectedVideo: "1_prototype_video"
});

// Actions
const SELECT_VIDEO = 'App/SELECT_VIDEO'

export function getRawDetectionPath(videoName) {
  return `/static/detections/${videoName}/rawdetections.txt`;
}

export function getTrackerDataPath(videoName) {
  return `/static/detections/${videoName}/tracker.json`;
}

export function getAverageImgPath(videoName) {
  return `/static/detections/${videoName}/average-1280.jpg`;
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
