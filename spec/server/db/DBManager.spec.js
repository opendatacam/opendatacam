const DBManager = require('../../../server/db/DBManager');
const { getMongoUrl } = require('../../../server/utils/configHelper');

describe('DBManager', () => {
  var dbSpy = null;
  beforeEach(() => {
    collectionSpy = jasmine.createSpyObj('collection', ['createIndex']);
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
  });
});
