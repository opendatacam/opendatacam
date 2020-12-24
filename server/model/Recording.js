const UUID = require('uuid');

/**
 * A single recording
 */
class Recording {
  // Recording has methods to persist data to DB as it grows
  // The idea is never having all the data in memory as
  // trackerHistory can be quite huge

  /**
   * Creates a new Recording object
   *
   * See documentation API documentation for "Register areas" and "Webcam Resolution" for more
   * information on the `areas` and `videoResolution` parameters.
   *
   * @constructor
   * @param {Date} dateStart Beginning of the recording
   * @param {Date} dateEnd End of recording
   * @param {*} areas The recording areas used in this recording
   * @param {*} videoResolution Resolution of the file or live camera
   * @param {String} filename Name of the file, or `null` if running  from live camera
   * @param {String} id The RFC4122 UUID to use, or `null` to generate a new one
   *
   * @throws {TypeError} If the UUID is not valid
   */
  constructor(
    dateStart,
    dateEnd,
    areas,
    videoResolution,
    filename,
    id,
  ) {
    this.dateStart = dateStart;
    this.dateEnd = dateEnd;
    this.areas = areas;
    this.videoResolution = videoResolution;
    this.filename = filename;

    if (id === undefined || id === null) {
      this.id = UUID.v4();
    } else if (UUID.validate(id)) {
      this.id = id;
    } else {
      throw new TypeError('Invalid ID. Must be RFC4122 compliant.');
    }
  }
}

module.exports = { Recording };
