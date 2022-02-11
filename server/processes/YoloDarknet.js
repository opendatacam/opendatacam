const forever = require('forever-monitor');
const { performance } = require('perf_hooks');
const { EventEmitter } = require('events');

class YoloDarknet extends EventEmitter {
  /**
   * Creates a YoloDarknet object
   *
   * @param {*} config The configuration to use
   *
   * If config is null, this constructor will still create an object instance, but calling start
   * will fail.
   */
  constructor(config = null) {
    super();

    this.isStarting = false;
    this.isStarted = false;
    this.isInitialized = false;
    this.process = null;
    this.videoResolution = {
      w: 0,
      h: 0,
    };

    /** The configuration passed to the constructor. */
    this.config = {
      yoloParams: null,
      videoType: null,
      videoParams: null,
      jsonStreamPort: null,
      mjpegStreamPort: null,
      darknetPath: null,
      darknetCmd: null,
    };

    if (config == null) {
      console.warn('YoloDarknet: Empty configuration passed, most likely because you are in Simulation mode.');
      return;
    }

    // Copy the config first
    Object.keys(this.config).forEach((key) => {
      if (key in config) {
        this.config[key] = config[key];
      }
    });

    let darknetCommand = [];
    const initialCommand = [this.config.darknetCmd, 'detector', 'demo', this.config.yoloParams.data, this.config.yoloParams.cfg, this.config.yoloParams.weights];
    const endCommand = ['-ext_output', '-dont_show', '-dontdraw_bbox', '-json_port', this.config.jsonStreamPort, '-mjpeg_port', this.config.mjpegStreamPort];

    // Special case if input camera is specified as a -c flag as we need to add one arg
    if (this.config.videoParams.indexOf('-c') === 0) {
      darknetCommand = initialCommand.concat(this.config.videoParams.split(' ')).concat(endCommand);
    } else {
      darknetCommand = initialCommand.concat(this.config.videoParams).concat(endCommand);
    }

    this.process = new (forever.Monitor)(darknetCommand, {
      max: Number.POSITIVE_INFINITY,
      cwd: this.config.darknetPath,
      env: { LD_LIBRARY_PATH: './' },
      killTree: true,
    });

    this.process.on('start', () => {
      console.log('Process YOLO started');
      this.isStarted = true;
      this.isStarting = false;
    });

    this.process.on('restart', () => {
      // Forever
      console.log('Restart YOLO');
    });

    this.process.on('error', (err) => {
      console.log('Process YOLO error');
      console.log(err);
    });

    this.process.on('exit', (err) => {
      console.log('Process YOLO exit');
      // console.log(err);
    });

    this.process.on('stdout', (data) => {
      const stdoutText = data.toString();
      // Hacky way to get the video resolution from YOLO
      // We parse the stdout looking for "Video stream: 640 x 480"
      // alternative would be to add this info to the JSON stream sent by YOLO, would need to send a PR to https://github.com/alexeyab/darknet
      if (stdoutText.indexOf('Video stream:') > -1) {
        const splitOnStream = stdoutText.toString().split('stream:');
        const ratio = splitOnStream[1].split('\n')[0];
        this.videoResolution = {
          w: parseInt(ratio.split('x')[0].trim()),
          h: parseInt(ratio.split('x')[1].trim()),
        };

        this.emit('videoresolution', this.videoResolution);
      }
    });

    console.log('Process YOLO initialized');
    this.isInitialized = true;

    // TODO handle other kind of events
    // https://github.com/foreverjs/forever-monitor#events-available-when-using-an-instance-of-forever-in-nodejs
  }

  getStatus() {
    return {
      isStarting: this.isStarting,
      isStarted: this.isStarted,
    };
  }

  getVideoResolution() {
    return this.videoResolution;
  }

  getVideoParams() {
    return this.config.videoParams;
  }

  start() {
    // Do not start it twice
    if (this.isStarted || this.isStarting) {
      console.log('already started');
      return;
    }

    this.isStarting = true;

    if (!this.isStarted) {
      this.process.start();
    }
  }

  stop() {
    return new Promise((resolve, reject) => {
      if (this.isStarted) {
        this.process.once('stop', () => {
          console.log('Process YOLO stopped');
          this.isStarted = false;
          resolve();
        });
        this.process.stop();
      } else {
        resolve();
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
    // Files are recorded
    if (this.config.videoType === 'file') {
      return false;
    }

    // Simulations we need to check the parameters
    if (this.config.videoType === 'simulation') {
      // Explicitly check if live is set to false, as default is true if "-isLive" is omitted.
      const isLiveSimulation = !this.config.videoParams.includes('-isLive false');
      return isLiveSimulation;
    }

    // Everything else is considered live
    return true;
  }
}

module.exports = { YoloDarknet };
