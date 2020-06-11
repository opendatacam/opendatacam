const {
  parseAndTestIsNumber,
  getPortFromConfig,
  getAppPort,
  getJsonStreamPort,
  getMjpegStreamPort,
  getMongoUrl,
} = require('./configHelper');

function test(title, callback) {
  try {
    callback();
    console.log(`✓ ${title}`);
  } catch (error) {
    console.error(`✕ ${title}`);
    console.error(error);
  }
}

function expect(actual) {
  return {
    toBe(expected) {
      if (actual !== expected) {
        throw new Error(`${actual} is not equal to ${expected}`);
      }
    },
  };
}

test('parseAndTestIsNumber function should parse string to number', () => {
  expect(parseAndTestIsNumber("123")).toBe(true);
});

test('parseAndTestIsNumber function should return false on non number s string', () => {
  expect(parseAndTestIsNumber("abc")).toBe(false);
});

test('parseAndTestIsNumber function should return true when passed a number', () => {
  expect(parseAndTestIsNumber(123)).toBe(true);
});

test('getPortFromConfig should return actual port by defined key', () => {
  const config = {
    PORTS: {
      app: 8888,
    },
  };
  expect(getPortFromConfig(config, 'app')).toBe(8888);
});

test('getPortFromConfig should return defined defaultPort because key does not exist', () => {
  const config = {
    PORTS: {
      app: 1234,
    },
  };
  expect(getPortFromConfig(config, 'foo', 3000)).toBe(3000);
});

test('getPortFromConfig should return defaultPort because key does not hold a number', () => {
  const config = {
    PORTS: {
      app: 'ABC',
    },
  };

  expect(getPortFromConfig(config, 'app', 3000)).toBe(3000);
});

test(`Get the values from process.env instead of config

!Hint: You need to call this script with the env variable:

bash & zsh: MONGODB_URL=foo PORT_APP=1234 PORT_DARKNET_MJPEG_STREAM=1234 PORT_DARKNET_JSON_STREAM=1234 node server/utils/configHelper.test.js
fish:       env MONGODB_URL=foo env PORT_APP=1234 env PORT_DARKNET_MJPEG_STREAM=1234 env PORT_DARKNET_JSON_STREAM=1234 node server/utils/configHelper.test.js
`, () => {
  expect(getAppPort()).toBe(1234);
  expect(getJsonStreamPort()).toBe(1234);
  expect(getMjpegStreamPort()).toBe(1234);
  expect(getMongoUrl()).toBe('foo');
});
