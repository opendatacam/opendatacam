import { combineReducers } from 'redux';
import objectTracker from './app/ObjectTrackerStateManagement';
import rawDetections from './app/RawDetectionsStateManagement';
import video from './app/VideoStateManagement';
import settings from './app/SettingsStateManagement';
import app from './app/AppStateManagement';
import game from './app/GameStateManagement';
import viewport from './app/ViewportStateManagement';

export default combineReducers({
  app,
  objectTracker,
  rawDetections,
  video,
  settings,
  game,
  viewport
});
