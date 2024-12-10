/* eslint no-console: "off" */

const fs = require('fs');
const path = require('path');
const http = require('http');
const killable = require('killable');
const mjpegServer = require('mjpeg-server');
const { execFile, execFileSync } = require('child_process');
const { performance } = require('perf_hooks');
const yargs = require('yargs');
const splitargs = require('splitargs');
const os = require('os');
const { YoloDarknet } = require('../server/processes/YoloDarknet');

class YoloSimulation extends YoloDarknet {
  constructor(config) {
    super();

    this.config = {
      videoParams: {
        detections: null,
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
      simulationStartupDelayMs: 5000,
      darknetStdout: false,
    };

    // Store the path of the JSON file and the video files including some
    // metadata on the FPS if possible
    this.isVideoDirectory = null;
    this.videoFileOrFolderExists = false;
    this.videoFileFps = null;
    this.detections = null;

    // Information for the Stream
    this.simulationMJPEGServe = null;
    this.simulationJSONHTTPStreamServer = null;

    YoloSimulation.copyConfig(this.config, config);
    // Set Video Resolution to 0x0 on start up.
    this.videoResolution = { w: 0, h: 0 };
    // Use this value for videoResolution once .start has been called
    this.videoResolutionToBeReported = { w: 0, h: 0 };

    const isDirectory = fs.lstatSync(config.videoParams.detections).isDirectory();
    if (isDirectory) {
      this.initMot(config);
    } else {
      this.initYoloJson(config);
    }

    console.log('Process YOLO initialized');
    this.isInitialized = true;
    console.debug(this);
  }

  static normalizePath(p) {
    // XXX: paths in the config are relative from node root. So make sure we
    // normalize before the include
    if (!path.isAbsolute(p)) {
      return path.join(__dirname, '..', p);
    }

    return p;
  }

  static getFpsForFile(file) {
    const args = '-v 0 -of csv=p=0 -select_streams v:0 -show_entries stream=r_frame_rate'.split(' ');
    args.push(file);

    const fpsProcOut = execFileSync('ffprobe', args, { encoding: 'utf-8' });
    const fpsParts = fpsProcOut.split('/');
    const fps = Number(fpsParts[0]) / Number(fpsParts[1]);
    console.debug(`${file} @ ${fps} fps`);
    return fps;
  }

  static copyConfig(target, newConfig) {
    Object.keys(target).forEach((key) => {
      if (key in newConfig) {
        const isObject = target[key] !== null && typeof target[key] === 'object';
        if (isObject) {
          YoloSimulation.copyConfig(target[key], newConfig[key]);
        } else {
          // eslint-disable-next-line no-param-reassign
          target[key] = newConfig[key];
        }
      }
    });
  }

  static convertMotDetection(resolution, motDetectionString) {
    const parts = motDetectionString.split(',');
    const w = Number.parseFloat(parts[4]) / resolution.w;
    const h = Number.parseFloat(parts[5]) / resolution.h;
    const x = (Number.parseFloat(parts[2]) / resolution.w) + (w / 2);
    const y = (Number.parseFloat(parts[3]) / resolution.h) + (h / 2);
    return {
      class_id: 1,
      name: 'person',
      confidence: Number.parseFloat(parts[6]),
      relative_coordinates: {
        center_x: x,
        center_y: y,
        width: w,
        height: h,
      },
    };
  }

  initMot(config) {
    function getValue(seqinfoLines, value) {
      const line = seqinfoLines.find((x) => x.startsWith(value));
      return line.split('=')[1];
    }

    const seqinfoPath = path.join(config.videoParams.detections, 'seqinfo.ini');
    const seqinfoLines = fs.readFileSync(seqinfoPath, 'utf-8').split(/\r?\n/);

    this.config.videoParams.video_file_or_folder = path.join(config.videoParams.detections,
      getValue(seqinfoLines, 'imDir'));
    this.isVideoDirectory = true;
    this.videoFileOrFolderExists = true;

    this.videoResolutionToBeReported.w = Number.parseInt(getValue(seqinfoLines, 'imWidth'), 10);
    this.videoResolutionToBeReported.h = Number.parseInt(getValue(seqinfoLines, 'imHeight'), 10);

    const detPath = path.join(config.videoParams.detections, 'det', 'det.txt');
    const detectionLines = fs.readFileSync(detPath, 'utf-8').split(/\r?\n/);
    this.detections = [];
    detectionLines.forEach((d) => {
      if (d === '') {
        return;
      }

      const frameId = Number.parseInt(d.split(',')[0], 10);

      while (this.detections.length < frameId) {
        this.detections.push({
          frame_id: this.detections.length + 1,
          objects: [],
        });
      }

      const yoloDetection = YoloSimulation.convertMotDetection(this.videoResolutionToBeReported, d);
      this.detections[frameId - 1].objects.push(yoloDetection);
    });
  }

  initYoloJson(config) {
    // Take the values form the config first and then normalize what you have to.
    // eslint-disable-next-line max-len
    this.config.videoParams.detections = YoloSimulation.normalizePath(config.videoParams.detections);
    // eslint-disable-next-line max-len
    this.config.videoParams.video_file_or_folder = YoloSimulation.normalizePath(config.videoParams.video_file_or_folder);

    // parse JSON string to JSON object
    const data = fs.readFileSync(this.config.videoParams.detections);
    this.detections = JSON.parse(data);

    // Check if the video source is a file and determine the fps
    try {
      // eslint-disable-next-line max-len
      this.isVideoDirectory = fs.lstatSync(this.config.videoParams.video_file_or_folder).isDirectory();
      this.videoFileOrFolderExists = true;
    } catch (err) {
      console.warn(`Could not open simulation video file or folder ${this.config.videoParams.video_file_or_folder}`);
      this.videoFileOrFolderExists = false;
    }
    if (this.videoFileOrFolderExists && !this.isVideoDirectory) {
      // eslint-disable-next-line max-len
      this.videoFileFps = YoloSimulation.getFpsForFile(this.config.videoParams.video_file_or_folder);
    }

    // TODO: Determine resolution from video or jpg files.
    this.videoResolutionToBeReported.w = 1280;
    this.videoResolutionToBeReported.h = 720;
  }

  isLive() {
    return this.config.videoParams.isLive;
  }

  getVideoParams() {
    return this.config.videoParams.detections;
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

      // Fix Video Resolution
      this.videoResolution = { ...this.videoResolutionToBeReported };
      this.emit('videoresolution', this.videoResolution);

      this.startYOLOSimulation(() => {
        // When the simulation is up and running come back here to update
        // the state
        this.isStarting = false;
        this.isStarted = true;
      });
    }, this.config.simulationStartupDelayMs);
  }

  stop() {
    return new Promise((resolve) => {
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
    // Print Resolution Information
    if (this.config.darknetStdout) {
      console.log(`Video stream: ${this.videoResolution.w}x${this.videoResolution.h}`);
    }

    // Contains the state of the simulation e.g. open connections
    const simulationState = {
      JSONStreamRes: null,
      mjpegReqHandler: null,
      timer: null,
    };

    console.debug('Start HTTP JSON Stream server');
    this.simulationJSONHTTPStreamServer = http.createServer((req, res) => {
      console.debug('Got request on JSON Stream server started');
      simulationState.JSONStreamRes = res;
      res.write('[');
      simulationState.timer = this.startStream(simulationState);
    });
    this.simulationJSONHTTPStreamServer.on('close', () => {
      console.debug('closing JSON');
      simulationState.JSONStreamRes = null;
      if (simulationState.mjpegReqHandler) {
        simulationState.mjpegReqHandler.close();
      }
    });
    killable(this.simulationJSONHTTPStreamServer);
    console.debug(simulationState.config);
    this.simulationJSONHTTPStreamServer.listen(this.config.jsonStreamPort);

    console.debug('Start MJPEG server');
    this.simulationMJPEGServer = http.createServer((req, res) => {
      console.debug('Got request on MJPEG server');
      simulationState.mjpegReqHandler = mjpegServer.createReqHandler(req, res);
    });
    this.simulationMJPEGServer.on('close', () => {
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
    let detectionsNb = this.detections[0].frame_id;
    let isSendingJpeg = false;
    let lastJpegTimestamp = 0;
    const self = this;
    const timer = setInterval(() => {
      const sendJPGData = (err, data) => {
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
        } else {
          isSendingJpeg = false;
        }
      };

      if (isSendingJpeg) {
        return;
      }

      if (detectionsNb >= this.detections.length) {
        // We've went through all frames. So now check if we simulate a live
        // source or if we need to stop.
        if (!this.isLive()) {
          clearInterval(timer);
          this.stop();
          return;
        }
      }
      const rawDetectionToBeSent = this.detections[detectionsNb % this.detections.length];

      // It could be that extracting the frame from a video file and
      // transmitting it, takes longer than for the callback to fire.
      // Therefore we need to some rate limiting.
      //
      // In this simple form we have a mutex to check if we are still
      // transmitting a frame.
      //
      // Additonally for File extraction we put in a 1s delay to give the CPU some rest.
      const sleepMillis = (1000.0 / this.config.videoParams.mjpgFps);
      if (this.videoFileOrFolderExists && !isSendingJpeg) {
        if (this.isVideoDirectory) {
          isSendingJpeg = true;
          YoloSimulation.getJpgForFrameFromFolder(
            this.config.videoParams.video_file_or_folder,
            rawDetectionToBeSent.frame_id,
            sendJPGData,
          );
        } else if (performance.now() - lastJpegTimestamp > sleepMillis) {
          isSendingJpeg = true;
          lastJpegTimestamp = performance.now();

          // Seeking is not exact and updating the stream takes some time as
          // well, therefore jump a few frames ahead
          const maxFrameId = this.detections[this.detections.length - 1].frame_id;
          let frameId = rawDetectionToBeSent.frame_id + Math.ceil(this.videoFileFps / 10);
          if (frameId > maxFrameId) {
            frameId = maxFrameId;
          }
          YoloSimulation.getJpgForFrameFromFile(
            this.config.videoParams.video_file_or_folder,
            this.videoFileFps,
            frameId,
            sendJPGData,
          );
        }
      }

      // Update Yolo as well but make sure the detections number keeps counting otherwise frameIDs
      // will repeat and that will confuse ODC
      const detectionFixedFrameID = { ...rawDetectionToBeSent };
      detectionFixedFrameID.frame_id = detectionsNb;
      YoloSimulation.sendYoloJson(simulationState.JSONStreamRes, detectionFixedFrameID);

      // Move on to next detection
      detectionsNb += 1;
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
      stream.write(`${JSON.stringify(detections)},`);
    } else {
      console.warn("JSONStream connection isn't opened yet");
    }
  }

  static getJpgForFrameFromFolder(folder, frameNb, callback) {
    let frameFileName = `${String(frameNb).padStart(3, '0')}.jpg`;
    let filePath = path.join(folder, frameFileName);

    fs.access(filePath, fs.constants.R_OK, (err) => {
      if (!err) {
        fs.readFile(filePath, callback);
      } else {
        frameFileName = `${String(frameNb).padStart(6, '0')}.jpg`;
        filePath = path.join(folder, frameFileName);
        fs.access(filePath, fs.constants.R_OK, (errMot) => {
          if (!errMot) {
            fs.readFile(filePath, callback);
          } else {
            console.error(`Could not open ${filePath}`);
            callback(`Could not open ${filePath}`, null);
          }
        });
      }
    });
  }

  static getJpgForFrameFromFile(file, fps, frameNb, callback) {
    const seekPos = frameNb / fps;
    const args = ['-ss', seekPos, '-i', file, '-frames', 1, '-f', 'image2pipe', '-vcodec', 'mjpeg', '-'];

    execFile('ffmpeg', args, { encoding: 'binary' }, (error, stdout) => {
      if (error) {
        callback(`Could not extract frame ${frameNb} from ${file}`, null);
      }

      callback(error, stdout);
    });
  }

  /**
   * Parses the command line to create a config object
   *
   * @param {*} argv String[] of the command line arguments
   *
   * @returns A command line object
   *
   * @throws Error if parsing failed
   */
  static parseCmdLine(argv) {
    const simulationYargs = yargs
      .option('detections', {
        requiresArg: true,
      })
      .alias('detections', 'yolo_json')
      .option('video_file_or_folder', {
        requiresArg: true,
        default: '',
      })
      .option('isLive', {
        type: 'boolean',
        default: true,
      })
      .option('jsonFps', {
        type: 'number',
        requiresArg: true,
        default: 20,
      })
      .option('mjpgFps', {
        type: 'number',
        requiresArg: true,
        default: 20,
      })
      .option('darknetStdout', {
        type: 'boolean',
        default: true,
      })
      .option('json_port', {
        type: 'number',
        requiresArg: true,
        default: 8070,
      })
      .option('mjpeg_port', {
        type: 'number',
        requiresArg: true,
        default: 8090,
      })
      .demandOption('detections')
      .fail((msg, err, yYargs) => {
        const errMsg = msg + os.EOL + os.EOL + yYargs.help();
        throw new Error(errMsg);
      });

    // In order to take the JSON and MJPG port from the command line we need to add a '-' since
    // original darknet arguments use '-', but yargs needs '--'
    const argsvSane = [];
    argv.forEach((x) => {
      if (x === '-json_port' || x === '-mjpeg_port') {
        argsvSane.push(`-${x}`);
        return;
      }

      if (typeof x === 'string' && x.startsWith('--') && x.indexOf(' ') >= 0) {
        splitargs(x).forEach((s) => {
          argsvSane.push(s);
        });
        return;
      }

      argsvSane.push(x);
    });
    const simulationArgv = simulationYargs.parse(argsvSane);

    return {
      videoParams: {
        detections: simulationArgv.detections,
        video_file_or_folder: simulationArgv.video_file_or_folder,
        isLive: simulationArgv.isLive,
        jsonFps: simulationArgv.jsonFps,
        mjpgFps: simulationArgv.mjpgFps,
      },
      jsonStreamPort: simulationArgv.json_port,
      mjpegStreamPort: simulationArgv.mjpeg_port,
      darknetStdout: simulationArgv.darknetStdout,
    };
  }
}

const isDirectExecution = __filename === process.argv[1];
if (isDirectExecution) {
  let config = null;
  try {
    config = YoloSimulation.parseCmdLine(process.argv);
  } catch (e) {
    console.log(e.message);
  }

  if (config != null) {
    console.log('YoloSimulation Start with Arguments');
    console.log(config);
    const yoloSim = new YoloSimulation(config);
    yoloSim.start();
  }
}

module.exports = { YoloSimulation };
