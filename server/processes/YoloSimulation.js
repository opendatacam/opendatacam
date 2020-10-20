const fs = require('fs');
const path = require('path');
const http = require('http');
const killable = require('killable');
const mjpegServer = require('mjpeg-server');
const { execFile, execFileSync } = require('child_process');
const { performance } = require('perf_hooks');
const { YoloDarknet } = require('./YoloDarknet');

class YoloSimulation extends YoloDarknet {
  config = {
    videoParams: {
      yolo_json: null,
      video_file_or_folder: null,
      // If true, simulation will behave like a webcam and silently restart at
      // the end. If false, it behaves like a file and will cause the streams
      // to close and reopen.
      isLive: true,
      jsonFps: 20,
      mjpgFps: 1.0 / 5, // One image every 5 seconds
    },
    jsonStreamPort: 8070,
    mjpegStreamPort: 8090,
  };

  // Store the path of the JSON file and the video files including some
  // metadata on the FPS if possible
  isVideoDirectory = null;
  videoFileOrFolderExists = false;
  videoFileFps = null;
  detections = null;

  // Information for the Stream
  simulationMJPEGServe = null;
  simulationJSONHTTPStreamServer = null;

  constructor(config) {
    super();

    // Take the values form the config first and then normalize what you have to.
    YoloSimulation.copyConfig(this.config, config);
    this.config.videoParams.yolo_json = YoloSimulation.normalizePath(config.videoParams.yolo_json);
    this.config.videoParams.video_file_or_folder = YoloSimulation.normalizePath(config.videoParams.video_file_or_folder);
    this.detections = require(this.config.videoParams.yolo_json);


    // Check if the video source is a file and determine the fps
    try {
      this.isVideoDirectory = fs.lstatSync(this.config.videoParams.video_file_or_folder).isDirectory();
      this.videoFileOrFolderExists = true;
    } catch (err) {
      console.warn('Could not open simulation video file or folder ' + this.config.videoParams.video_file_or_folder);
      this.videoFileOrFolderExists = false;
    }
    if (this.videoFileOrFolderExists && !this.isVideoDirectory) {
      this.videoFileFps = YoloSimulation.getFpsForFile(this.config.videoParams.video_file_or_folder);
    }

    // Fix Video Resolution
    // TODO: Determine resolution from video or jpg files.
    this.videoResolution.w = 1280;
    this.videoResolution.h = 720;

    console.log('Process YOLO initialized');
    this.isInitialized = true;
    console.debug(this);
  }

  static normalizePath(p) {
    // XXX: paths in the config are relative from node root. So make sure we
    // normalize before the include
    if (!path.isAbsolute(p)) {
      return path.join(__dirname, '..', '..', p);
    }

    return p;
  }

  static getFpsForFile(file) {
    const args = '-v 0 -of csv=p=0 -select_streams v:0 -show_entries stream=r_frame_rate'.split(' ');
    args.push(file);

    const fpsProcOut = execFileSync('ffprobe', args, { encoding: 'utf-8' });
    const fpsParts = fpsProcOut.split('/');
    const fps = Number(fpsParts[0]) / Number(fpsParts[1]);
    console.debug(file + ' @ ' + fps + ' fps');
    return fps;
  }

  static copyConfig(target, newConfig) {
    Object.keys(target).forEach((key) => {
      if (key in newConfig) {
        const isObject = target[key] !== null && typeof target[key] === 'object';
        if (isObject) {
          YoloSimulation.copyConfig(target[key], newConfig[key]);
        } else {
          target[key] = newConfig[key];
        }
      }
    });
  }

  isLive() {
    return this.config.videoParams.isLive;
  }

  getVideoParams() {
    return this.config.videoParams.yolo_json;
  }

  start() {
    // Do not start it twice
    if (this.isStarted || this.isStarting) {
      console.debug('already started');
      return;
    }

    this.isStarting = true;

    setTimeout(() => {
      // Simulate 5s to start yolo
      this.startYOLOSimulation(() => {
        // When the simulation is up and running come back here to update
        // the state
        this.isStarting = false;
        this.isStarted = true;
      });
    }, 5000);
  }

  stop() {
    return new Promise((resolve, reject) => {
      if (this.simulationMJPEGServer) {
        this.simulationMJPEGServer.kill();
      }
      if (this.simulationJSONHTTPStreamServer) {
        this.simulationJSONHTTPStreamServer.kill();
      }
      this.isStarted = false;
      resolve();
    });
  }

  startYOLOSimulation(callback) {
    // Contains the state of the simulation e.g. open connections
    const simulationState = {
      JSONStreamRes: null,
      mjpegReqHandler: null,
      timer: null
    }

    console.debug("Start HTTP JSON Stream server");
    this.simulationJSONHTTPStreamServer = http.createServer((req, res) => {
      console.debug("Got request on JSON Stream server started");
      simulationState.JSONStreamRes = res;
      simulationState.timer = this.startStream(simulationState);
    });
    this.simulationJSONHTTPStreamServer.on('close', (err, socket) => {
      console.debug('closing JSON');
      simulationState.JSONStreamRes = null;
      if (simulationState.mjpegReqHandler) {
        simulationState.mjpegReqHandler.close();
      }
    });
    killable(this.simulationJSONHTTPStreamServer);
    console.debug(simulationState.config);
    this.simulationJSONHTTPStreamServer.listen(this.config.jsonStreamPort);

    console.debug("Start MJPEG server");
    this.simulationMJPEGServer = http.createServer(function (req, res) {
      console.debug("Got request on MJPEG server");
      simulationState.mjpegReqHandler = mjpegServer.createReqHandler(req, res);
    });
    this.simulationMJPEGServer.on('close', (err, socket) => {
      console.debug('closing MJGEG');
      if (simulationState.timer) {
        clearInterval(simulationState.timer);
      }
    });
    killable(this.simulationMJPEGServer);
    this.simulationMJPEGServer.listen(this.config.mjpegStreamPort);

    callback();
  }

  startStream(simulationState) {
    var detectionsNb = 0;
    var isSendingJpeg = false;
    var lastJpegTimestamp = 0;
    const self = this;
    const timer = setInterval(() => {
      let sendJPGData = function (err, data) {
        if (!err) {
          // The JPEG stream is opened after the JSON stream, so check for it
          // to be open before sending frames
          if (simulationState.mjpegReqHandler) {
            // simulationState.mjpegReqHandler.write(data, 'binary', () => {
            simulationState.mjpegReqHandler.write(data, 'binary', () => {
              if (self.isVideoDirectory) {
                isSendingJpeg = false;
              } else {
                // XXX: For some reson the picture still lags behin significantly.
                // Therefore give it some time to update the UI before we continue
                // with the stream

                setTimeout(() => {
                  isSendingJpeg = false;
                }, 200);
              }
            });
          } else {
            isSendingJpeg = false;
          }
        }
      }

      if (isSendingJpeg) {
        return;
      }

      if (detectionsNb >= this.detections.length) {
        // We've went through all frames. So now check if we simulate a live
        // source or if we need to stop.
        if (!this.isLive()) {
          this.restart();
          return;
        }
        detectionsNb = 0;
      }
      const detection = this.detections[detectionsNb];

      // It could be that extracting the frame from a video file and
      // transmitting it, takes longer than for the callback to fire.
      // Therefore we need to some rate limiting.
      //
      // In this simple form we have a mutex to check if we are still
      // transmitting a frame.
      if (this.videoFileOrFolderExists && !isSendingJpeg) {
        if (this.isVideoDirectory) {
          isSendingJpeg = true;
          YoloSimulation.getJpgForFrameFromFolder(this.config.videoParams.video_file_or_folder, detection.frame_id, sendJPGData);
        } else {
          // Additonally for File extraction we put in a 1s delay to give the CPU some rest.
          if (performance.now() - lastJpegTimestamp > (1000.0 / this.config.videoParams.mjpgFps)) {
            isSendingJpeg = true;
            lastJpegTimestamp = performance.now();

            // Seeking is not exact and updating the stream takes some time as
            // well, therefore jump a few frames ahead
            const maxFrameId = this.detections[this.detections.length - 1].frame_id;
            var frame_id = detection.frame_id + Math.ceil(this.videoFileFps / 10);
            if (frame_id > maxFrameId) {
              frame_id = maxFrameId;
            }
            YoloSimulation.getJpgForFrameFromFile(this.config.videoParams.video_file_or_folder, this.videoFileFps, frame_id, sendJPGData);
          }
        }
      }

      // Update Yolo as well
      YoloSimulation.sendYoloJson(simulationState.JSONStreamRes, this.detections[detectionsNb]);

      // Move on to next detection
      detectionsNb++;
    }, 1000.0 / this.config.videoParams.jsonFps);
    return timer;
  }

  /**
   * Writes the detecion of a single frame to the stream
   *
   * @param {*} stream The stream to write to
   * @param {*} detections The detecion object to write
   */
  static sendYoloJson(stream, detections) {
    if (stream) {
      stream.write(JSON.stringify(detections));
    } else {
      console.warn("JSONStream connection isn't opened yet");
    }
  }

  static getJpgForFrameFromFolder(folder, frameNb, callback) {
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

  static getJpgForFrameFromFile(file, fps, frameNb, callback) {
    const seekPos = frameNb / fps;
    const args = ['-ss', seekPos, '-i', file, '-frames', 1, '-f', 'image2pipe', '-vcodec', 'mjpeg', '-'];

    execFile('ffmpeg', args, { encoding: 'binary' }, (error, stdout, stderr) => {
      if (error) {
        throw error;
      }

      callback(error, stdout);
    });
  }
}

module.exports = { YoloSimulation };
