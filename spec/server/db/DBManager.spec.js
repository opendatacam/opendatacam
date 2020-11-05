const DBManager = require('../../../server/db/DBManager');
const { getMongoUrl } = require('../../../server/utils/configHelper');

describe('DBManager', () => {
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
  });
});
