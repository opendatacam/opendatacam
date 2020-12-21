const { ObjectID } = require('mongodb');
const cloneDeep = require('lodash.clonedeep');
const DBManager = require('../../../server/db/DBManager');
const { getMongoUrl } = require('../../../server/utils/configHelper');

describe('DBManager', () => {
  const RECORDING_ID = '5faac7df863f7328a158c78e';

  let dbSpy = null;
  let collectionSpy = null;

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
    it('uses default connection string', async () => {
      const defaultConnectionString = getMongoUrl();
      DBManager.init().then(
        () => { fail(); },
        () => { expect(DBManager.connectionString).toEqual(defaultConnectionString); },
      );
    });

    it('uses connection string', async () => {
      const connectionString = 'mongo://foo:218';
      DBManager.connect(connectionString).then(
        () => { fail(); },
        () => { expect(DBManager.connectionString).toEqual(connectionString); },
      );
    });

    describe('object', () => {
      let connectionPromise = null;
      beforeEach(() => {
        connectionPromise = DBManager.connect(dbSpy);
      });

      it('resolves', async () => {
        await expectAsync(connectionPromise).toBeResolved();
      });

      it('uses my connection', async () => {
        await expectAsync(connectionPromise).toBeResolvedTo(dbSpy);
        await expectAsync(DBManager.getDB()).toBeResolvedTo(dbSpy);
        expect(DBManager.db).toBe(dbSpy);
      });

      it('access the collections', async () => {
        await connectionPromise;
        expect(dbSpy.collection).toHaveBeenCalled();
        expect(collectionSpy.createIndex).toHaveBeenCalled();
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
      await DBManager.connect(dbSpy);
    });

    it('inserts tracker data with detections', async () => {
      await DBManager.updateRecordingWithNewframe(...argsWithDetection);

      expect(collectionSpy.insertOne).toHaveBeenCalled();
    });

    it('does not insert empty tracker frames', async () => {
      const argsWithoutDetection = cloneDeep(argsWithDetection);
      argsWithoutDetection[5].objects = [];

      await DBManager.updateRecordingWithNewframe(...argsWithoutDetection);

      expect(collectionSpy.insertOne).not.toHaveBeenCalled();
    });
  });

  describe('deleteRecording', () => {
    beforeEach(async () => {
      await DBManager.connect(dbSpy);

      dbSpy.collection.calls.reset();
      collectionSpy.remove.calls.reset();

      await DBManager.deleteRecording(RECORDING_ID);
    });

    it('resolves', async () => {
      const deleteRecordingPromise = DBManager.deleteRecording(RECORDING_ID);
      await expectAsync(deleteRecordingPromise).toBeResolved();
    });

    it('deletes tracker data for recording', () => {
      expect(dbSpy.collection).toHaveBeenCalledWith(DBManager.TRACKER_COLLECTION);
      const expectedCall = { recordingId: ObjectID(RECORDING_ID) };
      expect(collectionSpy.deleteMany.calls.mostRecent().args[0]).toEqual(expectedCall);
    });

    it('does not call obsolete methods', () => {
      expect(collectionSpy.remove).not.toHaveBeenCalled();
      expect(collectionSpy.deleteOne).toHaveBeenCalled();
    });
  });
});
