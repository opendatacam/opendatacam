const { MongoClient, ObjectID, Db } = require('mongodb');
const { getMongoUrl } = require('../utils/configHelper');

const RECORDING_COLLECTION = 'recordings';
const TRACKER_COLLECTION = 'tracker';
const APP_COLLECTION = 'app';


class DBManager {
  constructor() {
    // XXX: This is a hacky way to export the collections without changing the module structure to
    // much
    this.RECORDING_COLLECTION = RECORDING_COLLECTION;
    this.TRACKER_COLLECTION = TRACKER_COLLECTION;
    this.APP_COLLECTION = APP_COLLECTION;

    /**
     * The connection string used or null if a Db object was used for the connection or the
     * connection has not been established yet.
     */
    this.connectionString = null;
    this.db = null;
  }

  /**
   * Connect to the opendatacam database the MongoDB Server
   *
   * If connectionStringOrDbObject is a
   *
   * - Db object: the object pointing to a database will be used and no new connection will be
   *   created
   * - String: The string will be used to create a new connection to the database and then the
   *   "opendatacam" database will be used
   *
   * @param {*} connectionStringOrDbObject The connection to use or credentials to create one
   *
   * @returns A promise that if resolved returns the opendatacam database object
   *
   * @throws Error if something else then a String or Db is passed
   */
  async connect(connectionStringOrDbObject) {
    const createCollectionsAndIndex = function(db) {
      const recordingCollection = db.collection(RECORDING_COLLECTION);
      recordingCollection.createIndex({ dateStart: -1 });

      const trackerCollection = db.collection(TRACKER_COLLECTION);
      trackerCollection.createIndex({ recordingId: 1 });
    }

    const isConnectionString = typeof connectionStringOrDbObject === 'string'
      || connectionStringOrDbObject instanceof String;
    const isDbObject = typeof connectionStringOrDbObject === 'object';

    if (isConnectionString) {
      return new Promise((resolve, reject) => {
        this.connectionString = connectionStringOrDbObject;
        MongoClient.connect(this.connectionString, { useNewUrlParser: true, useUnifiedTopology: true }, (err, client) => {
          if (err) {
            reject(err);
          } else {
            let db = client.db('opendatacam');
            this.db = db;

            createCollectionsAndIndex(db);

            resolve(db);
          }
        });
      });
    } else if (isDbObject) {
      this.db = connectionStringOrDbObject;
      createCollectionsAndIndex(this.db);
      return Promise.resolve(this.db);
    } else {
      return new Error();
    }
  }

  /**
   * Creates a new connection to the database with default credentials
   *
   * @returns A promise that if resolved returns the opendatacam database object
   *
   * @deprecated Use DBManager.connect instead
   * @see DBManager.connect
   */
  async init() {
    return this.connect(getMongoUrl());
  }

  getDB() {
    return new Promise((resolve, reject) => {
      if (this.db) {
        resolve(this.db);
      } else {
        resolve(this.init());
      }
    });
  }

  persistAppSettings(settings) {
    return new Promise((resolve, reject) => {
      this.getDB().then(db => {
        db.collection(APP_COLLECTION).updateOne({
          id: 'settings'
        }, {
          $set: {
            id: 'settings',
            countingAreas: settings.countingAreas
          }
        }, { upsert: true }, (err, r) => {
          if (err) {
            reject(err);
          } else {
            resolve(r);
          }
        });
      });
    });
  }

  getAppSettings() {
    return new Promise((resolve, reject) => {
      this.getDB().then(db => {
        db
          .collection(APP_COLLECTION)
          .findOne(
            { id: 'settings' },
            (err, doc) => {
              if (err) {
                reject(err);
              } else {
                resolve(doc);
              }
            }
          );
      });
    });
  }

  insertRecording(recording) {
    return new Promise((resolve, reject) => {
      this.getDB().then(db => {
        db.collection(RECORDING_COLLECTION).insertOne(recording, (err, r) => {
          if (err) {
            reject(err);
          } else {
            resolve(r);
          }
        });
      });
    });
  }

  deleteRecording(recordingId) {
    const deleteRecordingPromise = new Promise((resolve, reject) => {
      this.getDB().then(db => {
        db.collection(RECORDING_COLLECTION).deleteOne({ _id: ObjectID(recordingId) }, (err, r) => {
          if (err) {
            reject(err);
          } else {
            resolve(r);
          }
        });
      });
    });

    const deleteTrackerPromise = new Promise((resolve, reject) => {
      this.getDB().then(db => {
        db.collection(TRACKER_COLLECTION).deleteMany({ 'recordingId': ObjectID(recordingId) }, (err, r) => {
          if (err) {
            reject(err);
          } else {
            resolve(r);
          }
        });
      });
    });

    return Promise.all([deleteRecordingPromise, deleteTrackerPromise]);
  }

  // TODO For larges array like the one we are using, we can't do that, perfs are terrible
  // we need to push trackerEntry in another collection and ref it
  // Or maybe try to batch update not on every frame
  // I think a simple fix would be to store trackerData in it's own collection
  // db.collection(recordingId.toString()).insertOne(trackerEntry);
  updateRecordingWithNewframe(
    recordingId,
    frameDate,
    counterSummary,
    trackerSummary,
    counterEntry,
    trackerEntry
  ) {
    return new Promise((resolve, reject) => {

      // let itemsToAdd = {
      //   trackerHistory: trackerEntry
      // };

      let updateRequest = {
        $set: {
          dateEnd: frameDate,
          counterSummary: counterSummary,
          trackerSummary: trackerSummary
        }
        // Only add $push if we have a counted item
      };

      let itemsToAdd = {};

      // Add counterHistory when somethings counted
      if (counterEntry.length > 0) {
        itemsToAdd['counterHistory'] = {
          $each: counterEntry
        };
        updateRequest['$push'] = itemsToAdd;
      }

      this.getDB().then(db => {
        db.collection(RECORDING_COLLECTION).updateOne(
          { _id: recordingId },
          updateRequest,
          (err, r) => {
            if (err) {
              reject(err);
            } else {
              resolve(r);
            }
          }
        );

        if(trackerEntry.objects != null && trackerEntry.objects.length > 0) {
          db.collection(TRACKER_COLLECTION).insertOne(trackerEntry);
        }
      });
    });
  }

  getRecordings(limit = 30, offset = 0) {
    return new Promise((resolve, reject) => {
      this.getDB().then(db => {
        db
          .collection(RECORDING_COLLECTION)
          .find({})
          .project({ counterHistory: 0, trackerHistory: 0 })
          .sort({ dateStart: -1 })
          .limit(limit)
          .skip(offset)
          .toArray(function (err, docs) {
            if (err) {
              reject(err);
            } else {
              resolve(docs);
            }
          });
      });
    });
  }

  getRecording(recordingId) {
    return new Promise((resolve, reject) => {
      this.getDB().then(db => {
        db
          .collection(RECORDING_COLLECTION)
          .findOne(
            { _id: ObjectID(recordingId) },
            { projection: { counterHistory: 0, areas: 0 } },
            (err, doc) => {
              if (err) {
                reject(err);
              } else {
                resolve(doc);
              }
            }
          );
      });
    });
  }

  getRecordingsCount() {
    return new Promise((resolve, reject) => {
      this.getDB().then(db => {
        db
          .collection(RECORDING_COLLECTION)
          .countDocuments({}, (err, res) => {
            if (err) {
              reject(err);
            } else {
              resolve(res);
            }
          });
      });
    });
  }

  getTrackerHistoryOfRecording(recordingId) {
    return new Promise((resolve, reject) => {
      this.getDB().then(db => {
        db
          .collection(TRACKER_COLLECTION)
          .find(
            { recordingId: ObjectID(recordingId) }
          )
          .toArray(function (err, docs) {
            if (err) {
              reject(err);
            } else {
              resolve(docs);
            }
          });
      });
    });
  }

  getCounterHistoryOfRecording(recordingId) {
    return new Promise((resolve, reject) => {
      this.getDB().then(db => {
        db
          .collection(RECORDING_COLLECTION)
          .find(
            { _id: ObjectID(recordingId) }
          )
          .toArray(function (err, docs) {
            if (err) {
              reject(err);
            } else {
              if (docs.length === 0) {
                resolve({});
              } else {
                resolve(docs[0]);
              }
            }
          });
      });
    });
  }

}

var DBManagerInstance = new DBManager();

module.exports = DBManagerInstance;
