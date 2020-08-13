const forever = require('forever-monitor');
const config = require('../../config.json');
const configHelper = require('../utils/configHelper');

const {
  performance
} = require('perf_hooks');

let YOLO = {
  isStarting: false,
  isStarted: false,
  isInitialized: false,
  process: null,
  currentVideoParams: ""
};

module.exports = {
  init: function(simulationMode, videoParams = null) {

    var yoloParams = config.NEURAL_NETWORK_PARAMS[config.NEURAL_NETWORK];
    var videoParams = videoParams || config.VIDEO_INPUTS_PARAMS[config.VIDEO_INPUT];
    YOLO.currentVideoParams = videoParams

    var darknetCommand = [];
    var initialCommand = ['./darknet','detector','demo', yoloParams.data , yoloParams.cfg, yoloParams.weights]
    var endCommand = ['-ext_output','-dont_show', '-dontdraw_bbox','-json_port', configHelper.getJsonStreamPort() , '-mjpeg_port', configHelper.getMjpegStreamPort()]

    // Special case if input camera is specified as a -c flag as we need to add one arg
    if(videoParams.indexOf('-c') === 0) {
      darknetCommand = initialCommand.concat(videoParams.split(" ")).concat(endCommand);
    } else {
      darknetCommand = initialCommand.concat(videoParams).concat(endCommand);
    }

    YOLO.process = new (forever.Monitor)(darknetCommand,{
      max: Number.POSITIVE_INFINITY,
      cwd: config.PATH_TO_YOLO_DARKNET,
      env: { 'LD_LIBRARY_PATH': './' },
      killTree: true
    });

    YOLO.process.on("start", () => {
      console.log('Process YOLO started');
      YOLO.isStarted = true;
      YOLO.isStarting = false;
    });

    YOLO.process.on("restart", () => {
      // Forever
      console.log("Restart YOLO");
    })

    YOLO.process.on("error", (err) => {
      console.log('Process YOLO error');
      console.log(err);
    });

    YOLO.process.on("exit", (err) => {
      console.log('Process YOLO exit');
      //console.log(err);
    });

    console.log('Process YOLO initialized');
    YOLO.isInitialized = true;

    // TODO handle other kind of events
    // https://github.com/foreverjs/forever-monitor#events-available-when-using-an-instance-of-forever-in-nodejs
  },

  getStatus: function() {
    return {
      isStarting: YOLO.isStarting,
      isStarted: YOLO.isStarted
    }
  },

  getVideoParams: function() {
    return YOLO.currentVideoParams;
  },

  start: function() {
    // Do not start it twice
    if(YOLO.isStarted || YOLO.isStarting) {
      console.log('already started');
      return;
    }

    YOLO.isStarting = true;

    if(!YOLO.isStarted) {
      YOLO.process.start();
    }
  },

  stop: function() {
    return new Promise((resolve, reject) => {
      if(YOLO.isStarted) {
        YOLO.process.once("stop", () => {
          console.log('Process YOLO stopped');
          YOLO.isStarted = false;
          resolve();
        });
        YOLO.process.stop();
      }
    });
  },

  restart() {
    console.log('Process YOLO restart');
    this.stop().then(() => {
      this.start();
    });
  },

  isLive() {
    // Files are recorded, everything else is live
    return config.VIDEO_INPUT !== "file";
  }
}
