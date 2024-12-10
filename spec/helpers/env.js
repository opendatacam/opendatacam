/*
 * This file sets default environmental values for the Jasmine tests, overriding any potential
 * real config values.
 */

/**
  * Sets an environmet variable
  *
  * This will print a warning if the variable was overwritten.
  *
  * @param {*} name The name of the environmental variable
  * @param {*} value The new value
  */
function setEnv(name, value) {
  if (name in process.env) {
    // eslint-disable-next-line no-console
    console.warn(`ENV: Overriding ${name}: ${process.env[name]} => ${value}`);
  }
  process.env[name] = value;
}

// configHelper.spec.js
setEnv('MONGODB_URL', 'foo');
setEnv('PORT_APP', '1234');
setEnv('PORT_DARKNET_MJPEG_STREAM', '1235');
setEnv('PORT_DARKNET_JSON_STREAM', '1236');
