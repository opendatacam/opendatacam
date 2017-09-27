import { combineReducers } from 'redux';
import objectTracker from './app/ObjectTrackerStateManagement';
import rawDetections from './app/RawDetectionsStateManagement';
import video from './app/VideoStateManagement';
import settings from './app/SettingsStateManagement';

export default combineReducers({
  objectTracker,
  rawDetections,
  video,
  settings
});
