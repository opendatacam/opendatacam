var MongoClient = require('mongodb').MongoClient;
var ObjectID = require('mongodb').ObjectID;
const config = require('../../config.json');
const { getMongoUrl } = require('../utils/configHelper');
var mongoURL = getMongoUrl();

var RECORDING_COLLECTION = 'recordings';
var TRACKER_COLLECTION = 'tracker';
var APP_COLLECTION = 'app';


class DBManager {
  constructor() {
    this.db = null;
  }

  init() {
    return new Promise((resolve, reject) => {
      MongoClient.connect(mongoURL, { useNewUrlParser: true, useUnifiedTopology: true }, (err, client) => {
        if (err) {
          reject(err);
        } else {
          let db = client.db('opendatacam');
          this.db = db;

          // Get the collection
          const recordingCollection = db.collection(RECORDING_COLLECTION);
          // Create the index
          recordingCollection.createIndex({ dateStart: -1 });

          const trackerCollection = db.collection(TRACKER_COLLECTION);
          // Create the index
          trackerCollection.createIndex({ recordingId: 1 });

          resolve(db);
        }
      });
    });
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
    return new Promise((resolve, reject) => {
      this.getDB().then(db => {
        db.collection(RECORDING_COLLECTION).remove({ _id: ObjectID(recordingId) }, (err, r) => {
          if (err) {
            reject(err);
          } else {
            resolve(r);
          }
        });
      });
    });
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

        db.collection(TRACKER_COLLECTION).insertOne(trackerEntry);
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
