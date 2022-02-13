/*
 * Disable some eslint rules for this abstract class.
 */

/* eslint-disable no-unused-vars */
/* eslint-disable class-methods-use-this */
/* eslint-disable no-empty-function */
/* eslint-disable no-useless-constructor */

const { Recording } = require('../model/Recording');

/**
 * This abstract class defines the API to be implemented by subclasses
 *
 * @abstract
 */
class DbManagerBase {
  /**
   * Creates a database connection object
   *
   * The configuration options will be defined by the extending classes.
   *
   * @param {*} config The credentials to setup the connection and other configurations
   */
  constructor(config) { }

  /**
   * Connect to the opendatacam database
   *
   * @returns {Promise<void>}
   */
  async connect() {
    return Promise.reject(new Error('Not implemented'));
  }

  /**
   * Disconnect from the opendatacam database
   *
   * @returns {Promise<void>}
   */
  async disconnect() {
    return Promise.reject(new Error('Not implemented'));
  }

  /**
   * Check if the database is currently connected
   *
   * @returns {boolean} `true` or `false`
   */
  isConnected() {
    return Promise.reject(new Error('Not implemented'));
  }

  /**
   * Persist the application settings such as the counter areas/lines
   *
   * @param {*} settings
   *
   * @returns {Promise<void>}
   */
  async persistAppSettings(settings) {
    return Promise.reject(new Error('Not implemented'));
  }

  /**
   * Get application settings such as the counter areas/lines
   *
   * @returns {Promise<*>}
   */
  async getAppSettings() {
    return Promise.reject(new Error('Not implemented'));
  }

  /**
   * Insert a new recording to the Database
   *
   * @param {Recording} recording
   *
   * @returns {Promise<void>}
   */
  async insertRecording(recording) {
    return Promise.reject(new Error('Not implemented'));
  }

  /**
   * Gets a single recording from the database
   *
   * @param {String} recordingId The RFC4122 UUID of the recording as a string
   *
   * @returns {Promise<Recording>}
   */
  async getRecording(recordingId) {
    return Promise.reject(new Error('Not implemented'));
  }

  /**
   * Removes a single recording and all connected data from the database
   *
   * @param {String} recordingId The RFC4122 UUID of the recording as a string
   *
   * @returns {Promise<void>}
   */
  async deleteRecording(recordingId) {
    return Promise.reject(new Error('Not implemented'));
  }

  /**
   * Append/update new data to an existing recording
   *
   * @param {String} recordingId The RFC4122 UUID of the recording as a string
   * @param {Date} frameDate
   * @param {*} counterSummary
   * @param {*} trackerSummary
   * @param {*} counterEntry
   * @param {*} trackerEntry
   *
   * @returns {Promise<void>}
   */
  async updateRecordingWithNewframe(
    recordingId,
    frameDate,
    counterSummary,
    trackerSummary,
    counterEntry,
    trackerEntry,
  ) {
    return Promise.reject(new Error('Not implemented'));
  }

  /**
   * Returns a list of recordings
   *
   * @param {Number} limit
   * @param {Number} offset
   *
   * @returns {Promise<Recording[]>}
   */
  async getRecordings(limit = 30, offset = 0) {
    return Promise.reject(new Error('Not implemented'));
  }

  /**
   * Returns the total number of Recordings in the Database
   *
   * @returns {Promise<Recording>}
   */
  async getRecordingsCount() {
    return Promise.reject(new Error('Not implemented'));
  }

  /**
   * Returns the Tracker History for a single recording
   *
   * @param {String} recordingId The RFC4122 UUID of the recording as a string
   *
   * @return {Promise<*>}
   */
  async getTrackerHistoryOfRecording(recordingId) {
    return Promise.reject(new Error('Not implemented'));
  }

  /**
   * Returns the Counter history for a single recording
   *
   * @param {*} recordingId The RFC4122 UUID of the recording as a string
   *
   * @return {Promise<*>}
   */
  async getCounterHistoryOfRecording(recordingId) {
    return Promise.reject(new Error('Not implemented'));
  }
}

module.exports = { DbManagerBase };
