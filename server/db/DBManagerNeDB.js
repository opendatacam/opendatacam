
var Datastore = require('nedb')

const RECORDING_COLLECTION = 'recordings';
const TRACKER_COLLECTION = 'tracker';
const APP_COLLECTION = 'app';

class DBManagerNeDB {

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
    this.db = {};
    this.db[RECORDING_COLLECTION] = null;
    this.db[TRACKER_COLLECTION] = null;
    this.db[APP_COLLECTION] = null;
  }

  async connect() {
    // Helper to convert callback to promise for async use
    const loadDbPromise = (db) => new Promise((resolve, reject) => {
      db.loadDatabase(function (err) {    
        // Now commands will be executed
        if(err) {
          reject(err);
        } else {
          resolve(db)
        }
      });
    });

    this.db[RECORDING_COLLECTION] = new Datastore({ filename: '/data/data/com.opendatacam/files/opendatacam_recording.db' });
    this.db[TRACKER_COLLECTION] = new Datastore({ filename: '/data/data/com.opendatacam/files/opendatacam_tracker.db' });
    this.db[APP_COLLECTION] = new Datastore({ filename: '/data/data/com.opendatacam/files/opendatacam_app.db' });

    
    await Promise.all([
      loadDbPromise(this.db[RECORDING_COLLECTION]), 
      loadDbPromise(this.db[TRACKER_COLLECTION]), 
      loadDbPromise(this.db[APP_COLLECTION])
    ]);

    this.db[RECORDING_COLLECTION].ensureIndex({ fieldName: 'dateStart' }, function (err) {
      console.log(err);
      console.log('Index dateStart created')
    });

    this.db[TRACKER_COLLECTION].ensureIndex({ fieldName: 'recordingId' }, function (err) {
      console.log(err);
      console.log('Index recordingId created')
    });

    // Auto compact db every 5 mins
    // TODO add, do it only when isRecording
    this.db[RECORDING_COLLECTION].persistence.setAutocompactionInterval(1000 * 60 * 5);
    this.db[TRACKER_COLLECTION].persistence.setAutocompactionInterval(1000 * 60 * 5);
    console.log('Auto compacting NeDB files ... might cause a sligth lag')

    return this.db;
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
    return this.connect();
  }

  getDB() {
    return new Promise((resolve, reject) => {
      if (this.db) {
        resolve(this.db);
      } else {
        resolve(this.connect());
      }
    });
  }

  persistAppSettings(settings) {
    return new Promise((resolve, reject) => {
      this.getDB().then(db => {
        db[APP_COLLECTION].update({
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
        db[APP_COLLECTION]
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
        db[RECORDING_COLLECTION].insert(recording, (err, r) => {
          if (err) {
            reject(err);
          } else {
            // for compat with MongoDB API, when processing the return of DBManager.insertRecording()
            // in OpenDataCam.js
            r.insertedId = r._id;
            resolve(r);
          }
        });
      });
    });
  }

  deleteRecording(recordingId) {
    const deleteRecordingPromise = new Promise((resolve, reject) => {
      this.getDB().then(db => {
        db[RECORDING_COLLECTION].remove({ _id: recordingId }, (err, r) => {
          if (err) {
            reject(err);
          } else {
            // compact
            db[RECORDING_COLLECTION].persistence.compactDatafile()
            resolve(r);
          }
        });
      });
    });

    const deleteTrackerPromise = new Promise((resolve, reject) => {
      this.getDB().then(db => {
        db[TRACKER_COLLECTION].remove({ 'recordingId': recordingId }, { multi: true }, (err, r) => {
          if (err) {
            reject(err);
          } else {
            // compact
            db[TRACKER_COLLECTION].persistence.compactDatafile()
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
        db[RECORDING_COLLECTION].update(
          { _id: recordingId },
          updateRequest,
          { returnUpdatedDocs : true },
          (err, numAffected) => {
            if (err) {
              reject(err);
            } else {
              resolve(numAffected);
            }
          }
        );

        if(trackerEntry.objects != null && trackerEntry.objects.length > 0) {
          db[TRACKER_COLLECTION].insert(trackerEntry);
        }
      });
    });
  }

  getRecordings(limit = 30, offset = 0) {
    return new Promise((resolve, reject) => {
      this.getDB().then(db => {
        db[RECORDING_COLLECTION]
          .find({})
          .projection({ counterHistory: 0, trackerHistory: 0 })
          .sort({ dateStart: -1 })
          .limit(limit)
          .skip(offset)
          .exec(function (err, docs) {
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
        db[RECORDING_COLLECTION]
          .findOne(
            { _id: recordingId },
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
        db[RECORDING_COLLECTION]
          .count({}, (err, res) => {
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
        db[TRACKER_COLLECTION]
          .find(
            { recordingId: recordingId }
          )
          .exec(function (err, docs) {
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
        db[RECORDING_COLLECTION]
          .find(
            { _id: recordingId }
          )
          .exec(function (err, docs) {
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

var DBManagerInstance = new DBManagerNeDB();

module.exports = DBManagerInstance;
