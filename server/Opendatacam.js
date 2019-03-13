const Tracker = require('node-moving-things-tracker').Tracker;
const YOLO = require('./processes/YOLO');
const isInsideSomeAreas = require('./tracker/utils').isInsideSomeAreas;
const cloneDeep = require('lodash.clonedeep');
const fs = require('fs');
const http = require('http');
const config = require('../config.json');
const Recording = require('./model/Recording');
const DBManager = require('./db/DBManager')


const initialState = {
  timeLastFrame: new Date(),
  currentFrame: 0,
  countedItemsHistory: [],
  image: {
    w: 1280,
    h: 720
  },
  countingAreas: {},
  trackerDataForLastFrame: null,
  nbItemsTrackedThisFrame: 0,
  totalItemsTracked: 0,
  sseConnexion: null,
  recordingStatus: {
    isRecording: false,
    currentFPS: 0,
    recordingId: null,
    dateStarted: null
  },
  HTTPRequestListeningToYOLO: null
}

let Opendatacam = cloneDeep(initialState);

module.exports = {

  // TODO Adapt this when working with multiple recording / multiple files
  reset: function() {
    return new Promise((resolve, reject) => {
      // Reset counter
      Opendatacam = cloneDeep(initialState);
      // Reset tracker (TODO here reset id of itemstracked)
      Tracker.reset();
      // Create empty trackerHistory.json file
      fs.open("./static/trackerHistory.json", "wx", function (err, fd) {
        // Add the array opening bracket
        fs.writeFile("./static/trackerHistory.json", "[\n{}", function(err) {});
      });
    })
    
  },

  /*
    Example countingAreas

    { 
      yellow: { point1: { x: 35.05624790519486, y: 69.33333587646484 }, point2: { x: 111.38124638170021, y: 27.11111068725586 } },
      turquoise: null 
    }
  */
  registerCountingAreas : function(countingAreas) {
    // Reset existing
    Opendatacam.countingAreas = {}
    Object.keys(countingAreas).map((countingAreaKey) => {
      if(countingAreas[countingAreaKey]) {
        this.registerSingleCountingArea(countingAreaKey, countingAreas[countingAreaKey]);
      }
    })
  },

  registerSingleCountingArea(key, data) {

    // Remap coordinates to image reference size
    // The editor canvas can be smaller / bigger
    let resizedData = {
      point1: {
        x: data.location.point1.x * Opendatacam.image.w / data.location.refResolution.w,
        y: data.location.point1.y * Opendatacam.image.h / data.location.refResolution.h,
      },
      point2: {
        x: data.location.point2.x * Opendatacam.image.w / data.location.refResolution.w,
        y: data.location.point2.y * Opendatacam.image.h / data.location.refResolution.h,
      }
    }

    // Determine the linear function for this counting area
    // Y = aX + b
    // -> a = dY / dX
    // -> b = Y1 - aX1
    // NOTE: We need to invert the Y coordinates to be in a classic Cartesian coordinate system
    // The coordinates in inputs are from the canvas coordinates system 

    let { point1, point2 } = resizedData;

    let a = (- point2.y + point1.y) / (point2.x - point1.x);
    let b = - point1.y - a * point1.x;
    // Store xBounds to determine if the point is "intersecting" the line on the drawn part
    let xBounds = {
      xMin: Math.min(point1.x, point2.x),
      xMax: Math.max(point1.x, point2.x)
    }

    Opendatacam.countingAreas[key] = data;

    Opendatacam.countingAreas[key]['computed'] = {
      a: a,
      b: b,
      xBounds: xBounds
    }
  },

  countItem: function(trackedItem, countingAreaKey) {
    if(Opendatacam.recordingStatus.isRecording) {
      var countedItem = {
        timestamp: new Date(),
        area: countingAreaKey,
        name: trackedItem.name,
        id: trackedItem.id
      }
      // Add it to the history
      Opendatacam.countedItemsHistory.push(countedItem)
    }
    // Mark tracked item as counted this frame for display
    trackedItem.counted = countingAreaKey;
    return countedItem;
  },

  /* Persist in DB */ 
  persistNewRecordingFrame: function(
    frameTimestamp,
    counterSummary,
    trackerSummary,
    countedItemsForThisFrame,
    trackerDataForThisFrame
  ) {
    
    const trackerEntry = {
      recordingId: Opendatacam.recordingStatus.recordingId,
      timestamp: frameTimestamp,
      objects: trackerDataForThisFrame.map((trackerData) => {
        return {
          id: trackerData.id,
          x: Math.round(trackerData.x),
          y: Math.round(trackerData.y),
          w: Math.round(trackerData.w),
          h: Math.round(trackerData.h),
          bearing: Math.round(trackerData.bearing),
          name: trackerData.name
        }
      })
    }

    DBManager.updateRecordingWithNewframe(
      Opendatacam.recordingStatus.recordingId,
      frameTimestamp,
      counterSummary,
      trackerSummary,
      countedItemsForThisFrame,
      trackerEntry
    ).then(() => {
      // console.log('success updateRecordingWithNewframe');
    }, (error) => {
      console.log(error);
      console.log('error updateRecordingWithNewframe');
    })
  },

  updateWithNewFrame: function(detectionsOfThisFrame) {
    // Set yolo to started if it's not the case
    if(!YOLO.getStatus().isStarted) {
      YOLO.setIsStarted();
    }

    // TODO when start recording, record the date

    // Compute FPS
    const frameTimestamp = new Date();
    const timeDiff = Math.abs(frameTimestamp.getTime() - Opendatacam.timeLastFrame.getTime());
    Opendatacam.timeLastFrame = frameTimestamp;
    // console.log(`YOLO detections FPS: ${1000 / timeDiff}`);
    Opendatacam.recordingStatus.currentFPS = Math.round(1000 / timeDiff)

    // Scale detection
    let detectionScaledOfThisFrame = detectionsOfThisFrame.map((detection) => {
      return {
        name: detection.name,
        x: detection.relative_coordinates.center_x * Opendatacam.image.w,
        y: detection.relative_coordinates.center_y * Opendatacam.image.h,
        w: detection.relative_coordinates.width * Opendatacam.image.w,
        h: detection.relative_coordinates.height * Opendatacam.image.h,
        counted: false,
        confidence: detection.confidence
      };
    });

    // If VALID_CLASSES if set, we should keep only those and filter out the rest
    if(config.VALID_CLASSES && config.VALID_CLASSES.indexOf("*") === -1) {
      detectionScaledOfThisFrame = detectionScaledOfThisFrame.filter((detection) => config.VALID_CLASSES.indexOf(detection.name) > -1)
      console.log(`Filtered out ${detectionsOfThisFrame.length - detectionScaledOfThisFrame.length} detections that weren't valid classes`)
    }

    // console.log(`Received Detection:`);
    // console.log('=========');
    // console.log(JSON.stringify(detectionScaledOfThisFrame));
    // console.log('=========');
    // console.log('Update tracker with this frame')
    // console.log(`Frame id: ${Opendatacam.currentFrame}`);
    // console.log('=========')

    // TODO UPDATE Tracker code to keep confidence score
     
    Tracker.updateTrackedItemsWithNewFrame(detectionScaledOfThisFrame, Opendatacam.currentFrame);

    let trackerDataForThisFrame = Tracker.getJSONOfTrackedItems();
    let countedItemsForThisFrame = [];

    Opendatacam.nbItemsTrackedThisFrame = trackerDataForThisFrame.length;

    // Compute deltaYs for all tracked items (between the counting lines and the tracked items position)
    // And check if trackedItem are going through some counting areas 
    // For each new tracked item
    trackerDataForThisFrame = trackerDataForThisFrame.map((trackedItem) => {
      // For each counting areas
      var countingDeltas = Object.keys(Opendatacam.countingAreas).map((countingAreaKey) => {
        let countingAreaProps = Opendatacam.countingAreas[countingAreaKey].computed;
        // deltaY = Y(detection) - Y(on-counting-line)
        // NB: negating Y detection to get it in "normal" coordinates space
        // deltaY = - Y(detection) - a X(detection) - b
        let deltaY = - trackedItem.y - countingAreaProps.a * trackedItem.x - countingAreaProps.b;

        // If trackerDataForLastFrame exists, we can if we items are passing through the counting line
        if(Opendatacam.trackerDataForLastFrame) {
          // Find trackerItem data of last frame
          let trackerItemLastFrame = Opendatacam.trackerDataForLastFrame.data.find((itemLastFrame) => itemLastFrame.id === trackedItem.id)
          // If trackedItemLastFrame exist and deltaY was computed last frame
          if(trackerItemLastFrame && trackerItemLastFrame.countingDeltas[countingAreaKey]) {
            let lastDeltaY = trackerItemLastFrame.countingDeltas[countingAreaKey]
            // Remind counted status
            if(trackerItemLastFrame.counted) {
              // console.log(`${trackerItemLastFrame.id} appear to have been counted on last frame`);
              trackedItem.counted = trackerItemLastFrame.counted;
            }

            if(Math.sign(lastDeltaY) !== Math.sign(deltaY)) {

              // Object trajectory must intersept the counting line between xBounds
              // We know it intersept between those two frames, check if they are
              // corresponding to the bounds
              let minX = Math.min(trackerItemLastFrame.x, trackedItem.x);
              let maxX = Math.max(trackerItemLastFrame.x, trackedItem.x);

              if(countingAreaProps.xBounds.xMin <= maxX && 
                countingAreaProps.xBounds.xMax >= minX) {

                // console.log("*****************************")
                // console.log("COUNTING SOMETHING")
                // console.log("*****************************")
                // // console.log(trackedItem);
  
                // Tracked item has cross the {countingAreaKey} counting line
                // Count it
                let countedItem = this.countItem(trackedItem, countingAreaKey);
                countedItemsForThisFrame.push(countedItem);
                // console.log(`Counting ${trackedItem.id}`);

              } else {
                // console.log('NOT IN xBOUNDS');
                // console.log(countingAreaProps.xBounds);
                // console.log(trackedItem)
              }

              
            }
          } else {
            // Newly tracked item, increment nbPath
            Opendatacam.totalItemsTracked++;
          }
        }

        return {
          countingAreaKey: countingAreaKey,
          deltaY: deltaY
        }

      });

      // Convert counting delta to a map
      var countingDeltaMap = {}
      
      countingDeltas.map((countingDelta) => {
        countingDeltaMap[countingDelta.countingAreaKey] = countingDelta.deltaY
      })

      return {
        ...trackedItem,
        countingDeltas: countingDeltaMap
      }
    })

    // console.log('Tracker data');
    // console.log('=========')
    // console.log(JSON.stringify(trackerDataForThisFrame));
    // console.log('=========')

    // Increment frame number
    Opendatacam.currentFrame++;

    // Remember trackerData for last frame
    Opendatacam.trackerDataForLastFrame = {
      frameIndex: Opendatacam.currentFrame - 1,
      data: trackerDataForThisFrame
    }

    let counterSummary = this.getCounterSummary();
    let trackerSummary = this.getTrackerSummary();

    // Persist to db
    if(Opendatacam.recordingStatus.isRecording) {
      this.persistNewRecordingFrame(
        frameTimestamp,
        counterSummary,
        trackerSummary,
        countedItemsForThisFrame,
        trackerDataForThisFrame
      );
    }
    // Stream it to client if SSE request is open
    if(Opendatacam.sseConnexion) {
      // console.log('sending message');
      // console.log(`send frame ${Opendatacam.trackerDataForLastFrame.frameIndex}`);
      // TODO add isRecording
      Opendatacam.sseConnexion(`data:${JSON.stringify({
        trackerDataForLastFrame: Opendatacam.trackerDataForLastFrame,
        counterSummary: counterSummary,
        trackerSummary: trackerSummary,
        appState: {
          yoloStatus: YOLO.getStatus(),
          recordingStatus: Opendatacam.recordingStatus
        }
      })}\n\n`);
    }
  },

  getCounterSummary: function() {

    // Generate dashboard from countingHistory
    // example
    // {
    //   "turquoise": {
    //     {
    //       car: 0,
    //       truck: 0,
    //       person: 0,
    //       bicycle: 0,
    //       motorbike: 0,
    //       bus: 0,
    //       _total: 0
    //     }
    //   }
    //   "blablal": {
    //   }
    // }

    var counterSummary = {};

    Opendatacam.countedItemsHistory.forEach((countedItem) => {
      if(!counterSummary[countedItem.area]) {
        counterSummary[countedItem.area] = {}
      }

      if(!counterSummary[countedItem.area][countedItem.name]) {
        counterSummary[countedItem.area][countedItem.name] = 1;
        counterSummary[countedItem.area]['_total'] = 1;
      } else {
        counterSummary[countedItem.area][countedItem.name]++;
        counterSummary[countedItem.area]['_total']++;
      }
    })

    return counterSummary;
  },

  getTrackerSummary: function() {
    return {
      totalItemsTracked: Opendatacam.totalItemsTracked
    }
  },

  getCounterHistory: function() {
    return Opendatacam.countedItemsHistory;
  },

  getCountingAreas: function() {
    return Opendatacam.countingAreas;
  },

  getTrackedItemsThisFrame: function() {
    return Opendatacam.trackerDataForLastFrame;
  },

  getTrackerData: function() {
    
    return new Promise((resolve, reject) => {
      // Copy current trackerHistory but keep the current file has we keep adding line to it
      fs.copyFile('./static/trackerHistory.json', './static/trackerHistoryExport.json', (err) => {
        if (err) throw err;
        // Make a valid json file by adding a closing bracket
        fs.appendFile('./static/trackerHistoryExport.json', `\n]`, function (err) {
          if (err) throw err;
          resolve();
        });
      });
      
    });
  },

  startStreamingData(sse) {
    Opendatacam.sseConnexion = sse;
  },

  startRecording() {
    console.log('Start recording');
    Opendatacam.recordingStatus.isRecording = true;
    Opendatacam.recordingStatus.dateStarted = new Date();
    Opendatacam.totalItemsTracked = 0;
    // Persist recording
    DBManager.insertRecording(new Recording(
      Opendatacam.recordingStatus.dateStarted, 
      Opendatacam.recordingStatus.dateStarted,
      Opendatacam.countingAreas
    )).then((recording) => {
      Opendatacam.recordingStatus.recordingId = recording.insertedId;
    }, (error) => {
      console.log(error);
    })
  },

  stopRecording() {
    console.log('Stop recording');
    // Reset counters
    Opendatacam.recordingStatus.isRecording = false;

    Opendatacam.countedItemsHistory = [];
    
    
  },

  // Listen to 8070 for Tracker data detections
  listenToYOLO(urlData) {
    var self = this;
    // HTTPJSONSTREAM req
    if(self.HTTPRequestListeningToYOLO) {
      // Already listening
      self.clean();
    }

    console.log(urlData.address);

    var options = {
      hostname: urlData.address,
      port:     8070,
      path:     '/',
      method:   'GET'
    };

    self.HTTPRequestListeningToYOLO = http.request(options, function(res) {
      res.on('data', function(chunk) {
        var msg = chunk.toString();
        // console.log('Message: ' + msg);
        try {
          var detectionsOfThisFrame = JSON.parse(msg);
          self.updateWithNewFrame(detectionsOfThisFrame.objects);
        } catch (error) {
          console.log("Error while updating Opendatacam with new frame")
          console.log(error);
          res.emit('close');
        }
      });

      res.on('close', () => {
        if(YOLO.getStatus().isStarted)  {
          console.log("==== HTTP Stream closed by darknet, reset UI, might be running from file and ended it or have troubles with webcam and need restart =====")
          YOLO.stop();
        } else {
          // Counting stopped by user, keep yolo running
        }
      });
    });

    self.HTTPRequestListeningToYOLO.on('error', function(e) {
      YOLO.stop();
      console.log('Something went wrong: ' + e.message);
    });

    // Actually send request
    self.HTTPRequestListeningToYOLO.end();
  },

  clean() {
    if(this.HTTPRequestListeningToYOLO) {
      this.HTTPRequestListeningToYOLO.destroy();
    }
  }
}
