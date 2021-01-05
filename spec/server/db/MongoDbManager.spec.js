const cloneDeep = require('lodash.clonedeep');
const { MongoDbManager } = require('../../../server/db/MongoDbManager');

describe('MongoDbManager', () => {
  const RECORDING_ID = '5faac7df863f7328a158c78e';

  let dbSpy = null;
  let collectionSpy = null;
  /** MongoDatabaseManager */
  let mdbm = null;

  beforeEach(() => {
    collectionSpy = jasmine.createSpyObj('collection',
      ['createIndex', 'deleteMany', 'deleteOne', 'updateOne', 'insertOne', 'remove']);
    collectionSpy.updateOne.and.callFake((arg0, arg1, callback) => {
      // Report success
      callback(null, null);
    });
    collectionSpy.remove.and.callFake((args, callback) => {
      // Report success
      callback(null, null);
    });
    collectionSpy.deleteMany.and.callFake((args, callback) => {
      // Report success
      callback(null, null);
    });
    collectionSpy.deleteOne.and.callFake((args, callback) => {
      // Report success
      callback(null, null);
    });
    dbSpy = jasmine.createSpyObj('Db', { collection: collectionSpy });
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

    describe('object', () => {
      let connectionPromise = null;
      beforeEach(() => {
        mdbm = new MongoDbManager(dbSpy);
        connectionPromise = mdbm.connect();
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

      describe('disconnect', () => {
        let disconnectPromise = null;

        beforeEach(() => {
          disconnectPromise = mdbm.disconnect();
        });

        it('resolves', async () => {
          await expectAsync(disconnectPromise).toBeResolved();
        });

        it('sets connection status', async () => {
          await disconnectPromise;
          expect(mdbm.isConnected()).toBeFalse();
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
      mdbm = new MongoDbManager(dbSpy);
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
      mdbm = new MongoDbManager(dbSpy);
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
