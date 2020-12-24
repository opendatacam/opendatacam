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
   */
  constructor(
    dateStart,
    dateEnd,
    areas,
    videoResolution,
    filename,
  ) {
    this.dateStart = dateStart;
    this.dateEnd = dateEnd;
    this.areas = areas;
    this.videoResolution = videoResolution;
    this.filename = filename;
  }
}

module.exports = { Recording };
