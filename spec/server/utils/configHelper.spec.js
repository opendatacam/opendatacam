const {
  parseAndTestIsNumber,
  getPortFromConfig,
  getAppPort,
  getJsonStreamPort,
  getMjpegStreamPort,
} = require('../../../server/utils/configHelper');

describe('configHelper', () => {
  describe('parseAndTestIsNumber', () => {
    it('should parse string to number', () => {
      expect(parseAndTestIsNumber('123')).toBe(true);
    });

    it('should return false on non number s string', () => {
      expect(parseAndTestIsNumber('abc')).toBe(false);
    });

    it('should return true when passed a number', () => {
      expect(parseAndTestIsNumber(123)).toBe(true);
    });
  });

  describe('getPortFromConfig', () => {
    it('should return actual port by defined key', () => {
      const config = {
        PORTS: {
          app: 8888,
        },
      };
      expect(getPortFromConfig(config, 'app')).toBe(config.PORTS.app);
    });

    it('should return defined defaultPort because key does not exist', () => {
      const config = {
        PORTS: {
          app: 1234,
        },
      };
      expect(getPortFromConfig(config, 'foo', 3000)).toBe(3000);
    });

    it('should return defaultPort because key does not hold a number', () => {
      const config = {
        PORTS: {
          app: 'ABC',
        },
      };

      expect(getPortFromConfig(config, 'app', 3000)).toBe(3000);
    });
  });

  describe('process env', () => {
    it('takes ENV values by default', () => {
      expect(getAppPort()).toBe(parseInt(process.env.PORT_APP, 10));
      expect(getJsonStreamPort()).toBe(parseInt(process.env.PORT_DARKNET_JSON_STREAM, 10));
      expect(getMjpegStreamPort()).toBe(parseInt(process.env.PORT_DARKNET_MJPEG_STREAM, 10));
    });
  });
});
