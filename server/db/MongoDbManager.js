const { MongoClient } = require('mongodb');
const { DbManagerBase } = require('./DbManagerBase');

class MongoDbManager extends DbManagerBase {
  /**
   * Creates a new MongoDbManager object
   *
   * The `code` is an object with the following fields
   *
   * - url (string): The URL of the Mongo Server as a string
   * - client (MongoClient): If a Mongo client already exists the object can be passed here
   * - persistTracker (bool): Store raw tracker information. Default, false
   *
   * After creation {@link MongoDbManager.connect} must be called.
   *
   * In case of connection loss, the MongoDbManager will try to automatically reconnect. However any
   * operations that should have been carried out while MongoDbManager was offline will be rejected.
   * It is up to the caller to retry failed operations. In practice this meas that tracker data
   * will be lost, while counter data should recover as Opendatacam always updates the whole counter
   * state.
   *
   * @param {*} config The MongoClient to use or credentials to create one
   */
  constructor(config) {
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
     * Collection used to store the counter entries
     *
     * @private
     */
    this.COUNTER_COLLECTION = 'counter';
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

    /**
     * Store the configuration
     */
    this.config = {
      persistTracker: false,
    };

    // Override default config
    if (config) {
      Object.keys(config).forEach((key) => {
        this.config[key] = config[key];
      });
    }

    /**
     * The connection string used or null if a Db object was used for the connection or the
     * connection has not been established yet.
     */
    this.connectionString = null;
    this.db = null;
  }

  async connect() {
    if (this.isConnected()) {
      return Promise.resolve();
    }

    const createCollectionsAndIndex = (db) => {
      const recordingCollection = db.collection(this.RECORDING_COLLECTION);
      recordingCollection.createIndex({ dateStart: -1 });
      recordingCollection.createIndex({ id: 1 }, { unique: true });

      const trackerCollection = db.collection(this.TRACKER_COLLECTION);
      trackerCollection.createIndex({ recordingId: 1 });

      const counterCollection = db.collection(this.COUNTER_COLLECTION);
      counterCollection.createIndex({ recordingId: 1 });
      counterCollection.createIndex({ frameId: 1 });
    };

    const isConnectionString = this.config.url !== undefined
      && (typeof this.config.url === 'string' || this.config.url instanceof String);
    const isClientObject = this.config.client !== undefined && typeof this.config.client === 'object';

    if (isConnectionString) {
      return new Promise((resolve, reject) => {
        this.connectionString = this.config.url;
        const mongoConnectParams = { useNewUrlParser: true, useUnifiedTopology: true };
        MongoClient.connect(this.connectionString, mongoConnectParams, (err, client) => {
          if (err) {
            reject(err);
          } else {
            this.client = client;
            const db = client.db(this.DATABASE_NAME);
            this.db = db;

            createCollectionsAndIndex(db);

            resolve(db);
          }
        });
      });
    }
    if (isClientObject) {
      this.client = this.config.client;
      if (!this.isConnected()) {
        return new Promise((resolve, reject) => {
          this.client.connect((err, client) => {
            if (err) {
              reject(err);
            } else {
              this.client = client;
              const db = client.db(this.DATABASE_NAME);
              this.db = db;

              createCollectionsAndIndex(db);

              resolve(db);
            }
          });
        });
      }
      this.db = this.client.db(this.DATABASE_NAME);
      createCollectionsAndIndex(this.db);
      return Promise.resolve(this.db);
    }
    return Promise.reject(new Error());
  }

  async disconnect() {
    this.db = null;
    return this.client.close();
  }

  isConnected() {
    if (this.client) {
      return this.client.isConnected();
    }
    return false;
  }

  /**
   * @private
   */
  getDB() {
    return new Promise((resolve, reject) => {
      if (this.isConnected()) {
        resolve(this.db);
      } else {
        reject(new Error('Not connected'));
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
            this.disconnect().then(() => {
              this.connect();
            });
            reject(err);
          } else {
            resolve(r);
          }
        });
      }, (reason) => {
        reject(reason);
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
                this.disconnect().then(() => {
                  this.connect();
                });
                reject(err);
              } else {
                resolve(doc);
              }
            },
          );
      }, (reason) => {
        reject(reason);
      });
    });
  }

  async insertRecording(recording) {
    return new Promise((resolve, reject) => {
      this.getDB().then((db) => {
        db.collection(this.RECORDING_COLLECTION).insertOne(recording, (err, r) => {
          if (err) {
            this.disconnect().then(() => {
              this.connect();
            });
            reject(err);
          } else {
            resolve(r);
          }
        });
      }, (reason) => {
        reject(reason);
      });
    });
  }

  async deleteRecording(recordingId) {
    const deleteRecordingPromise = new Promise((resolve, reject) => {
      this.getDB().then((db) => {
        db.collection(this.RECORDING_COLLECTION).deleteOne({ id: recordingId }, (err, r) => {
          if (err) {
            this.disconnect().then(() => {
              this.connect();
            });
            reject(err);
          } else {
            resolve(r);
          }
        });
      }, (reason) => {
        reject(reason);
      });
    });

    const deleteCounterPromise = new Promise((resolve, reject) => {
      this.getDB().then((db) => {
        const filter = { recordingId };
        db.collection(this.COUNTER_COLLECTION).deleteMany(filter, (err, r) => {
          if (err) {
            this.disconnect();
            reject(err);
          } else {
            resolve(r);
          }
        });
      }, (reason) => {
        reject(reason);
      });
    });

    const deleteTrackerPromise = new Promise((resolve, reject) => {
      this.getDB().then((db) => {
        const filter = { recordingId };
        db.collection(this.TRACKER_COLLECTION).deleteMany(filter, (err, r) => {
          if (err) {
            this.disconnect();
            reject(err);
          } else {
            resolve(r);
          }
        });
      }, (reason) => {
        reject(reason);
      });
    });

    return Promise.all([deleteRecordingPromise, deleteCounterPromise, deleteTrackerPromise]);
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
      };

      this.getDB().then((db) => {
        db.collection(this.RECORDING_COLLECTION).updateOne(
          { id: recordingId },
          updateRequest,
          (err, r) => {
            if (err) {
              this.disconnect().then(() => {
                this.connect();
              });
              reject(err);
            } else {
              resolve(r);
            }
          },
        );

        if (counterEntry.length > 0) {
          const itemsToAdd = counterEntry.map((e) => ({ ...e, recordingId }));
          db.collection(this.COUNTER_COLLECTION).insertMany(itemsToAdd);
        }

        const isNotEmptyFrame = trackerEntry.objects != null && trackerEntry.objects.length > 0;
        if (isNotEmptyFrame && this.config.persistTracker) {
          db.collection(this.TRACKER_COLLECTION).insertOne(trackerEntry);
        }
      }, (reason) => {
        reject(reason);
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
              this.disconnect().then(() => {
                this.connect();
              });
              reject(err);
            } else {
              resolve(docs);
            }
          });
      }, (reason) => {
        reject(reason);
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
                this.disconnect().then(() => {
                  this.connect();
                });
                reject(err);
              } else {
                resolve(doc);
              }
            },
          );
      }, (reason) => {
        reject(reason);
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
              this.disconnect().then(() => {
                this.connect();
              });
              reject(err);
            } else {
              resolve(res);
            }
          });
      }, (reason) => {
        reject(reason);
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
              this.disconnect().then(() => {
                this.connect();
              });
              reject(err);
            } else {
              resolve(docs);
            }
          });
      }, (reason) => {
        reject(reason);
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
          .toArray((err, recordings) => {
            if (err) {
              this.disconnect().then(() => {
                this.connect();
              });
              reject(err);
            } else if (recordings.length === 0) {
              resolve({});
            } else {
              db.collection(this.COUNTER_COLLECTION)
                .find({ recordingId })
                .project({ _id: 0, recordingId: 0 })
                .toArray((err2, counterHistory) => {
                  if (err2) {
                    this.disconnect().then(() => {
                      this.connect();
                    });
                    reject(err2);
                  } else {
                    const recording = { ...recordings[0] };
                    recording.counterHistory = counterHistory;
                    resolve(recording);
                  }
                });
            }
          });
      }, (reason) => {
        reject(reason);
      });
    });
  }
}

module.exports = { MongoDbManager };
