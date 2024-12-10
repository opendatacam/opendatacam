// Allow console output
/* eslint no-console: "off" */

const cloneDeep = require('lodash.clonedeep');
const fs = require('fs');
const path = require('path');
const http = require('http');
const { promisify } = require('util');
const { once } = require('events');
const stream = require('stream');
const StreamArray = require('stream-json/streamers/StreamArray');
const isInsidePolygon = require('point-in-polygon');
const { EventEmitter } = require('events');
const { Recording } = require('./model/Recording');
const Logger = require('./utils/Logger');
const configHelper = require('./utils/configHelper');
const { checkLineIntersection } = require('./tracker/utils');
const { computeLineBearing } = require('./tracker/utils');

const pipeline = promisify(stream.pipeline);

// YOLO process max retries
const HTTP_REQUEST_LISTEN_TO_YOLO_RETRY_DELAY_MS = 30;
// Max wait time for YOLO to start is 3 min = 180s
const HTTP_REQUEST_LISTEN_TO_YOLO_MAX_RETRIES = 180 * (1000 / HTTP_REQUEST_LISTEN_TO_YOLO_RETRY_DELAY_MS); // eslint-disable-line

// How long should we keep a rolling buffer of the current counting
// need to be capped otherwise can lead to a big memory leak after a few days
const COUNTING_BUFFER_MAX_FRAMES_MEMORY = 10000;

const COUNTING_AREA_TYPE = {
  BIDIRECTIONAL: 'bidirectional',
  LEFTRIGHT_TOPBOTTOM: 'leftright_topbottom',
  RIGHTLEFT_BOTTOMTOP: 'rightleft_bottomtop',
  ZONE: 'polygon',
};

const COUNTING_DIRECTION = {
  LEFTRIGHT_TOPBOTTOM: 'leftright_topbottom',
  RIGHTLEFT_BOTTOMTOP: 'rightleft_bottomtop',
  ENTERING_ZONE: 'entering_zone',
  LEAVING_ZONE: 'leaving_zone',
};

const initialState = {
  timeLastFrameFPSComputed: new Date(),
  indexLastFrameFPSComputed: 0,
  currentFrame: 0,
  /**
   * The counter summary for all currently configured areas.
   *
   * Example for a single area counting cars
   *
   * {
   *     'cc8354b6-d8ec-41d3-ab12-38ced6811f7c': {
   *         _total: 41,
   *         car: 41,
   *     },
   * }
  */
  counterSummary: {},
  counterBuffer: {},
  videoResolution: null,
  countingAreas: {},
  trackerDataForLastFrame: null,
  trackerDataBuffer: [],
  nbItemsTrackedThisFrame: 0,
  totalItemsTracked: 0,
  _refTrackedItemIdWhenRecordingStarted: 0,
  sseResponses: new Set(),
  // Can be true, false or `null` if unknown
  isSseConnectionOpen: null,
  recordingStatus: {
    requestedFileRecording: false,
    isRecording: false,
    currentFPS: 0,
    recordingId: null,
    dateStarted: null,
    filename: '',
  },
  uiSettings: {
    counterEnabled: true,
    pathfinderEnabled: true,
    heatmapEnabled: false,
  },
  isListeningToYOLO: false,
  HTTPRequestListeningToYOLO: null,
  HTTPRequestListeningToYOLOMaxRetries: HTTP_REQUEST_LISTEN_TO_YOLO_MAX_RETRIES,
  tracker: null,
  // A reference of the yolo object to work with
  yolo: null,
  /** The event emitter used for all events */
  eventEmitter: new EventEmitter(),
  /** A reference to the database used to persist Opendatacam's recordings and settings */
  database: null,
  /** A reference to the config object to be used */
  config: null,
};

let Opendatacam = cloneDeep(initialState);

module.exports = {

  reset() {
    return new Promise((resolve, reject) => {
      // We only want to reset the tracker, not delete it entirely so keep a
      // reference that we can restore.
      const trackerBackup = Opendatacam.tracker;
      trackerBackup.reset();

      // Keep the eventEmitter to not lose subscriptions.
      const emitterBackup = Opendatacam.eventEmitter;

      // Reset counter
      Opendatacam = cloneDeep(initialState);
      // Restore reference to the reseted tracker and event emitter
      Opendatacam.tracker = trackerBackup;
      Opendatacam.eventEmitter = emitterBackup;
    });
  },

  /*
    Example countingAreas
    {
      yellow: {
        point1: { x: 35.05624790519486, y: 69.33333587646484 },
        point2: { x: 111.38124638170021, y: 27.11111068725586 }
      },
      turquoise: null
    }
  */
  registerCountingAreas(countingAreas) {
    // Reset existing
    Opendatacam.countingAreas = {};
    if (Opendatacam.database !== null) {
      Opendatacam.database.persistAppSettings({
        countingAreas,
      });
    }
    Object.keys(countingAreas).map((countingAreaKey) => {
      if (countingAreas[countingAreaKey]) {
        this.registerSingleCountingArea(countingAreaKey, countingAreas[countingAreaKey]);
        // Set each counting area to 0
        Opendatacam.counterSummary[countingAreaKey] = { _total: 0 };
      }
    });
  },

  registerSingleCountingArea(key, data) {
    // Remap coordinates to image reference size
    // The editor canvas can be smaller / bigger

    // NOTE: We need to invert the Y coordinates to be in a classic Cartesian coordinate system
    // The coordinates in inputs are from the canvas coordinates system
    const points = data.location.points.map((point) => ({
      x: point.x * Opendatacam.videoResolution.w / data.location.refResolution.w,
      y: -(point.y * Opendatacam.videoResolution.h / data.location.refResolution.h),
    }));

    // Compute bearing
    const lineBearing = computeLineBearing(points[0].x, points[0].y, points[1].x, points[1].y);
    // in both directions
    const lineBearings = [0, 0];
    if (lineBearing >= 180) {
      lineBearings[0] = lineBearing - 180;
      lineBearings[1] = lineBearing;
    } else {
      lineBearings[0] = lineBearing;
      lineBearings[1] = lineBearing + 180;
    }

    Opendatacam.countingAreas[key] = data;

    Opendatacam.countingAreas[key].computed = {
      lineBearings,
      point1: {
        x: points[0].x,
        y: points[0].y,
      },
      point2: {
        x: points[1].x,
        y: points[1].y,
      },
      points,
    };
  },

  countItem(trackedItem, countingAreaKey, frameId, countingDirection, angleWithCountingLine) {
    if (Opendatacam.recordingStatus.isRecording) {
      var countedItem = {
        frameId,
        timestamp: new Date(),
        area: countingAreaKey,
        name: trackedItem.name,
        id: trackedItem.id,
        bearing: trackedItem.bearing,
        countingDirection,
        angleWithCountingLine,
      };

      // Persist GPS Position and timestamp if available
      const hasLat = 'lat' in trackedItem;
      const hasLon = 'lon' in trackedItem;
      if (hasLat && hasLon) {
        countedItem.lat = trackedItem.lat;
        countedItem.lon = trackedItem.lon;
      }
      if ('gpsTimestamp' in trackedItem) {
        countedItem.gpsTimestamp = trackedItem.gpsTimestamp;
      }

      // Add it to the summary
      if (countedItem.countingDirection !== COUNTING_DIRECTION.LEAVING_ZONE) {
        if (!Opendatacam.counterSummary[countedItem.area][countedItem.name]) {
          Opendatacam.counterSummary[countedItem.area][countedItem.name] = 1;
        } else {
          Opendatacam.counterSummary[countedItem.area][countedItem.name] += 1;
        }
        Opendatacam.counterSummary[countedItem.area]._total++;
      }
    }
    if (countingDirection !== COUNTING_DIRECTION.LEAVING_ZONE) {
      // Mark tracked item as counted this frame for display
      trackedItem.counted.push({
        areaKey: countingAreaKey,
        timeMs: new Date().getTime(),
      });
    }

    return countedItem;
  },

  /* Persist in DB */
  persistNewRecordingFrame(
    frameId,
    frameTimestamp,
    counterSummary,
    trackerSummary,
    countedItemsForThisFrame,
    trackerDataForThisFrame,
  ) {
    const trackerEntry = {
      recordingId: Opendatacam.recordingStatus.recordingId,
      frameId,
      timestamp: frameTimestamp,
      objects: trackerDataForThisFrame.map((trackerData) => ({
        id: trackerData.id,
        x: Math.round(trackerData.x),
        y: Math.round(trackerData.y),
        w: Math.round(trackerData.w),
        h: Math.round(trackerData.h),
        bearing: Math.round(trackerData.bearing),
        confidence: Math.round(trackerData.confidence * 100),
        name: trackerData.name,
        areas: trackerData.areas,
      })),
    };
    if (Opendatacam.database !== null) {
      Opendatacam.database.updateRecordingWithNewframe(
        Opendatacam.recordingStatus.recordingId,
        frameTimestamp,
        // We pass a clone of the counter summary, becausee passing a summary is vulnerable to
        // race conditioons, as in rare cases (e.g. end of recording), the summary may get reset
        // before the DbManager has a chance to persist it.
        cloneDeep(counterSummary),
        trackerSummary,
        countedItemsForThisFrame,
        trackerEntry,
      ).then(() => {
        // console.log('success updateRecordingWithNewframe');
      }, (error) => {
        console.log(error);
        console.log('error updateRecordingWithNewframe');
      });
    }
  },

  updateWithNewFrame(detectionsOfThisFrame, frameId) {
    // Set yolo status to started if it's not the case
    if (!Opendatacam.isListeningToYOLO) {
      Opendatacam.isListeningToYOLO = true;
      Opendatacam.HTTPRequestListeningToYOLOMaxRetries = initialState.HTTPRequestListeningToYOLOMaxRetries; // eslint-disable-line
      // Start recording depending on the previous flag
      if (this.isFileRecordingRequested()) {
        this.startRecording(true);
        Opendatacam.recordingStatus.requestedFileRecording = false;
      }
    }

    // If we didn't get the videoResolution yet
    if (!Opendatacam.videoResolution) {
      console.log('Didn\'t get video resolution yet, not sending tracker info');
      return;
    }

    // Compute FPS
    const frameTimestamp = new Date();
    if (Opendatacam.indexLastFrameFPSComputed + 3 <= frameId) {
      const timeDiff = Math.abs(frameTimestamp.getTime() - Opendatacam.timeLastFrameFPSComputed.getTime()); // eslint-disable-line
      const frameDiff = frameId - Opendatacam.indexLastFrameFPSComputed;
      // console.log(`YOLO detections FPS: ${1000 / timeDiff}`);
      Opendatacam.recordingStatus.currentFPS = Math.round(1000 / timeDiff * frameDiff);
      Opendatacam.timeLastFrameFPSComputed = frameTimestamp;
      Opendatacam.indexLastFrameFPSComputed = frameId;
    }

    // Scale detection
    let detectionScaledOfThisFrame = detectionsOfThisFrame.map((detection) => ({
      name: detection.name,
      x: detection.relative_coordinates.center_x * Opendatacam.videoResolution.w,
      y: detection.relative_coordinates.center_y * Opendatacam.videoResolution.h,
      w: detection.relative_coordinates.width * Opendatacam.videoResolution.w,
      h: detection.relative_coordinates.height * Opendatacam.videoResolution.h,
      counted: false,
      confidence: detection.confidence,
    }));

    // If VALID_CLASSES if set, we should keep only those and filter out the rest
    if (Opendatacam.config.VALID_CLASSES && Opendatacam.config.VALID_CLASSES.indexOf('*') === -1) {
      detectionScaledOfThisFrame = detectionScaledOfThisFrame.filter(
        (detection) => Opendatacam.config.VALID_CLASSES.indexOf(detection.name) > -1,
      );
    }

    // If confidence_threshold is set, we should keep only those and filter out the rest
    const trackerSettings = Opendatacam.config.TRACKER_SETTINGS;
    if (trackerSettings && trackerSettings.confidence_threshold) {
      detectionScaledOfThisFrame = detectionScaledOfThisFrame.filter(
        (detection) => detection.confidence >= trackerSettings.confidence_threshold,
      );
    }

    // If objectMaxAreaInPercentageOfFrame is set, we should filter out detection that are too large
    if (trackerSettings && trackerSettings.objectMaxAreaInPercentageOfFrame) {
      detectionScaledOfThisFrame = detectionScaledOfThisFrame.filter((detection) => {
        const detectionArea = (detection.w * detection.h);
        const screenArea = (Opendatacam.videoResolution.w * Opendatacam.videoResolution.h);
        const maxAreaScale = (trackerSettings.objectMaxAreaInPercentageOfFrame / 100);
        return detectionArea <= screenArea * maxAreaScale;
      });
    }

    // console.log(`Received Detection:`);
    // console.log('=========');
    // console.log(JSON.stringify(detectionScaledOfThisFrame));
    // console.log('=========');
    // console.log('Update tracker with this frame')
    // console.log(`Frame id: ${Opendatacam.currentFrame}`);
    // console.log('=========')

    Opendatacam.tracker.updateTrackedItemsWithNewFrame(detectionScaledOfThisFrame,
      Opendatacam.currentFrame);

    let trackerDataForThisFrame = Opendatacam.tracker.getJSONOfTrackedItems();
    let countedItemsForThisFrame = [];

    Opendatacam.nbItemsTrackedThisFrame = trackerDataForThisFrame.length;

    // Compute nbItemsTrackedSinceRecordingStarted based on ids (assume that id increment is one)
    if (trackerDataForThisFrame.length > 0) {
      const maxId = trackerDataForThisFrame[trackerDataForThisFrame.length - 1].id;
      const nbItemsTrackedSinceStart = maxId - Opendatacam._refTrackedItemIdWhenRecordingStarted;
      Opendatacam.totalItemsTracked = nbItemsTrackedSinceStart;
    }

    const countingData = this.runCountingLogic(trackerDataForThisFrame, frameId);
    trackerDataForThisFrame = countingData.trackerDataForThisFrame;
    countedItemsForThisFrame = countingData.countedItemsForThisFrame;
    // console.log('Tracker data');
    // console.log('=========')
    // console.log(JSON.stringify(trackerDataForThisFrame));
    // console.log('=========')

    // Increment frame number
    Opendatacam.currentFrame++;

    // Remember trackerData for last frame
    Opendatacam.trackerDataForLastFrame = {
      frameIndex: Opendatacam.currentFrame - 1,
      data: trackerDataForThisFrame,
    };

    const counterSummary = this.getCounterSummary();
    const trackerSummary = this.getTrackerSummary();

    // console.log(Opendatacam.zombiesAreas);

    // Persist to db
    if (Opendatacam.recordingStatus.isRecording) {
      // Only record from frame 25 for files, we can't be sure darknet has hooked to opendatacam
      // before
      if (Opendatacam.recordingStatus.filename.length > 0 && frameId < 25) {
        // console.log('do not persist yet for file, wait for frameId 25')
        // console.log(frameId);
      } else {
        // and send bad JSON objects
        this.persistNewRecordingFrame(
          frameId,
          frameTimestamp,
          counterSummary,
          trackerSummary,
          countedItemsForThisFrame,
          trackerDataForThisFrame,
        );
      }
    }

    this.sendUpdateToClients();

    if (countedItemsForThisFrame.length > 0 && countedItemsForThisFrame[0] != undefined) {
      Opendatacam.eventEmitter.emit('count', countedItemsForThisFrame, frameId);
    }
    if (trackerDataForThisFrame.length > 0) {
      Opendatacam.eventEmitter.emit('track', trackerDataForThisFrame, frameId);
    }
  },

  runCountingLogic(trackerDataForThisFrame, frameId) {
    const countedItemsForThisFrame = [];
    const counterSettings = Opendatacam.config.COUNTER_SETTINGS;
    let NBFRAME_TO_BUFFER_FOR_COUNTER = 2;
    if (counterSettings && counterSettings.computeTrajectoryBasedOnNbOfPastFrame) {
      NBFRAME_TO_BUFFER_FOR_COUNTER = counterSettings.computeTrajectoryBasedOnNbOfPastFrame;
    }

    let MIN_ANGLE_THRESHOLD = 0;
    if (counterSettings && counterSettings.minAngleWithCountingLineThreshold) {
      MIN_ANGLE_THRESHOLD = counterSettings.minAngleWithCountingLineThreshold;
    }

    let COUNTING_AREA_MIN_FRAMES_INSIDE = 1;
    if (counterSettings && counterSettings.countingAreaMinFramesInsideToBeCounted) {
      COUNTING_AREA_MIN_FRAMES_INSIDE = counterSettings.countingAreaMinFramesInsideToBeCounted;
    }

    let COUNTING_AREA_VERIFY_IF_OBJECT_ENTERS_CROSSING_ONE_EDGE = true;
    if (counterSettings && counterSettings.countingAreaVerifyIfObjectEntersCrossingOneEdge !== undefined) {
      COUNTING_AREA_VERIFY_IF_OBJECT_ENTERS_CROSSING_ONE_EDGE = counterSettings.countingAreaVerifyIfObjectEntersCrossingOneEdge;
    }

    // Populate trackerDataBuffer
    if (Opendatacam.trackerDataBuffer.length > NBFRAME_TO_BUFFER_FOR_COUNTER) {
      // Remove first element (oldest) to keep buffer at max size
      Opendatacam.trackerDataBuffer.shift();
    }
    Opendatacam.trackerDataBuffer.push(trackerDataForThisFrame);
    // console.log(`Trackerdata buffer length:  ${Opendatacam.trackerDataBuffer.length}`)

    // Keep counterBuffer under COUNTING_BUFFER_MAX_FRAMES_MEMORY
    if (Object.keys(Opendatacam.counterBuffer).length > COUNTING_BUFFER_MAX_FRAMES_MEMORY) {
      delete Opendatacam.counterBuffer[Object.keys(Opendatacam.counterBuffer)[0]];
    }

    // Check if trackedItems are matching with some counting areas
    trackerDataForThisFrame = trackerDataForThisFrame.map((trackedItem) => {
      // If trackerDataForLastFrame exists
      if (Opendatacam.trackerDataForLastFrame) {
        // Build history of the past buffered frame for this object
        // Counting algo reasons based on the same item one or a few frame ago if exist to avoid
        // jump in trajectories it is the same item id in the interval
        // max["1" - "computeTrajectoryBasedOnNbOfPastFrame"] frame ago
        const trackedItemHistoryForPastBufferedFrame = [];
        for (let i = Opendatacam.trackerDataBuffer.length - 1; i >= 0; i--) {
          const trackedItemDataForThisBufferedFrame = Opendatacam.trackerDataBuffer[i].find(
            (itemLastFrame) => itemLastFrame.id === trackedItem.id,
          );
          if (!trackedItemDataForThisBufferedFrame) {
            break;
          } else {
            trackedItemHistoryForPastBufferedFrame.push(trackedItemDataForThisBufferedFrame);
          }
        }

        // Take Oldest item (max("1";"computeTrajectoryBasedOnNbOfPastFrame") buffered frame ago)
        const sameTrackedItemInPastFrame = trackedItemHistoryForPastBufferedFrame[trackedItemHistoryForPastBufferedFrame.length - 1];
        // Item in last frame
        const sameTrackedItemInLastFrame = Opendatacam.trackerDataForLastFrame.data.find(
          (itemLastFrame) => itemLastFrame.id === trackedItem.id,
        );

        // Remind counted status (could be already counted for another area but not this one)
        if (sameTrackedItemInLastFrame && sameTrackedItemInLastFrame.counted) {
          trackedItem.counted = sameTrackedItemInLastFrame.counted;
        } else {
          // init setup an empty counting history
          trackedItem.counted = [];
        }

        // Init empty area for this frame
        trackedItem.areas = [];

        // For each counting areas
        Object.keys(Opendatacam.countingAreas).map((countingAreaKey) => {
          const countingAreaProps = Opendatacam.countingAreas[countingAreaKey].computed;
          const countingAreaType = Opendatacam.countingAreas[countingAreaKey].type;

          // Check if it has been already counted
          let alreadyCountedForThisArea = false;
          if (trackedItem.counted.find((event) => event.areaKey === countingAreaKey)) {
            alreadyCountedForThisArea = true;
          }

          // For Polygon
          let isInsideZone = false;
          if (countingAreaType === COUNTING_AREA_TYPE.ZONE) {
            // Check if object is inside the zone
            isInsideZone = isInsidePolygon(
              [trackedItem.x, -trackedItem.y],
              countingAreaProps.points.map((point) => [point.x, point.y]),
            );

            if (isInsideZone) {
              // Mark object as inside this area for this frame
              // could be inside several zone at the same time
              trackedItem.areas.push(countingAreaKey);
            } else {
              // Look in the buffer if it was marked inside this zone previously
              if (Opendatacam.counterBuffer[trackedItem.id]
                && Opendatacam.counterBuffer[trackedItem.id][countingAreaKey]) {
                // if it was counted entering the zone, count it as leaving the zone
                // check this to avoid counting leaving events if the item was inside the zone
                // without having beeing counted
                if (alreadyCountedForThisArea) {
                  // Count it (mark it as leaving_zone)
                  const countedItem = this.countItem(
                    trackedItem,
                    countingAreaKey,
                    frameId,
                    COUNTING_DIRECTION.LEAVING_ZONE,
                    null,
                  );
                  countedItemsForThisFrame.push(countedItem);
                }
                // Remove from buffer
                delete Opendatacam.counterBuffer[trackedItem.id][countingAreaKey];
              }
            }
          }

          // Continue if object has not been counted for this area yet
          if (!alreadyCountedForThisArea) {
            if (sameTrackedItemInPastFrame) {
              // IF POLYGON and the object is inside the zone
              if (countingAreaType === COUNTING_AREA_TYPE.ZONE && isInsideZone) {
                // Add object to the buffer to make it countable if
                // countingAreaMinFramesInsideToBeCounted is defined
                if (Opendatacam.counterBuffer[trackedItem.id]
                  && Opendatacam.counterBuffer[trackedItem.id][countingAreaKey]) {
                  Opendatacam.counterBuffer[trackedItem.id][countingAreaKey].nbFramesInsideArea++;
                } else {
                  // init object counter buffer
                  if (!Opendatacam.counterBuffer[trackedItem.id]) {
                    Opendatacam.counterBuffer[trackedItem.id] = {};
                  }
                  Opendatacam.counterBuffer[trackedItem.id][countingAreaKey] = {
                    nbFramesInsideArea: 1,
                    trackedItemBeforeEnteringArea: sameTrackedItemInPastFrame,
                  };
                }

                // if we reached the countingAreaMinFramesInsideToBeCounted, see if we count the
                // object otherwise, wait another frame
                if (Opendatacam.counterBuffer[trackedItem.id][countingAreaKey].nbFramesInsideArea >= COUNTING_AREA_MIN_FRAMES_INSIDE) {
                  let doCountItem = false;
                  let intersectionWithPolygonEdge = null;
                  // Check if [trackedItemBeforeEnteringZone - trackedItem] crosses one of the edges of the polygon
                  if (COUNTING_AREA_VERIFY_IF_OBJECT_ENTERS_CROSSING_ONE_EDGE) {
                    for (let index = 0; index < countingAreaProps.points.length; index++) {
                      if (index > 0) {
                        const { trackedItemBeforeEnteringArea } = Opendatacam.counterBuffer[trackedItem.id][countingAreaKey];
                        intersectionWithPolygonEdge = checkLineIntersection(
                          countingAreaProps.points[index - 1].x,
                          countingAreaProps.points[index - 1].y,
                          countingAreaProps.points[index].x,
                          countingAreaProps.points[index].y,
                          trackedItemBeforeEnteringArea.x,
                          -trackedItemBeforeEnteringArea.y,
                          trackedItem.x,
                          -trackedItem.y,
                        );

                        if (intersectionWithPolygonEdge.onLine1
                          && intersectionWithPolygonEdge.onLine2) {
                          // Flag item to be counted
                          doCountItem = true;
                          break;
                        }
                      }
                    }
                  } else {
                    // Do not check if it comes from outside the polygon
                    doCountItem = true;
                  }

                  if (doCountItem) {
                    // Compute bearing
                    trackedItem.bearing = computeLineBearing(
                      sameTrackedItemInPastFrame.x,
                      -sameTrackedItemInPastFrame.y,
                      trackedItem.x,
                      -trackedItem.y,
                    );
                    // Count it
                    const countedItem = this.countItem(
                      trackedItem,
                      countingAreaKey,
                      frameId,
                      COUNTING_DIRECTION.ENTERING_ZONE,
                      null,
                    );
                    countedItemsForThisFrame.push(countedItem);
                  }
                }
              }

              // IF LINE, check if it crosses the counting line
              if (countingAreaType !== 'polygon') {
                const intersection = checkLineIntersection(
                  countingAreaProps.point1.x,
                  countingAreaProps.point1.y,
                  countingAreaProps.point2.x,
                  countingAreaProps.point2.y,
                  sameTrackedItemInPastFrame.x,
                  -sameTrackedItemInPastFrame.y,
                  trackedItem.x,
                  -trackedItem.y,
                );

                // To be counted, Object trajectory must intercept the counting line
                // -> on the counting line / edge
                // -> with an angle superior at the angle threshold (which is the smallest angle
                //    between object trajectory and counting line)
                if (intersection.onLine1
                  && intersection.onLine2
                  && intersection.angle >= MIN_ANGLE_THRESHOLD) {
                  // Compute bearing
                  trackedItem.bearing = computeLineBearing(
                    sameTrackedItemInPastFrame.x,
                    -sameTrackedItemInPastFrame.y,
                    trackedItem.x,
                    -trackedItem.y,
                  );
                  // Object comes from top to bottom or left to right of the counting line
                  if (countingAreaProps.lineBearings[0] <= trackedItem.bearing
                    && trackedItem.bearing <= countingAreaProps.lineBearings[1]) {
                    if (countingAreaType === COUNTING_AREA_TYPE.BIDIRECTIONAL
                      || countingAreaType === COUNTING_AREA_TYPE.LEFTRIGHT_TOPBOTTOM) {
                      const countedItem = this.countItem(
                        trackedItem,
                        countingAreaKey,
                        frameId,
                        COUNTING_DIRECTION.LEFTRIGHT_TOPBOTTOM,
                        intersection.angle,
                      );
                      countedItemsForThisFrame.push(countedItem);
                    }
                  } else {
                    // Object comes from bottom to top, or right to left of the counting lines
                    if (countingAreaType === COUNTING_AREA_TYPE.BIDIRECTIONAL
                      || countingAreaType === COUNTING_AREA_TYPE.RIGHTLEFT_BOTTOMTOP) {
                      const countedItem = this.countItem(
                        trackedItem,
                        countingAreaKey,
                        frameId,
                        COUNTING_DIRECTION.RIGHTLEFT_BOTTOMTOP,
                        intersection.angle,
                      );
                      countedItemsForThisFrame.push(countedItem);
                    }
                  }
                }
              }
            }
          }
        });
      }

      return {
        ...trackedItem,
      };
    });

    return {
      countedItemsForThisFrame,
      trackerDataForThisFrame,
    };
  },

  sendUpdateToClients() {
    const newValue = (Opendatacam.sseResponses.size > 0);
    if (Opendatacam.isSseConnectionOpen === null || Opendatacam.isSseConnectionOpen !== newValue) {
      // Log connection changes only once
      console.info(newValue
        ? 'SSE: Sending update to clients'
        : 'SSE: All clients disconnected, cannot send update');
    }
    Opendatacam.isSseConnectionOpen = newValue;

    if (!Opendatacam.sseResponses.size) return;

    const data = `data:${JSON.stringify({
      trackerDataForLastFrame: Opendatacam.trackerDataForLastFrame,
      counterSummary: this.getCounterSummary(),
      trackerSummary: this.getTrackerSummary(),
      videoResolution: Opendatacam.videoResolution,
      appState: {
        yoloStatus: Opendatacam.yolo ? Opendatacam.yolo.getStatus() : null,
        isListeningToYOLO: Opendatacam.isListeningToYOLO,
        recordingStatus: Opendatacam.recordingStatus,
      },
    })}\n\n`;
    Opendatacam.sseResponses.forEach((res) => res.sse(data));
  },

  getCounterSummary() {
    return Opendatacam.counterSummary;
  },

  getTrackerSummary() {
    return {
      totalItemsTracked: Opendatacam.totalItemsTracked,
    };
  },

  getCountingAreas() {
    return Opendatacam.countingAreas;
  },

  getTrackedItemsThisFrame() {
    return Opendatacam.trackerDataForLastFrame;
  },

  addStreamClient(res) {
    Opendatacam.sseResponses.add(res);
    res.on('close', () => Opendatacam.sseResponses.delete(res));
  },

  startRecording(isFile) {
    console.log('Start recording');
    Opendatacam.recordingStatus.isRecording = true;
    Opendatacam.recordingStatus.dateStarted = new Date();
    Opendatacam.totalItemsTracked = 0;

    let filename = '';
    const isYoloSet = Opendatacam.yolo;
    if (isFile && isYoloSet) {
      filename = Opendatacam.yolo.getVideoParams().split('/').pop();
    }
    Opendatacam.recordingStatus.filename = filename;

    // Store lowest ID of currently tracked item when start recording
    // to be able to compute nbObjectTracked
    const currentlyTrackedItems = Opendatacam.tracker.getJSONOfTrackedItems();
    let maxTrackerId = 0;
    if (currentlyTrackedItems.length > 0) {
      maxTrackerId = currentlyTrackedItems[currentlyTrackedItems.length - 1].id;
    }
    Opendatacam._refTrackedItemIdWhenRecordingStarted = maxTrackerId - currentlyTrackedItems.length;

    // Reset the counting areas
    Object.keys(Opendatacam.counterSummary).forEach((key) => {
      Opendatacam.counterSummary[key] = { _total: 0 };
    });

    // Persist recording
    const newRecording = new Recording(
      Opendatacam.recordingStatus.dateStarted,
      Opendatacam.recordingStatus.dateStarted,
      Opendatacam.countingAreas,
      Opendatacam.videoResolution,
      filename,
    );
    if (Opendatacam.database !== null) {
      Opendatacam.database.insertRecording(newRecording).then((recording) => {
        Opendatacam.recordingStatus.recordingId = newRecording.id;
      }, (error) => {
        console.log(error);
      });
    }
  },

  stopRecording() {
    console.log('Stop recording');
    // Reset counters
    Opendatacam.recordingStatus.isRecording = false;
    Opendatacam.counterBuffer = {};
    Object.keys(Opendatacam.counterSummary).forEach((key) => {
      Opendatacam.counterSummary[key] = { _total: 0 };
    });
  },

  setVideoResolution(videoResolution) {
    const self = this;
    console.log('setvideoresolution');
    Opendatacam.videoResolution = videoResolution;
    // Restore counting areas if defined
    if (Opendatacam.database !== null) {
      Opendatacam.database.getAppSettings().then((appSettings) => {
        if (appSettings && appSettings.countingAreas) {
          console.log('Restore counting areas');
          self.registerCountingAreas(appSettings.countingAreas);
        }
      });
    }
  },

  // Listen to 8070 for Tracker data detections
  listenToYOLO(yolo, urlData) {
    const isSameYoloIntance = Opendatacam.yolo === yolo;
    Opendatacam.yolo = yolo;

    if (Opendatacam.videoResolution == null) {
      const hasResolution = yolo.getVideoResolution().w > 0 && yolo.getVideoResolution().h > 0;
      if (hasResolution) {
        this.setVideoResolution(yolo.getVideoResolution());
      } else {
        // Avoid re-registering to Yolo on reconnects.
        if (!isSameYoloIntance) {
          yolo.once('videoresolution', (resolution) => {
            this.setVideoResolution(resolution);
          });
        }
      }
    }

    const self = this;
    // HTTPJSONSTREAM req
    if (Opendatacam.isListeningToYOLO) {
      // Already listening
      console.log('Already listening');
      return;
    }

    Logger.log('Send request to connect to YOLO JSON Stream');
    self.HTTPRequestListeningToYOLO = http.get(urlData);

    once(self.HTTPRequestListeningToYOLO, 'response').then(([res]) => {
      // re-emit request errors on response (so the pipeline fails, and we catch them)
      self.HTTPRequestListeningToYOLO.on('close', (e) => {
        onEnd();
      });
      self.HTTPRequestListeningToYOLO.on('error', (e) => {
        // When using a file or YOLO is restarting, reset to false and force an update to the UI so
        // an initializing screen is shown
        if (Opendatacam.isListeningToYOLO) {
          Opendatacam.isListeningToYOLO = false;
          this.sendUpdateToClients();
        }
        res.emit('error', e);
      });

      Logger.log(`statusCode: ${res.statusCode}`);
      res.once('data', () => console.log('Got first JSON chunk'));

      const parser = StreamArray.withParser();
      parser.on('data', ({ key, value }) => self.updateWithNewFrame(value.objects, value.frame_id));
      return pipeline(res, parser);
    }).then(onEnd, onError);

    function onEnd() {
      if (!Opendatacam.isListeningToYOLO) {
        // Counting stopped by user, keep yolo running
        return;
      }

      console.log('==== HTTP Stream closed by darknet, reset UI ====');
      console.log('==== If you are running on a file, it is restarting  because you reached the '
        + 'end ====');
      console.log('==== If you are running on a camera, it might have crashed for some reason and '
        + 'we are trying to restart ====');
      // YOLO process will auto-restart, so re-listen to it
      // reset retries counter
      Opendatacam.isListeningToYOLO = false;
      Opendatacam.HTTPRequestListeningToYOLOMaxRetries = HTTP_REQUEST_LISTEN_TO_YOLO_MAX_RETRIES;

      if (!Opendatacam.yolo.isLive()) {
        self.stopRecording();
      }
      self.sendUpdateToClients();
      self.listenToYOLO(Opendatacam.yolo, urlData);
    }

    function onError(e) {
      if (e.code !== 'ECONNREFUSED') console.debug(`YOLO stream error: ${e}`);

      // TODO Need a YOLO.isRunning()
      if (
        Opendatacam.isListeningToYOLO
        || Opendatacam.HTTPRequestListeningToYOLOMaxRetries <= 0
      ) {
        console.log('Too much retries, YOLO took more than 3 min to start, likely an error');
        return;
      }

      Logger.log(`Will retry in ${HTTP_REQUEST_LISTEN_TO_YOLO_RETRY_DELAY_MS} ms`);
      // Retry, YOLO might not have started server just yet
      setTimeout(() => {
        Logger.log(
          `Retry connect to YOLO - ${Opendatacam.HTTPRequestListeningToYOLOMaxRetries} attempts `
          + 'left',
        );
        self.listenToYOLO(Opendatacam.yolo, urlData);
        Opendatacam.HTTPRequestListeningToYOLOMaxRetries--;
      }, HTTP_REQUEST_LISTEN_TO_YOLO_RETRY_DELAY_MS);
    }
  },

  setUISettings(settings) {
    console.log('Save UI settings');
    console.log(JSON.stringify(settings));
    Opendatacam.uiSettings = settings;
  },

  getUISettings() {
    return Opendatacam.uiSettings;
  },

  isRecording() {
    return Opendatacam.recordingStatus.isRecording;
  },

  isFileRecordingRequested() {
    return Opendatacam.recordingStatus.requestedFileRecording;
  },

  requestFileRecording(YOLO) {
    Opendatacam.recordingStatus.requestedFileRecording = true;
    const filename = path.basename(YOLO.getVideoParams());
    Opendatacam.recordingStatus.filename = filename;
    console.log(`Ask YOLO to restart to record on a file ${filename}`);
    YOLO.restart();
  },

  getCurrentRecordingId() {
    return Opendatacam.recordingStatus.recordingId;
  },

  getStatus() {
    return {
      counterSummary: this.getCounterSummary(),
      trackerSummary: this.getTrackerSummary(),
      videoResolution: Opendatacam.videoResolution,
      appState: {
        yoloStatus: Opendatacam.yolo ? Opendatacam.yolo.getStatus() : undefined,
        isListeningToYOLO: Opendatacam.isListeningToYOLO,
        recordingStatus: Opendatacam.recordingStatus,
      },
    };
  },

  clean() {
    if (this.HTTPRequestListeningToYOLO) {
      this.HTTPRequestListeningToYOLO.destroy();
    }
  },

  setTracker(tracker) {
    Opendatacam.tracker = tracker;
  },

  setDatabase(db) {
    Opendatacam.database = db;
  },

  on(event, listener) {
    Opendatacam.eventEmitter.on(event, listener);
  },

  once(event, listener) {
    Opendatacam.eventEmitter.once(event, listener);
  },

  setConfig(config) {
    Opendatacam.config = config;
  },
};
