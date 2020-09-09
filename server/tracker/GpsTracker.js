const gpsd = require('node-gpsd');

/**
 * Augments a tracker with GPS coordinates if they are available.
 */
class GpsTracker {
  DEFAULT_GPSD_RECONNECT_BACKUP_MILLIS = 1000;
  DEFAULT_GPSD_RECONNECT_MAX_MILLIS = 60 * this.DEFAULT_GPSD_RECONNECT_BACKUP_MILLIS;

  lat = null;
  lon = null;
  updateTime = null;
  signalLossTimeoutSeconds = null;
  gpsdListener = null;
  gpsdReconnectBackoffMillis = this.DEFAULT_GPSD_RECONNECT_BACKUP_MILLIS;
  gpsdReconnectTimer = null;

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
      console.debug('GPSD Connected');
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
      console.debug(`GPSD Connection Failed. Retrying in ${this.gpsdReconnectBackoffMillis} milliseconds.`);
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
      this.lat = tpv.lat;
      this.lon = tpv.lon;
      this.updateTime = Date.now();
    }
  }

  getJSONOfTrackedItems = function (roundInt = true) {
    var ret = this.__proto__.getJSONOfTrackedItems(roundInt);

    // Decorate with GPS data
    const isLatLonPresent = this.lat !== null && this.lon !== null;
    const isFresh = this.updateTime && (Date.now() - this.updateTime <= this.signalLossTimeoutSeconds * 1000);
    ret = ret.map((detectedObject) => {
      if (isLatLonPresent && isFresh) {
        detectedObject.lat = this.lat;
        detectedObject.lon = this.lon;
      } else {
        detectedObject.lat = null;
        detectedObject.lon = null;
      }
      return detectedObject;
    });

    return ret;
  }
}

module.exports = GpsTracker;
