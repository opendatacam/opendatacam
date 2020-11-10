const DBManager = require('../../../server/db/DBManager');
const { getMongoUrl } = require('../../../server/utils/configHelper');
const cloneDeep = require('lodash.clonedeep');

describe('DBManager', () => {
  var dbSpy = null;
  beforeEach(() => {
    collectionSpy = jasmine.createSpyObj('collection', ['createIndex', 'updateOne', 'insertOne']);
    collectionSpy.updateOne.and.callFake((arg0, arg1, callback) => {
      // Report success
      callback(null, null);
    });
    dbSpy = jasmine.createSpyObj('Db', { 'collection': collectionSpy });
  });

  describe('connection', () => {
    it('uses default connection string', async () => {
      const defaultConnectionString = getMongoUrl();
      DBManager.init().then(
        () => { fail(); },
        () => { expect(DBManager.connectionString).toEqual(defaultConnectionString); }
      );
    });

    it('uses connection string', async () => {
      const connectionString = 'mongo://foo:218';
      DBManager.connect(connectionString).then(
        () => { fail(); },
        () => { expect(DBManager.connectionString).toEqual(connectionString); }
      );
    });

    describe('object', () => {
      var connectionPromise = null;
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

    describe('updateRecordingWithNewframe', () => {
      const argsWithDetection = [
        '5faac7df863f7328a158c78e',
        new Date('2020-11-10T17:03:36.477Z'),
        {},
        { totalItemsTracked: 63 },
        [],
        {
          recordingId: '5faac7df863f7328a158c78e',
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
              areas: []
            }
          ]
        }
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
  });
});
