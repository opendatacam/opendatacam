const forever = require('forever-monitor');
const { performance } = require('perf_hooks');

class YoloDarknet {
  isStarting = false;
  isStarted = false;
  isInitialized = false;
  process = null;

  /** The configuration passed to the constructor. */
  config = {
    yoloParams: null,
    videoType: null,
    videoParams: null,
    jsonStreamPort: null,
    mjpegStreamPort: null,
    darknetPath: null,
  };

  constructor(config = null) {
    // Copy the config first
    Object.keys(this.config).forEach((key) => {
      if(key in config) {
        this.config[key] = config[key];
      }
    })

    var darknetCommand = [];
    var initialCommand = ['./darknet','detector','demo', this.config.yoloParams.data , this.config.yoloParams.cfg, this.config.yoloParams.weights];
    var endCommand = ['-ext_output','-dont_show', '-dontdraw_bbox','-json_port', this.config.jsonStreamPort , '-mjpeg_port', this.config.mjpegStreamPort];

    // Special case if input camera is specified as a -c flag as we need to add one arg
    if(this.config.videoParams.indexOf('-c') === 0) {
      darknetCommand = initialCommand.concat(this.config.videoParams.split(" ")).concat(endCommand);
    } else {
      darknetCommand = initialCommand.concat(this.config.videoParams).concat(endCommand);
    }

    this.process = new (forever.Monitor)(darknetCommand,{
      max: Number.POSITIVE_INFINITY,
      cwd: this.config.darknetPath,
      env: { 'LD_LIBRARY_PATH': './' },
      killTree: true
    });

    this.process.on("start", () => {
      console.log('Process YOLO started');
      this.isStarted = true;
      this.isStarting = false;
    });

    this.process.on("restart", () => {
      // Forever
      console.log("Restart YOLO");
    })

    this.process.on("error", (err) => {
      console.log('Process YOLO error');
      console.log(err);
    });

    this.process.on("exit", (err) => {
      console.log('Process YOLO exit');
      //console.log(err);
    });

    console.log('Process YOLO initialized');
    this.isInitialized = true;

    // TODO handle other kind of events
    // https://github.com/foreverjs/forever-monitor#events-available-when-using-an-instance-of-forever-in-nodejs
  }

  getStatus() {
    return {
      isStarting: this.isStarting,
      isStarted: this.isStarted
    }
  }

  getVideoParams() {
    return this.config.videoParams;
  }

  start() {
    // Do not start it twice
    if(this.isStarted || this.isStarting) {
      console.log('already started');
      return;
    }

    this.isStarting = true;

    if(!this.isStarted) {
      this.process.start();
    }
  }

  stop() {
    return new Promise((resolve, reject) => {
      if(this.isStarted) {
        this.process.once("stop", () => {
          console.log('Process YOLO stopped');
          this.isStarted = false;
          resolve();
        });
        this.process.stop();
      }
    });
  }

  restart() {
    console.log('Process YOLO restart');
    this.stop().then(() => {
      this.start();
    });
  }

  /**
   * Indicate wether the source is live or pre-recorded
   *
   * @returns {boolean} true if live; false if pre-recorded
   */
  isLive() {
    // Files are recorded, everything else is live
    return this.config.videoType !== "file";
  }

  /**
   * Creates a new YoloDarknet Object
   *
   * @param {*} config The config to use
   * @returns {YoloDarknet} A new YoloDarknet Object
   *
   * @deprecated Use {@link YoloDarknet#constructor} instead
   */
  static init(config = null) {
    return new YoloDarknet(config);
  }
}

module.exports = { YoloDarknet };
