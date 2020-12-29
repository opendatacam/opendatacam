require('dotenv').config();
const config = require('../../config.json');

//  logic is:
// - Get the desired env variables (using dotenv)
// - Get the port from config or use the default
// - If we have the environment variable defined we overrule the default and config
const envAppPort = process.env.PORT_APP;
const envDarknetMjpegStreamPort = process.env.PORT_DARKNET_MJPEG_STREAM;
const envDarknetJsonStreamPort = process.env.PORT_DARKNET_JSON_STREAM;

/**
 * Gets a value by its key from the config.PORTS and define a default. Does some sanity checks if it is really a port we could use. Doesn't check if a port is in use already
 * @param config {Object} the config object loaded from disk
 * @param key {String} The key to lookup
 * @param defaultPort {Number} The  default port ot assign if the value is not present
 * @returns port {Number} The port to use
 */
function getPortFromConfig(config, key, defaultPort) {
  if (!config.PORTS) {
    return defaultPort;
  }
  if (!config.PORTS[key]) {
    return defaultPort;
  }
  if (parseAndTestIsNumber(config.PORTS[key])) {
    return parseInt(config.PORTS[key], 10);
  }
  return defaultPort;
}

/**
 * Get any top level value by key from the config with a fallback if it doesn't exist
 *
 */
function getKeyFromConfig(config, key, defaultValue) {
  if (!config[key]) {
    return defaultValue;
  }
  return config[key];
}

/**
 * Takes a string and tries to parseInt and does a isNaN check
 * @param {String} str The string to parse
 * @returns {Boolean} if it worked or not
 *
 */
function parseAndTestIsNumber(str) {
  const res = parseInt(str, 10);
  return !isNaN(res);
}

module.exports = {
  getPortFromConfig,
  parseAndTestIsNumber,
  getMjpegStreamPort: () => {
    const port = getPortFromConfig(config, 'darknet_mjpeg_stream', 8090);
    if (
      envDarknetJsonStreamPort
      && parseAndTestIsNumber(envDarknetJsonStreamPort)
    ) {
      return parseInt(envDarknetMjpegStreamPort, 10);
    }
    return port;
  },
  getJsonStreamPort: () => {
    const port = getPortFromConfig(config, 'darknet_json_stream', 8070);
    if (
      envDarknetJsonStreamPort
      && parseAndTestIsNumber(envDarknetJsonStreamPort)
    ) {
      return parseInt(envDarknetJsonStreamPort, 10);
    }
    return port;
  },
  getAppPort: () => {
    const port = getPortFromConfig(config, 'app', 8080);
    if (envAppPort && parseAndTestIsNumber(envAppPort)) {
      return parseInt(envAppPort, 10);
    }
    return port;
  },
};
