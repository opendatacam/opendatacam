const cloneDeep = require('lodash.clonedeep');
const { MongoDbManager } = require('../../../server/db/MongoDbManager');

describe('MongoDbManager', () => {
  const RECORDING_ID = '5faac7df863f7328a158c78e';

  let dbSpy = null;
  let collectionSpy = null;
  /** MongoDatabaseManager */
  let mdbm = null;
  let clientSpy = null;
  /* Setting error to null = success */
  let callbackError = null;
  let callbackResult = null;

  beforeEach(() => {
    callbackError = null;
    callbackResult = null;

    const collectionSpyDefaultFake = (...args) => {
      // Last argument is the callback
      if (args.length > 0) {
        const callback = args[args.length - 1];
        if (callback && typeof callback === 'function') {
          callback(callbackError, callbackResult);
        }
      }
    };
    collectionSpy = jasmine.createSpyObj('collection',
      ['createIndex', 'deleteMany', 'deleteOne', 'updateOne', 'insertOne', 'remove', 'findOne',
        'find', 'project', 'sort', 'limit', 'skip', 'toArray', 'countDocuments']);
    collectionSpy.find.and.returnValue(collectionSpy);
    collectionSpy.project.and.returnValue(collectionSpy);
    collectionSpy.sort.and.returnValue(collectionSpy);
    collectionSpy.limit.and.returnValue(collectionSpy);
    collectionSpy.skip.and.returnValue(collectionSpy);
    collectionSpy.toArray.and.callFake(collectionSpyDefaultFake);
    collectionSpy.updateOne.and.callFake(collectionSpyDefaultFake);
    collectionSpy.countDocuments.and.callFake(collectionSpyDefaultFake);
    collectionSpy.remove.and.callFake(collectionSpyDefaultFake);
    collectionSpy.deleteMany.and.callFake(collectionSpyDefaultFake);
    collectionSpy.deleteOne.and.callFake(collectionSpyDefaultFake);
    collectionSpy.insertOne.and.callFake(collectionSpyDefaultFake);
    collectionSpy.findOne.and.callFake(collectionSpyDefaultFake);

    dbSpy = jasmine.createSpyObj('Db', { collection: collectionSpy });
    clientSpy = jasmine.createSpyObj('Client', ['connect', 'db', 'isConnected', 'close']);
    clientSpy.connect.and.callFake((cb) => { cb(null, clientSpy); });
    clientSpy.db.and.returnValue(dbSpy);
    clientSpy.isConnected.and.returnValue(true);
    clientSpy.close.and.returnValue(Promise.resolve());
  });

  describe('connection', () => {
    it('is disconnected at start', () => {
      const connectionString = 'mongo://foo:218';
      const db = new MongoDbManager(connectionString);
      expect(db.isConnected()).toBeFalse();
    });

    it('uses connection string', async () => {
      const connectionString = 'mongo://foo:218';
      const db = new MongoDbManager(connectionString);
      db.connect(connectionString).then(
        () => { fail(); },
        () => { expect(db.connectionString).toEqual(connectionString); },
      );
    });

    it('rejets operations before connect', async () => {
      const connectionString = 'mongo://foo:218';
      const db = new MongoDbManager(connectionString);
      await expectAsync(db.persistAppSettings(null)).toBeRejected();
      await expectAsync(db.getAppSettings()).toBeRejected();
      await expectAsync(db.insertRecording(null)).toBeRejected();
      await expectAsync(db.deleteRecording(null)).toBeRejected();
      await expectAsync(db.updateRecordingWithNewframe('1', null, null, null, null, null)).toBeRejected();
      await expectAsync(db.getRecordings()).toBeRejected();
      await expectAsync(db.getRecording('1')).toBeRejected();
      await expectAsync(db.getRecordingsCount()).toBeRejected();
      await expectAsync(db.getTrackerHistoryOfRecording('1')).toBeRejected();
      await expectAsync(db.getCounterHistoryOfRecording('1')).toBeRejected();
    });

    describe('mongoclient', () => {
      let connectionPromise = null;
      beforeEach(() => {
        mdbm = new MongoDbManager(clientSpy);
        connectionPromise = mdbm.connect();
      });

      it('does not connect if client is connected', async () => {
        expect(clientSpy.connect).not.toHaveBeenCalled();
      });

      it('connects if client is not connected', async () => {
        clientSpy.isConnected.and.returnValue(false);
        mdbm = new MongoDbManager(clientSpy);
        await mdbm.connect();

        expect(clientSpy.connect).toHaveBeenCalled();
      });

      it('resolves', async () => {
        await expectAsync(connectionPromise).toBeResolved();
      });

      it('shows it is connected', async () => {
        await expectAsync(connectionPromise).toBeResolved();
        expect(mdbm.isConnected()).toBeTrue();
      });

      it('uses my connection', async () => {
        await expectAsync(connectionPromise).toBeResolvedTo(dbSpy);
        await expectAsync(mdbm.getDB()).toBeResolvedTo(dbSpy);
        expect(mdbm.db).toBe(dbSpy);
      });

      it('access the collections', async () => {
        await connectionPromise;
        expect(dbSpy.collection).toHaveBeenCalled();
        expect(collectionSpy.createIndex).toHaveBeenCalled();
      });

      describe('connection errors', () => {
        describe('rejects and reconnects', () => {
          const onResolved = () => { fail(); };
          const onRejected = (reason) => {
            expect(clientSpy.close).toHaveBeenCalled();
            // Mark client as disconnected after close has been called.
            clientSpy.isConnected.and.returnValue(false);
            expect(reason).toBe(callbackError);
            expect(mdbm.isConnected()).toBeFalse();

            expect(clientSpy.connect).toHaveBeenCalled();
            clientSpy.connect.calls.reset();
          };

          beforeEach(async () => {
            callbackError = new Error('Failure');

            await connectionPromise;
            clientSpy.close.and.callFake(() => {
              clientSpy.isConnected.and.returnValue(false);
            });
            clientSpy.connect.calls.reset();
          });

          it('for persistAppSetting', async () => {
            await mdbm.persistAppSettings({ countingAreas: null }).then(onResolved, onRejected);
          });

          it('for getAppSettings', async () => {
            await mdbm.getAppSettings().then(onResolved, onRejected);
          });

          it('for insertRecording', async () => {
            await mdbm.insertRecording(null).then(onResolved, onRejected);
          });

          it('for deleteRecording', async () => {
            await mdbm.deleteRecording(RECORDING_ID).then(onResolved, onRejected);
          });

          it('for updateRecordingWithNewframe', async () => {
            await mdbm.updateRecordingWithNewframe('1',
              null,
              null,
              null,
              [null],
              { objects: null }).then(onResolved, onRejected);
          });

          it('for getRecordings', async () => {
            await mdbm.getRecordings().then(onResolved, onRejected);
          });

          it('for getRecording', async () => {
            await mdbm.getRecording(RECORDING_ID).then(onResolved, onRejected);
          });

          it('for getRecordingsCount', async () => {
            await mdbm.getRecordingsCount().then(onResolved, onRejected);
          });

          it('for getTrackerHistoryOfRecording', async () => {
            await mdbm.getTrackerHistoryOfRecording(RECORDING_ID).then(onResolved, onRejected);
          });

          it('for getCounterHistoryOfRecording', async () => {
            await mdbm.getCounterHistoryOfRecording(RECORDING_ID).then(onResolved, onRejected);
          });
        });
      });

      describe('disconnect', () => {
        let disconnectPromise = null;
        beforeEach(() => {
          disconnectPromise = mdbm.disconnect();
          clientSpy.isConnected.and.returnValue(false);
        });

        it('resolves', async () => {
          await expectAsync(disconnectPromise).toBeResolved();
        });

        it('sets connection status', async () => {
          await disconnectPromise;
          expect(mdbm.isConnected()).toBeFalse();
        });

        it('rejects all operations', async () => {
          await disconnectPromise;
          await expectAsync(mdbm.persistAppSettings(null)).toBeRejected();
          await expectAsync(mdbm.getAppSettings()).toBeRejected();
          await expectAsync(mdbm.insertRecording(null)).toBeRejected();
          await expectAsync(mdbm.deleteRecording(null)).toBeRejected();
          await expectAsync(mdbm.updateRecordingWithNewframe('1', null, null, null, null, null)).toBeRejected();
          await expectAsync(mdbm.getRecordings()).toBeRejected();
          await expectAsync(mdbm.getRecording('1')).toBeRejected();
          await expectAsync(mdbm.getRecordingsCount()).toBeRejected();
          await expectAsync(mdbm.getTrackerHistoryOfRecording('1')).toBeRejected();
          await expectAsync(mdbm.getCounterHistoryOfRecording('1')).toBeRejected();
        });
      });
    });
  });

  describe('updateRecordingWithNewframe', () => {
    const argsWithDetection = [
      RECORDING_ID,
      new Date('2020-11-10T17:03:36.477Z'),
      {},
      { totalItemsTracked: 63 },
      [],
      {
        recordingId: RECORDING_ID,
        frameId: 377,
        timestamp: new Date('2020-11-10T17:03:36.477Z'),
        objects: [
          {
            id: 5,
            x: 351,
            y: 245,
            w: 85,
            h: 49,
            bearing: 90,
            confidence: 50,
            name: 'car',
            areas: [],
          },
        ],
      },
    ];

    beforeEach(async () => {
      mdbm = new MongoDbManager(clientSpy);
      await mdbm.connect();
    });

    it('inserts tracker data with detections', async () => {
      await mdbm.updateRecordingWithNewframe(...argsWithDetection);

      expect(collectionSpy.insertOne).toHaveBeenCalled();
    });

    it('does not insert empty tracker frames', async () => {
      const argsWithoutDetection = cloneDeep(argsWithDetection);
      argsWithoutDetection[5].objects = [];

      await mdbm.updateRecordingWithNewframe(...argsWithoutDetection);

      expect(collectionSpy.insertOne).not.toHaveBeenCalled();
    });
  });

  describe('deleteRecording', () => {
    beforeEach(async () => {
      mdbm = new MongoDbManager(clientSpy);
      await mdbm.connect();

      dbSpy.collection.calls.reset();
      collectionSpy.remove.calls.reset();

      await mdbm.deleteRecording(RECORDING_ID);
    });

    it('resolves', async () => {
      const deleteRecordingPromise = mdbm.deleteRecording(RECORDING_ID);
      await expectAsync(deleteRecordingPromise).toBeResolved();
    });

    it('deletes tracker data for recording', () => {
      expect(dbSpy.collection).toHaveBeenCalledWith(mdbm.TRACKER_COLLECTION);
      const expectedCall = { recordingId: RECORDING_ID };
      expect(collectionSpy.deleteMany.calls.mostRecent().args[0]).toEqual(expectedCall);
    });

    it('does not call obsolete methods', () => {
      expect(collectionSpy.remove).not.toHaveBeenCalled();
      expect(collectionSpy.deleteOne).toHaveBeenCalled();
    });
  });
});
