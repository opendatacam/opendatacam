var MongoClient = require('mongodb').MongoClient

var mongoURL = 'mongodb://127.0.0.1:27017'
var RECORDING_COLLECTION = 'recordings';

// Where "mongo" is the name of the service in the docker-compose.yml file
// if (process.env.DOCKER_DEPLOY) {
//   mongoURL = 'mongodb://mongo:27017'
// }

// if (process.env.NOW_DEPLOY) {
//   mongoURL =
//     'mongodb://beatthetraffic:beatthetraffic@ds243418.mlab.com:43418/beatthetraffic'
// }

class DBManager {
  contructor () {
    this.db = null
  }

  init () {
    return new Promise((resolve, reject) => {
      MongoClient.connect(mongoURL, { useNewUrlParser: true }, (err, client) => {
        if (err) {
          reject(err)
        } else {
          let db = client.db('opendatacam')
          this.db = db

          // Get the highscore collection
          const collection = db.collection(RECORDING_COLLECTION)
          // Create the index
          collection.createIndex({ dateEnd: -1 })

          resolve(db)
        }
      })
    })
  }

  getDB () {
    return new Promise((resolve, reject) => {
      if (this.db) {
        resolve(this.db)
      } else {
        return this.init()
      }
    })
  }

  insertRecording (recording) {
    return new Promise((resolve, reject) => {
      this.getDB().then(db => {
        db.collection(RECORDING_COLLECTION).insertOne(recording, (err, r) => {
          if (err) {
            reject(err)
          } else {
            resolve(r)
          }
        })
      })
    })
  }

  updateRecordingWithNewframe (recordingId, frameDate, counterEntry, trackerEntry) {
    return new Promise((resolve, reject) => {
        this.getDB().then(db => {
            db.collection(RECORDING_COLLECTION).update(
                { _id: recordingId },
                { 
                    $set: {
                        dateEnd: frameDate,
                        // MAYBE dashboard: currentDashboard
                    },
                    $push: {
                        counterHistory: counterEntry,
                        trackerHistory: trackerEntry
                    }
                },
                (err, r) => {
                    if (err) {
                        reject(err)
                    } else {
                        resolve(r)
                    }
                }
            )
        })
    })
  }

  getRecordings (limit) {
    return new Promise((resolve, reject) => {
      this.getDB().then(db => {
        db
          .collection(RECORDING_COLLECTION)
          .find({})
          .sort({ dateStart: -1 })
          .limit(limit)
          .toArray(function (err, docs) {
            if (err) {
              reject(err)
            } else {
              resolve(docs)
            }
          })
      })
    })
  }
}

var DBManagerInstance = new DBManager()

module.exports = DBManagerInstance
