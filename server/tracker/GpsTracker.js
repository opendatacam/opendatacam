const gpsd = require('node-gpsd');

/**
 * Augments a tracker with GPS coordinates if they are available.
 */
class GpsTracker {
  DEFAULT_GPSD_RECONNECT_BACKUP_MILLIS = 1000;
  DEFAULT_GPSD_RECONNECT_MAX_MILLIS = 60 * this.DEFAULT_GPSD_RECONNECT_BACKUP_MILLIS;

  lat = null;
  lon = null;
  /** The time obtained from GPS signals as JavaScript Date object */
  gpsTimestamp = null;
  /** The system timestamp of the last GPS position fix as JavaScript Date object */
  positionUpdateTime = null;
  /** The system timestamp of the last GPS timestamp fix as JavaScript Date object */
  timeUpdateTime = null;
  signalLossTimeoutSeconds = null;
  gpsdListener = null;
  gpsdReconnectBackoffMillis = this.DEFAULT_GPSD_RECONNECT_BACKUP_MILLIS;
  gpsdReconnectTimer = null;
  logger = console;

  /**
   * Creates a new GPS Tracker to augment the given tracker.
   *
   * @param {*} baseTracker The base tracker to extend with GPS information
   * @param {*} config The configuration object to use
   * @param {*} gpsdListener If provided this listener will be used instead of
   *    creating a new one
   */
  constructor(baseTracker, config, gpsdListener=null) {
    this.__proto__ = baseTracker;
    this.signalLossTimeoutSeconds = config.signalLossTimeoutSeconds;

    // Create a GPS listener or use the one provided to us
    if(gpsdListener) {
      this.gpsdListener = gpsdListener;
    } else {
      this.gpsdListener = new gpsd.Listener({
        port: config.port,
        hostname: config.hostname,
        parse: true
      });
    }

    // Set up the GPS listener and make it automatically reconnect
    this.gpsdListener.on('connected', () => {
      this.logger.info('GPSD: Connected');
      this.gpsdReconnectBackoffMillis = this.DEFAULT_GPSD_RECONNECT_BACKUP_MILLIS;
      this.gpsdListener.watch();
    });
    this.gpsdListener.on('disconnected', () => {
      this.gpsdReconnectBackoffMillis = Math.min(this.gpsdReconnectBackoffMillis * 2, this.DEFAULT_GPSD_RECONNECT_MAX_MILLIS);
      // XXX: Do not remove the anonymous function
      //
      // I can not tell you why, but passing connect as the callback directly
      // e.g.
      //
      //     setTimeout(this.gpsdListener.connect, this.gpsdReconnectBackoffMillis);
      //
      // will fail as it somehow messes up the context of the node-gpsd and
      // causes errors because the logger gets reset.
      //
      // Attached is the full error message and stracktrace
      //
      // Pheew ....! Something unexpected happened. This should be handled more gracefully. I am sorry. The culprit is:  TypeError: Cannot read property 'error' of undefined
      //    at Socket.<anonymous> (opendatacam/node_modules/node-gpsd/lib/gpsd.js:75:25)
      //    at Socket.emit (events.js:315:20)
      //    at emitErrorNT (internal/streams/destroy.js:100:8)
      //    at emitErrorCloseNT (internal/streams/destroy.js:68:3)
      //    at processTicksAndRejections (internal/process/task_queues.js:84:21)
      // Pheew ....! Something unexpected happened. This should be handled more gracefully. I am sorry. The culprit is:  TypeError: Cannot read property 'info' of undefined
      //    at Socket.<anonymous> (opendatacam/node_modules/node-gpsd/lib/gpsd.js:65:21)
      //    at Socket.emit (events.js:315:20)
      //    at TCP.<anonymous> (net.js:670:12)
      this.gpsdReconnectTimer = setTimeout(() => { this.gpsdListener.connect(); }, this.gpsdReconnectBackoffMillis);
      this.logger.warn(`GPSD: Connection Failed. Retrying in ${this.gpsdReconnectBackoffMillis} milliseconds.`);
      this.logger.info(`GPSD: Lost GPS position. lat=${this.lat} lon=${this.lon}`);
      if(this.gpsTimestamp !== null) {
        this.logger.info(`GPSD: Lost GPS time. gpsTimestamp=${this.gpsTimestamp.toISOString()}`);
      }
      this.lon = null;
      this.lat = null;
      this.gpsTimestamp = null;

    });
    // XXX: Do not remove anonymous function.
    // Similar to above calling directly messes up the "this" reference.
    this.gpsdListener.on('TPV', (tpv) => { this.handleGpsTpvUpdate(tpv); });
    if(!this.gpsdListener.isConnected()) {
      this.gpsdListener.connect();
    }
  }

  handleGpsTpvUpdate = function (tpv) {
    if (tpv.lat && tpv.lon) {

      // Log if this is the first position fix we get
      if(this.lat == null) {
        this.logger.info(`GPSD: Got GPS position. lat=${tpv.lat} lon=${tpv.lon}`);
      }

      this.lat = tpv.lat;
      this.lon = tpv.lon;
      this.positionUpdateTime = Date.now();
    }
    if ("time" in tpv) {
      try {
        const gpsTimestamp = new Date(tpv.time);

        // Log if this is the first time fix we get
        if(this.gpsTimestamp == null) {
          this.logger.info(`GPSD: Got GPS time. gpsTimestamp=${gpsTimestamp.toISOString()}`);
        }

        this.gpsTimestamp = gpsTimestamp;
        this.timeUpdateTime = Date.now();
      } catch (error) {
        this.gpsTimestamp = null;
      }
    }
  }

  getJSONOfTrackedItems = function (roundInt = true) {
    var ret = this.__proto__.getJSONOfTrackedItems(roundInt);

    // Decorate with GPS data
    const isLatLonPresent = this.lat !== null && this.lon !== null;
    const isPositionFresh = this.positionUpdateTime && (Date.now() - this.positionUpdateTime <= this.signalLossTimeoutSeconds * 1000);
    const isGpsTimestampPresent = this.gpsTimestamp !== null;
    const isGpsTimestamFresh = this.timeUpdateTime && (Date.now() - this.timeUpdateTime <= this.signalLossTimeoutSeconds * 1000);
    ret = ret.map((detectedObject) => {
      if (isLatLonPresent && isPositionFresh) {
        detectedObject.lat = this.lat;
        detectedObject.lon = this.lon;
      } else {

        // Log if we lost the position
        if(this.lat !== null) {
          this.logger.info(`GPSD: Lost GPS position. lat=${this.lat} lon=${this.lon}`);
          this.lat = null;
          this.lon = null;
        }

        detectedObject.lat = null;
        detectedObject.lon = null;
      }

      if(isGpsTimestampPresent && isGpsTimestamFresh) {
        detectedObject.gpsTimestamp = this.gpsTimestamp;
      } else {

        // Log if we lost the time
        if(this.gpsTimestamp !== null) {
          this.logger.info(`GPSD: Lost GPS time. gpsTimestamp=${this.gpsTimestamp.toISOString()}`);
          this.gpsTimestamp = null;
        }

        detectedObject.gpsTimestamp = null;
      }

      return detectedObject;
    });

    return ret;
  }
}

module.exports = GpsTracker;
