const { MongoClient } = require('mongodb');
const { DbManagerBase } = require('./DbManagerBase');

class MongoDbManager extends DbManagerBase {
  /**
   * Creates a new MongoDbManager object
   *
   * If connectionStringOrDbObject is a
   *
   * - Db object: the object pointing to a database will be used and no new connection will be
   *   created
   * - String: The string will be used to create a new connection to the database and then the
   *   "opendatacam" database will be used
   *
   * After creation {@link MongoDbManager.connect} must be called
   *
   * @param {*} connectionStringOrDbObject The connection to use or credentials to create one
   */
  constructor(connectionStringOrDbObject) {
    super();

    /**
     * Collection used to store the recordings
     *
     * @private
     */
    this.RECORDING_COLLECTION = 'recordings';
    /**
     * Collection used to store the tracker data
     *
     * @private
     */
    this.TRACKER_COLLECTION = 'tracker';
    /**
     * Collection to store App Settings
     *
     * @private
     */
    this.APP_COLLECTION = 'app';
    /**
     * Name of the Database
     *
     * @private
     */
    this.DATABASE_NAME = 'opendatacam';

    this.connectionStringOrDbObject = connectionStringOrDbObject;
    /**
     * The connection string used or null if a Db object was used for the connection or the
     * connection has not been established yet.
     */
    this.connectionString = null;
    this.db = null;
  }

  async connect() {
    const createCollectionsAndIndex = (db) => {
      const recordingCollection = db.collection(this.RECORDING_COLLECTION);
      recordingCollection.createIndex({ dateStart: -1 });
      recordingCollection.createIndex({ id: 1 }, { unique: true });

      const trackerCollection = db.collection(this.TRACKER_COLLECTION);
      trackerCollection.createIndex({ recordingId: 1 });
    };

    const isConnectionString = typeof this.connectionStringOrDbObject === 'string'
      || this.connectionStringOrDbObject instanceof String;
    const isDbObject = typeof this.connectionStringOrDbObject === 'object';

    if (isConnectionString) {
      return new Promise((resolve, reject) => {
        this.connectionString = this.connectionStringOrDbObject;
        const mongoConnectParams = { useNewUrlParser: true, useUnifiedTopology: true };
        MongoClient.connect(this.connectionString, mongoConnectParams, (err, client) => {
          if (err) {
            reject(err);
          } else {
            const db = client.db(this.DATABASE_NAME);
            this.db = db;

            createCollectionsAndIndex(db);

            resolve(db);
          }
        });
      });
    } if (isDbObject) {
      this.db = this.connectionStringOrDbObject;
      createCollectionsAndIndex(this.db);
      return Promise.resolve(this.db);
    }
    return new Error();
  }

  /**
   * This does not actually disconnect it just removes the reference from the MongoDB so it will no
   * longer be in use
   */
  async disconnect() {
    this.db = null;
    return Promise.resolve();
  }

  isConnected() {
    if (this.db) {
      return true;
    }
    return false;
  }

  /**
   * @private
   */
  getDB() {
    return new Promise((resolve) => {
      if (this.db) {
        resolve(this.db);
      } else {
        resolve(this.init());
      }
    });
  }

  async persistAppSettings(settings) {
    return new Promise((resolve, reject) => {
      this.getDB().then((db) => {
        db.collection(this.APP_COLLECTION).updateOne({
          id: 'settings',
        }, {
          $set: {
            id: 'settings',
            countingAreas: settings.countingAreas,
          },
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

  async getAppSettings() {
    return new Promise((resolve, reject) => {
      this.getDB().then((db) => {
        db
          .collection(this.APP_COLLECTION)
          .findOne(
            { id: 'settings' },
            (err, doc) => {
              if (err) {
                reject(err);
              } else {
                resolve(doc);
              }
            },
          );
      });
    });
  }

  async insertRecording(recording) {
    return new Promise((resolve, reject) => {
      this.getDB().then((db) => {
        db.collection(this.RECORDING_COLLECTION).insertOne(recording, (err, r) => {
          if (err) {
            reject(err);
          } else {
            resolve(r);
          }
        });
      });
    });
  }

  async deleteRecording(recordingId) {
    const deleteRecordingPromise = new Promise((resolve, reject) => {
      this.getDB().then((db) => {
        db.collection(this.RECORDING_COLLECTION).deleteOne({ id: recordingId }, (err, r) => {
          if (err) {
            reject(err);
          } else {
            resolve(r);
          }
        });
      });
    });

    const deleteTrackerPromise = new Promise((resolve, reject) => {
      this.getDB().then((db) => {
        const filter = { recordingId };
        db.collection(this.TRACKER_COLLECTION).deleteMany(filter, (err, r) => {
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
  async updateRecordingWithNewframe(
    recordingId,
    frameDate,
    counterSummary,
    trackerSummary,
    counterEntry,
    trackerEntry,
  ) {
    return new Promise((resolve, reject) => {
      // let itemsToAdd = {
      //   trackerHistory: trackerEntry
      // };

      const updateRequest = {
        $set: {
          dateEnd: frameDate,
          counterSummary,
          trackerSummary,
        },
        // Only add $push if we have a counted item
      };

      const itemsToAdd = {};

      // Add counterHistory when somethings counted
      if (counterEntry.length > 0) {
        itemsToAdd.counterHistory = {
          $each: counterEntry,
        };
        updateRequest.$push = itemsToAdd;
      }

      this.getDB().then((db) => {
        db.collection(this.RECORDING_COLLECTION).updateOne(
          { id: recordingId },
          updateRequest,
          (err, r) => {
            if (err) {
              reject(err);
            } else {
              resolve(r);
            }
          },
        );

        if (trackerEntry.objects != null && trackerEntry.objects.length > 0) {
          db.collection(this.TRACKER_COLLECTION).insertOne(trackerEntry);
        }
      });
    });
  }

  async getRecordings(limit = 30, offset = 0) {
    return new Promise((resolve, reject) => {
      this.getDB().then((db) => {
        db
          .collection(this.RECORDING_COLLECTION)
          .find({})
          .project({ counterHistory: 0, trackerHistory: 0 })
          .sort({ dateStart: -1 })
          .limit(limit)
          .skip(offset)
          .toArray((err, docs) => {
            if (err) {
              reject(err);
            } else {
              resolve(docs);
            }
          });
      });
    });
  }

  async getRecording(recordingId) {
    return new Promise((resolve, reject) => {
      this.getDB().then((db) => {
        db
          .collection(this.RECORDING_COLLECTION)
          .findOne(
            { id: recordingId },
            { projection: { counterHistory: 0, areas: 0 } },
            (err, doc) => {
              if (err) {
                reject(err);
              } else {
                resolve(doc);
              }
            },
          );
      });
    });
  }

  async getRecordingsCount() {
    return new Promise((resolve, reject) => {
      this.getDB().then((db) => {
        db
          .collection(this.RECORDING_COLLECTION)
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

  async getTrackerHistoryOfRecording(recordingId) {
    return new Promise((resolve, reject) => {
      this.getDB().then((db) => {
        db
          .collection(this.TRACKER_COLLECTION)
          .find(
            { recordingId },
          )
          .toArray((err, docs) => {
            if (err) {
              reject(err);
            } else {
              resolve(docs);
            }
          });
      });
    });
  }

  async getCounterHistoryOfRecording(recordingId) {
    return new Promise((resolve, reject) => {
      this.getDB().then((db) => {
        db
          .collection(this.RECORDING_COLLECTION)
          .find(
            { id: recordingId },
          )
          .toArray((err, docs) => {
            if (err) {
              reject(err);
            } else if (docs.length === 0) {
              resolve({});
            } else {
              resolve(docs[0]);
            }
          });
      });
    });
  }
}

module.exports = { MongoDbManager };
