const config = require('../../config.json');
const fs = require('fs');
const path = require('path');
const http = require('http');
const killable = require('killable');
const mjpegServer = require('mjpeg-server');
const configHelper = require('../utils/configHelper');
const { execFile, execFileSync } = require('child_process');
const { performance } = require('perf_hooks');
const { ignoreNullOrUndefined } = require('csv-express');
const { isBoolean } = require('util');

let simulationParams = {
  // State Information
  isStarting: false,
  isStarted: false,
  isInitialized: false,

  // Store the path of the JSON file and the video files including some
  // metadata on the FPS if possible
  currentVideoParams: "",
  yolo_json: null,
  video_file_or_folder: null,
  isVideoDirectory: null,
  videoFileOrFolderExists: false,
  videoFileFps: null,

  // Information for the Stream
  simulationMJPEGServer: null,
  simulationJSONHTTPStreamServer: null,
  jsonFps: 20,
  mjpgFps: 1.0 / 5, // One image every 5 seconds
  // If true, simulation will behave like a webcam and silently restart at the
  // end. If false, it behaves like a file and will cause the streams to
  // close and reopen
  isLive: true
};

const init = function (simulationMode, videoParams = null) {
  // XXX: paths in the config are relative from node root. So make sure we
  // normalize before the include
  const normalizePath = function (p) {
    if (!path.isAbsolute(p)) {
      return path.join(__dirname, '..', '..', p);
    }

    return p;
  }

  const getFpsForFile = function (file) {
    const args = '-v 0 -of csv=p=0 -select_streams v:0 -show_entries stream=r_frame_rate'.split(' ');
    args.push(file);

    const fpsProcOut = execFileSync('ffprobe', args, { encoding: 'utf-8' });
    const fpsParts = fpsProcOut.split('/');
    const fps = Number(fpsParts[0]) / Number(fpsParts[1]);
    console.debug(file + ' @ ' + fps + ' fps');
    return fps;
  }

  console.log('Process YOLO initialized');
  simulationParams.isInitialized = true;

  // Take the values form the config first and then normalize what you have
  // to.
  Object.keys(simulationParams).forEach((key) => {
    if (key in config.VIDEO_INPUTS_PARAMS.simulation) {
      simulationParams[key] = config.VIDEO_INPUTS_PARAMS.simulation[key];
    }
  });

  simulationParams.yolo_json = require(normalizePath(config.VIDEO_INPUTS_PARAMS.simulation.yolo_json));
  simulationParams.video_file_or_folder = normalizePath(config.VIDEO_INPUTS_PARAMS.simulation.file_or_folder);

  // We need this if the simulation should behave like a file recording
  simulationParams.currentVideoParams = normalizePath(config.VIDEO_INPUTS_PARAMS.simulation.yolo_json);

  // Check if the video source is a file and determine the fps
  try {
    simulationParams.isVideoDirectory = fs.lstatSync(simulationParams.video_file_or_folder).isDirectory();
    simulationParams.videoFileOrFolderExists = true;
  } catch (err) {
    console.warn('Could not open simulation video file or folder ' + simulationParams.video_file_or_folder);
    simulationParams.videoFileOrFolderExists = false;
  }
  if (simulationParams.videoFileOrFolderExists && !simulationParams.isVideoDirectory) {
    simulationParams.videoFileFps = getFpsForFile(simulationParams.video_file_or_folder);
  }
}

const isLive = function() {
    return simulationParams.isLive;
}

const getStatus = function () {
  return {
    isStarting: simulationParams.isStarting,
    isStarted: simulationParams.isStarted
  }
}

const getVideoParams = function () {
  return simulationParams.currentVideoParams;
}

const restart = function () {
  // Stop returns a promise. Once it is resolved we call start again
  stop().then(start);
}

const start = function () {
  // Do not start it twice
  if (simulationParams.isStarted || simulationParams.isStarting) {
    console.debug('already started');
    return;
  }

  simulationParams.isStarting = true;

  setTimeout(() => {
    // Simulate 5s to start yolo
    startYOLOSimulation(() => {
      // When the simulation is up and running come back here to update
      // the state
      simulationParams.isStarting = false;
      simulationParams.isStarted = true;
    });
  }, 5000);
}

const stop = function () {
  return new Promise((resolve, reject) => {
    simulationParams.simulationMJPEGServer.kill();
    simulationParams.simulationJSONHTTPStreamServer.kill();
    simulationParams.isStarted = false;
    resolve();
  });
}

const startYOLOSimulation = function (callback) {
  // Contains the state of the simulation e.g. open connections
  const simulationState = {
    JSONStreamRes: null,
    mjpegReqHandler: null,
    timer: null
  }

  console.debug("Start HTTP JSON Stream server");
  simulationParams.simulationJSONHTTPStreamServer = http.createServer(function (req, res) {
    console.debug("Got request on JSON Stream server started");
    simulationState.JSONStreamRes = res;
    simulationState.timer = startStream(simulationState);
  });
  simulationParams.simulationJSONHTTPStreamServer.on('close', (err, socket) => {
    console.debug('closing JSON');
    simulationState.JSONStreamRes = null;
    simulationState.mjpegReqHandler.close();
  });
  killable(simulationParams.simulationJSONHTTPStreamServer);
  simulationParams.simulationJSONHTTPStreamServer.listen(configHelper.getJsonStreamPort());

  console.debug("Start MJPEG server");
  simulationParams.simulationMJPEGServer = http.createServer(function (req, res) {
    console.debug("Got request on MJPEG server");
    simulationState.mjpegReqHandler = mjpegServer.createReqHandler(req, res);
  });
  simulationParams.simulationMJPEGServer.on('close', (err, socket) => {
    console.debug('closing MJGEG');
    clearInterval(simulationState.timer);
  });
  simulationParams.simulationMJPEGServer.listen(configHelper.getMjpegStreamPort());
  killable(simulationParams.simulationMJPEGServer);

  callback();
}

function startStream(simulationState) {
  var detectionsNb = 0;
  var isSendingJpeg = false;
  var lastJpegTimestamp = 0;
  const timer = setInterval(() => {
    let sendJPGData = function (err, data) {
      if (!err) {
        // The JPEG stream is opened after the JSON stream, so check for it
        // to be open before sending frames
        if (simulationState.mjpegReqHandler) {
          // simulationState.mjpegReqHandler.write(data, 'binary', () => {
          simulationState.mjpegReqHandler.write(data, 'binary', () => {
            // XXX: For some reson the picture still lags behin significantly.
            // Therefore give it some time to update the UI before we continue
            // with the stream
            setTimeout(() => {
              isSendingJpeg = false;
            }, 200);
          });
        }
      }
    }

    if (isSendingJpeg) {
      return;
    }

    if (detectionsNb >= simulationParams.yolo_json.length) {
      // We've went through all frames. So now check if we simulate a live
      // source or if we need to stop.
      if(isLive()) {
        restart();
        return;
      }
      detectionsNb = 0;
    }
    const detection = simulationParams.yolo_json[detectionsNb];

    // It could be that extracting the frame from a video file and
    // transmitting it, takes longer than for the callback to fire.
    // Therefore we need to some rate limiting.
    //
    // In this simple form we have a mutex to check if we are still
    // transmitting a frame.
    if (simulationParams.videoFileOrFolderExists && !isSendingJpeg) {
      if (simulationParams.isVideoDirectory) {
        isSendingJpeg = true;
        getJpgForFrameFromFolder(simulationParams.video_file_or_folder, detection.frame_id, sendJPGData);
      } else {
        // Additonally for File extraction we put in a 1s delay to give the CPU some rest.
        if (performance.now() - lastJpegTimestamp > (1000.0 / simulationParams.mjpgFps)) {
          isSendingJpeg = true;
          lastJpegTimestamp = performance.now();

          // Seeking is not exact and updating the stream takes some time as
          // well, therefore jump a few frames ahead
          const maxFrameId = simulationParams.yolo_json[simulationParams.yolo_json.length - 1].frame_id;
          var frame_id = detection.frame_id + Math.ceil(simulationParams.videoFileFps / 10);
          if (frame_id > maxFrameId) {
            frame_id = maxFrameId;
          }
          getJpgForFrameFromFile(simulationParams.video_file_or_folder, simulationParams.videoFileFps, frame_id, sendJPGData);
        }
      }
    }

    // Update Yolo as well
    sendYoloJson(simulationState.JSONStreamRes, simulationParams.yolo_json[detectionsNb]);

    // Move on to next detection
    detectionsNb++;
  }, 1000.0 / simulationParams.jsonFps);
  return timer;
}

/**
 * Writes the detecion of a single frame to the stream
 *
 * @param {*} stream The stream to write to
 * @param {*} detections The detecion object to write
 */
function sendYoloJson(stream, detections) {
  if (stream) {
    stream.write(JSON.stringify(detections));
  } else {
    console.warn("JSONStream connection isn't opened yet");
  }
}

function getJpgForFrameFromFolder(folder, frameNb, callback) {
  const frameFileName = String(frameNb).padStart(3, '0') + '.jpg';
  const filePath = path.join(folder, frameFileName);

  fs.access(filePath, fs.constants.R_OK, (err) => {
    if (!err) {
      fs.readFile(filePath, callback);
    } else {
      console.error('Could not open ' + filePath);
    }
  });
}

function getJpgForFrameFromFile(file, fps, frameNb, callback) {
  const seekPos = frameNb / fps;
  const args = ['-ss', seekPos, '-i', file, '-frames', 1, '-f', 'image2pipe', '-vcodec', 'mjpeg', '-'];

  execFile('ffmpeg', args, { encoding: 'binary' }, (error, stdout, stderr) => {
    if (error) {
      throw error;
    }

    callback(error, stdout);
  });
}

module.exports = {
  init: init,
  getStatus: getStatus,
  getVideoParams: getVideoParams,
  isLive: isLive,
  start: start,
  stop: stop,
  restart: restart
}
