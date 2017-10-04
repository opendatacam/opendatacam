import { combineReducers } from 'redux';
import objectTracker from './app/ObjectTrackerStateManagement';
import rawDetections from './app/RawDetectionsStateManagement';
import video from './app/VideoStateManagement';
import settings from './app/SettingsStateManagement';
import app from './app/AppStateManagement';

export default combineReducers({
  app,
  objectTracker,
  rawDetections,
  video,
  settings
});
