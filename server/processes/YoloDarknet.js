const forever = require('forever-monitor');

const {
  performance
} = require('perf_hooks');

let YOLO = {
  isStarting: false,
  isStarted: false,
  isInitialized: false,
  process: null,
  config: {
    yoloParams: null,
    videoType: null,
    videoParams: null,
    jsonStreamPort: null,
    mjpegStreamPort: null,
    darknetPath: null,
  }
};

module.exports = {
  init: function(config = null) {
    // Copy the config first
    Object.keys(YOLO.config).forEach((key) => {
      if(key in config) {
        YOLO.config[key] = config[key];
      }
    })

    var darknetCommand = [];
    var initialCommand = ['./darknet','detector','demo', YOLO.config.yoloParams.data , YOLO.config.yoloParams.cfg, YOLO.config.yoloParams.weights];
    var endCommand = ['-ext_output','-dont_show', '-dontdraw_bbox','-json_port', YOLO.config.jsonStreamPort , '-mjpeg_port', YOLO.config.mjpegStreamPort];

    // Special case if input camera is specified as a -c flag as we need to add one arg
    if(YOLO.config.videoParams.indexOf('-c') === 0) {
      darknetCommand = initialCommand.concat(YOLO.config.videoParams.split(" ")).concat(endCommand);
    } else {
      darknetCommand = initialCommand.concat(YOLO.config.videoParams).concat(endCommand);
    }

    YOLO.process = new (forever.Monitor)(darknetCommand,{
      max: Number.POSITIVE_INFINITY,
      cwd: YOLO.config.darknetPath,
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
    return YOLO.config.videoParams;
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
    return YOLO.config.videoType !== "file";
  }
}
