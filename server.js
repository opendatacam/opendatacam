// Ignore long apidoc comments while keeping the code to 100 chars per line.
/* eslint max-len: ["warn", { "ignoreComments": true , "code": 100, "tabWidth": 2, "ignoreUrls": true }] */

const express = require('express')();
const multer = require('multer');
const serveStatic = require('serve-static');
// Used for CSV export. Do not remove.
const csv = require('csv-express'); /* eslint-disable-line */
const bodyParser = require('body-parser');
const http = require('http');
const next = require('next');
const sse = require('server-sent-events');
const ip = require('ip');
const flatten = require('lodash.flatten');
const intercept = require('intercept-stdout');
const { Tracker } = require('node-moving-things-tracker');
const cloneDeep = require('lodash.clonedeep');
const Opendatacam = require('./server/Opendatacam');
const { getURLData } = require('./server/utils/urlHelper');
const FileSystemManager = require('./server/fs/FileSystemManager');
const { MjpegProxy } = require('./server/utils/mjpegproxy');
const config = require('./config.json');
const configHelper = require('./server/utils/configHelper');
const GpsTracker = require('./server/tracker/GpsTracker');
const packageJson = require('./package.json');
const { YoloDarknet } = require('./server/processes/YoloDarknet');
const { MongoDbManager } = require('./server/db/MongoDbManager');

if (packageJson.version !== config.OPENDATACAM_VERSION) {
  console.log('-----------------------------------');
  console.log('- ERROR Config.json version doesn\'t match Opendatacam package.json version -');
  console.log(`- Use a config.json file version matching: ${process.env.npm_package_version}`);
  console.log('-----------------------------------');
  process.exit(1);
}

const port = parseInt(process.env.PORT, 10) || configHelper.getAppPort();
const dev = process.env.NODE_ENV !== 'production';
const app = next({ dev });
const handle = app.getRequestHandler();

// Log config loaded
console.log('-----------------------------------');
console.log('-     Opendatacam initialized     -');
console.log('- Config loaded:                  -');
console.log(JSON.stringify(config, null, 2));
console.log('-----------------------------------');

// Initial YOLO config
const yoloConfig = {
  yoloParams: config.NEURAL_NETWORK_PARAMS[config.NEURAL_NETWORK],
  videoType: config.VIDEO_INPUT,
  videoParams: config.VIDEO_INPUTS_PARAMS[config.VIDEO_INPUT],
  jsonStreamPort: configHelper.getJsonStreamPort(),
  mjpegStreamPort: configHelper.getMjpegStreamPort(),
  darknetPath: config.PATH_TO_YOLO_DARKNET,
  darknetCmd: config.CMD_TO_YOLO_DARKNET,
};
if (config.VIDEO_INPUT === 'simulation') {
  yoloConfig.darknetPath = '.';
  yoloConfig.darknetCmd = 'node scripts/YoloSimulation.js';
  if (yoloConfig.yoloParams === undefined) {
    yoloConfig.yoloParams = {
      data: 'data',
      cfg: 'cfg',
      weights: 'weights',
    };
  }
}
const YOLO = new YoloDarknet(yoloConfig);

// Select tracker, based on GPS settings in config
let tracker = Tracker;
const isGpsEnabled = config.GPS && config.GPS.enabled === true;
if (isGpsEnabled) {
  tracker = new GpsTracker(Tracker, config.GPS);
}
// Set tracker params
if (config.TRACKER_SETTINGS) {
  const trackerParams = {};
  const paramKeys = ['iouLimit',
    'unMatchedFrameTolerance',
    'fastDelete',
    'distanceFunc',
    'distanceLimit'];

  paramKeys.forEach((key) => {
    if (key in config.TRACKER_SETTINGS) {
      trackerParams[key] = config.TRACKER_SETTINGS[key];
    }
  });

  tracker.setParams(trackerParams);
}
Opendatacam.setTracker(tracker);

// Init connection to db
let dbManager = null;
if (config.DATABASE === 'mongo') {
  const mongoUrl = config.DATABASE_PARAMS.mongo.url;
  dbManager = new MongoDbManager(mongoUrl);
}

if (dbManager !== null) {
  dbManager.connect().then(
    () => {
      console.log('Success init db');
    },
    (err) => {
      console.error(err);
    },
  );
  Opendatacam.setDatabase(dbManager);
} else {
  console.warn('No or unknown database configured.');
}

let stdoutBuffer = '';
let stdoutInterval = '';
const bufferLimit = 30000;
intercept((text) => {
  const stdoutText = text.toString();
  stdoutBuffer += stdoutText;
  stdoutInterval += stdoutText;

  // Keep buffer maximum to 10000 characters
  if (stdoutBuffer.length > bufferLimit) {
    stdoutBuffer = stdoutBuffer.substring(stdoutBuffer.length - bufferLimit, stdoutBuffer.length);
  }
});

app.prepare()
  .then(() => {
    // Start HTTP server
    const server = http.createServer(express);
    express.use(bodyParser.json());

    // TODO add compression: https://github.com/expressjs/compression

    // This render pages/index.js for a request to /
    express.get('/', (req, res) => {
      YOLO.start(); // Inside yolo process will check is started

      const urlData = getURLData(req);
      Opendatacam.listenToYOLO(YOLO, urlData);

      return app.render(req, res, '/');
    });

    /**
     * @api {get} /start Start Opendatacam
     * @apiName Start
     * @apiGroup Opendatacam
     *
     * @apiDescription Start opendatacam without loading the UI
     *
     * This will start the YOLO process on the video input stream
     *
     * @apiSuccessExample Success-Response:
     *  HTTP/1.1 200 OK
     *
     */
    express.get('/start', (req, res) => {
      YOLO.start(); // Inside yolo process will check is started
      const urlData = getURLData(req);
      Opendatacam.listenToYOLO(YOLO, urlData);
      res.sendStatus(200);
    });

    let mjpgProxy = null;
    /**
     * @api {get} /webcam/stream Stream (MJPEG)
     * @apiName Stream
     * @apiGroup Webcam
     *
     * @apiDescription Limitation: Only available after YOLO has started
     *
     * This endpoint streams the webcam as a MJPEG stream. (streams the sequence of JPEG frames
     * over HTTP). The TCP connection is not closed as long as the client wants to receive new
     * frames and the server wants to provide new frames
     *
     * More on MJPEG over HTTP: https://en.wikipedia.org/wiki/Motion_JPEG#M-JPEG_over_HTTP
     */
    express.get('/webcam/stream', (req, res) => {
    // Proxy MJPEG stream from darknet to avoid freezing issues
      if (mjpgProxy == null) {
        const urlData = getURLData(req);
        mjpgProxy = new MjpegProxy(`http://${urlData.address}:${config.PORTS.darknet_mjpeg_stream}`);
      }
      return mjpgProxy.proxyRequest(req, res);
    });

    /**
     * @api {get} /webcam/resolution Resolution
     * @apiName Resolution
     * @apiGroup Webcam
     *
     * @apiDescription Limitation: Only available after YOLO has started
     *
     * @apiSuccessExample {json} Success Response:
     *     {
     *       "w": 1280,
     *       "h": 720
     *     }
     */
    express.get('/webcam/resolution', (req, res) => {
      res.json(YOLO.videoResolution);
    });

    let consoleRes = null;
    let consoleInterval = null;
    /**
     * @api {get} /console Console
     * @apiName Console
     * @apiGroup Helper
     *
     * @apiDescription Send the last 3000 characters of the server **stoud**
     *
     * @apiSuccessExample Response
     *    Ready on http://localhost:8080 > Ready on http://192.168.0.195:8080
     */
    express.get('/console', (req, res) => {
      if (consoleRes) {
        console.log('New client, close previous stream');
        consoleRes.end();
        if (consoleInterval) {
          clearInterval(consoleInterval);
        }
      } else {
        console.log('First request on console stream');
      }
      consoleRes = res;
      consoleRes.write(stdoutBuffer);

      consoleInterval = setInterval(() => {
        consoleRes.write(stdoutInterval);
        stdoutInterval = '';
      }, 2000);
    });

    /**
     * @api {post} /counter/areas Register areas
     * @apiName Register areas
     * @apiGroup Counter
     *
     * @apiDescription Send counter areas definition to server
     *
     * It will replace all current counter areas (doesn't update a specific one)
     *
     * If you want to remove all counter areas, send an empty object
     *
     * @apiParam {Object} points Array of coordinates reprensenting the counting area (if two points it is a line, if more than two, it is a polygon)
     * @apiParam {Object} refResolution Resolution of client side canvas where the line is drawn
     * @apiParam {string="bidirectional","leftright_topbottom", "rightleft_bottomtop","polygon"} type Type of counting area ["bidirectional","leftright_topbottom", "rightleft_bottomtop"] applies for a line, "polygon" applies for polygon
     *
     * @apiParamExample {json} Request Example:
     *     {
              "countingAreas": {
                "cc8354b6-d8ec-41d3-ab12-38ced6811f7c": {
                  "color": "yellow",
                  "type": "polygon",
                  "computed": {
                    "lineBearings": [
                      82.77568288711024,
                      262.77568288711024
                    ]
                  },
                  "location": {
                    "points": [
                      {
                        "x": 176.8421173095703,
                        "y": 514.7368774414062
                      },
                      {
                        "x": 475.78948974609375,
                        "y": 476.8421325683594
                      },
                      {
                        "x": 586.3157958984375,
                        "y": 582.1052856445312
                      },
                      {
                        "x": 174.73684692382812,
                        "y": 609.4736938476562
                      },
                      {
                        "x": 176.8421173095703,
                        "y": 514.7368774414062
                      }
                    ],
                    "refResolution": {
                      "w": 862,
                      "h": 746
                    }
                  },
                  "name": "test"
                },
                "a26acb82-4585-48d8-80ec-ef22247f0d7f": {
                  "color": "turquoise",
                  "type": "bidirectional",
                  "computed": {
                    "lineBearings": [
                      80.97686627298364,
                      260.97686627298367
                    ]
                  },
                  "location": {
                    "points": [
                      {
                        "x": 178.94737243652344,
                        "y": 448.42108154296875
                      },
                      {
                        "x": 424.2105407714844,
                        "y": 409.47369384765625
                      }
                    ],
                    "refResolution": {
                      "w": 862,
                      "h": 746
                    }
                  },
                  "name": "test"
                }
              }
            }
     * @apiSuccessExample Success-Response:
     *   HTTP/1.1 200 OK
     */
    express.post('/counter/areas', (req, res) => {
      Opendatacam.registerCountingAreas(req.body.countingAreas);
      res.sendStatus(200);
    });

    /**
     * @api {get} /counter/areas Get areas
     * @apiName Get counter areas
     * @apiGroup Counter
     *
     * @apiDescription Get counter areas defined
     *
     * @apiSuccess {Object} location Two points defining the counting line, along with reference frame resolution
     * @apiSuccess {String} color Color of the area (defined in config.json)
     * @apiSuccess {String} name Name of the area
     * @apiSuccess {string="bidirectional","leftright_topbottom", "rightleft_bottomtop","polygon"} type Type of counting area ["bidirectional","leftright_topbottom", "rightleft_bottomtop"] applies for a line, "polygon" applies for polygon
     * @apiSuccess {Object} computed Computed linear function representing the counting line (used by the counting algorithm)
     * @apiSuccessExample {json} Response
     *  {
          "cc8354b6-d8ec-41d3-ab12-38ced6811f7c": {
            "color": "yellow",
            "type": "polygon",
            "location": {
              "points": [
                {
                  "x": 176.8421173095703,
                  "y": 514.7368774414062
                },
                {
                  "x": 475.78948974609375,
                  "y": 476.8421325683594
                },
                {
                  "x": 586.3157958984375,
                  "y": 582.1052856445312
                },
                {
                  "x": 174.73684692382812,
                  "y": 609.4736938476562
                },
                {
                  "x": 176.8421173095703,
                  "y": 514.7368774414062
                }
              ],
              "refResolution": {
                "w": 862,
                "h": 746
              }
            },
            "name": "test"
          },
          "a26acb82-4585-48d8-80ec-ef22247f0d7f": {
            "color": "turquoise",
            "type": "bidirectional",
            "computed": {
              "lineBearings": [
                84.10716225471819,
                264.1071622547182
              ],
              "point1": {
                "x": 265.7223163790603,
                "y": -432.79246475996985
              },
              "point2": {
                "x": 629.9182043938515,
                "y": -395.2024927215985
              },
              "points": [
                {
                  "x": 265.7223163790603,
                  "y": -432.79246475996985
                },
                {
                  "x": 629.9182043938515,
                  "y": -395.2024927215985
                }
              ]
            },
            "location": {
              "points": [
                {
                  "x": 178.94737243652344,
                  "y": 448.42108154296875
                },
                {
                  "x": 424.2105407714844,
                  "y": 409.47369384765625
                }
              ],
              "refResolution": {
                "w": 862,
                "h": 746
              }
            },
            "name": "test"
          }
        }
     *
     */
    express.get('/counter/areas', (req, res) => {
      res.json(Opendatacam.getCountingAreas());
    });

    // Maybe Remove the need for dependency with direct express implem:
    // https://github.com/expressjs/compression#server-sent-events
    /**
     * @api {get} /tracker/sse Tracker data
     * @apiName Data
     * @apiGroup Tracker
     *
     * @apiDescription From the browser, you can open a SSE (Server side event) connection to get
     * data from Opendatacan on each frame.
     *
     * **How to open an SSE connexion**
     *
     * ```let eventSource = new EventSource("/tracker/sse")```
     *
     * **How to get data on each frame**
     *
     * ```eventSource.onmessage = (msg) => { let message = JSON.parse(msg.data); }```
     *
     * Then it works like websocket but only the server can push data.
     *
     * *Limitation: Only support one client at a time, if another one connect, the first SSE
     * connection is closed*
     *
     * More doc on server side event, read
     * [What are Server Side Events](https://medium.com/axiomzenteam/websockets-http-2-and-sse-5c24ae4d9d96)
     *
     * @apiSuccessExample {json} Frame example (once parsed to JSON):
     *  {
          "trackerDataForLastFrame": {
            "frameIndex": 4646,
            "data": [
              {
                "id": 5,
                "x": 340,
                "y": 237,
                "w": 60,
                "h": 45,
                "bearing": 103,
                "name": "car",
                "countingDeltas": {
                  "94afa4f8-1d24-4011-a481-ad3036e959b4": 349.8589833356673
                }
              },
              {
                "id": 6,
                "x": 449,
                "y": 306,
                "w": 95,
                "h": 72,
                "bearing": 219,
                "name": "car",
                "countingDeltas": {
                  "94afa4f8-1d24-4011-a481-ad3036e959b4": 273.532278392382
                }
              }
            ]
          },
          "counterSummary": {
            "94afa4f8-1d24-4011-a481-ad3036e959b4": {
              "car": 43,
              "_total": 43
            }
          },
          "trackerSummary": {
            "totalItemsTracked": 222
          },
          "videoResolution": {
            "w": 1280,
            "h": 720
          },
          "appState": {
            "yoloStatus": {
              "isStarting": true,
              "isStarted": false
            },
            "isListeningToYOLO": true,
            "recordingStatus": {
              "isRecording": true,
              "currentFPS": 13,
              "recordingId": "5cc3400252340f451cd7397a",
              "dateStarted": "2019-04-26T17:29:38.190Z"
            }
          }
        }
     *
     */
    express.get('/tracker/sse', sse, (req, res) => {
      Opendatacam.addStreamClient(res);
    });

    /**
     * @api {get} /recording/start Start recording
     * @apiName Start
     * @apiGroup Recording
     *
     * @apiDescription Start recording (persisting tracker data and counting data to db)
     *
     * @apiSuccessExample Success-Response:
     *   HTTP/1.1 200 OK
     */
    express.get('/recording/start', (req, res) => {
      if (YOLO.isLive()) {
        Opendatacam.startRecording();
      } else {
        Opendatacam.requestFileRecording(YOLO);
      }
      res.sendStatus(200);
    });

    /**
     * @api {get} /recording/stop Stop recording
     * @apiName Stop
     * @apiGroup Recording
     *
     * @apiDescription Stop recording
     *
     * @apiSuccessExample Success-Response:
     *   HTTP/1.1 200 OK
     */
    express.get('/recording/stop', (req, res) => {
      Opendatacam.stopRecording();
      res.sendStatus(200);
    });

    /**
     * @api {get} /recordings?offset=:offset&limit=:limit List
     * @apiName List recordings
     * @apiGroup Recordings
     *
     * @apiParam {Number} [limit=20] Limit of recordings in the response
     * @apiParam {Number} [offset=0] Skipped recordings
     *
     * @apiDescription Get list of all recording ordered by latest date
     *
     *
     * @apiSuccess {String} id recordingId you will use to fetch more data on a specific recording
     * @apiSuccess {String} dateStart recording start date
     * @apiSuccess {String} dateEnd recording end date
     * @apiSuccess {Object} areas Areas defined in this recording (see Counter -> Get areas for documentation)
     * @apiSuccess {Object} counterSummary For each area, nb items counted
     * @apiSuccess {Object} trackerSummary Total tracked items for all the recording
     * @apiSuccessExample {json} Success Response:
     *    {
            "offset": 0,
            "limit": 1,
            "total": 51,
            "recordings": [
              {
                "_id": "5cc3400252340f451cd7397a",
                "dateStart": "2019-04-26T17:29:38.190Z",
                "dateEnd": "2019-04-26T17:32:14.563Z",
                "areas": {
                  "94afa4f8-1d24-4011-a481-ad3036e959b4": {
                    "color": "yellow",
                    "location": {
                      "point1": {
                        "x": 241,
                        "y": 549
                      },
                      "point2": {
                        "x": 820,
                        "y": 513
                      },
                      "refResolution": {
                        "w": 1280,
                        "h": 666
                      }
                    },
                    "name": "test",
                    "computed": {
                      "a": 0.06721747654390149,
                      "b": -609.7129253605938
                    }
                  }
                },
                "counterSummary": {
                  "94afa4f8-1d24-4011-a481-ad3036e959b4": {
                    "car": 111,
                    "_total": 111
                  }
                },
                "trackerSummary": {
                  "totalItemsTracked": 566
                }
              }
            ]
     *    }
     *
     */
    express.get('/recordings', (req, res) => {
      const limit = parseInt(req.query.limit, 10) || 20;
      const offset = parseInt(req.query.offset, 10) || 0;

      const recordingPromise = dbManager.getRecordings(limit, offset);
      const countPromise = dbManager.getRecordingsCount();

      Promise.all([recordingPromise, countPromise]).then((values) => {
        res.json({
          offset,
          limit,
          total: values[1],
          recordings: values[0],
        });
      });
    });

    /**
     * @api {get} /recording/:id/tracker Tracker data
     * @apiName Tracker data
     * @apiGroup Recording
     *
     * @apiDescription Get tracker data for a specific recording **(can be very large as it returns
     * all the data for each frame)**
     *
     * @apiParam {String} id Recording id (id field of GET /recordings endpoint)
     *
     * @apiSuccess {String} recordingId Corresponding recordingId of this tracker recorded frame
     * @apiSuccess {String} timestamp Frame date
     * @apiSuccess {Object[]} objects All objects tracked on this frame
     * @apiSuccess {Number} id Unique id of the object
     * @apiSuccess {Number} x Position center bbox (coordinate system 0,0 is top left of frame)
     * @apiSuccess {Number} y Position center bbox (coordinate system 0,0 is top left of frame)
     * @apiSuccess {Number} w Width of the object
     * @apiSuccess {Number} h Height of the object
     * @apiSuccess {Number} bearing [0-360] Direction where the object is heading (in degree, ex: 0 degree means heading toward top of the frame, 180 towards bottom)
     * @apiSuccess {String} name Class of the object
     *
     * @apiSuccessExample {json} Success Response:
     *     [
     *      {
              "_id": "5cc3400252340f451cd7397c",
              "recordingId": "5cc3400252340f451cd7397a",
              "timestamp": "2019-04-26T17:29:38.301Z",
              "objects": [
                {
                  "id": 5,
                  "x": 351,
                  "y": 244,
                  "w": 68,
                  "h": 51,
                  "bearing": 350,
                  "name": "car"
                },
                {
                  "id": 6,
                  "x": 450,
                  "y": 292,
                  "w": 78,
                  "h": 67,
                  "bearing": 28,
                  "name": "car"
                }
              ]
            }
          ]
     */
    express.get('/recording/:id/tracker', (req, res) => {
      dbManager.getTrackerHistoryOfRecording(req.params.id).then((trackerData) => {
        res.setHeader('Content-Type', 'application/json');
        res.setHeader('Content-disposition',
          `attachment; filename=trackerData-${req.params.id}.json`);
        res.json(trackerData);
      });
    });

    /**
     * @api {get} /recording/:id Get recording
     * @apiName Get recording
     * @apiGroup Recording
     *
     * @apiDescription Get recording details
     *
     * @apiParam {String} id Recording id (id field of /recordings)
     *
     * @apiSuccess {videoResolution} Frame resolution
     * @apiSuccessExample {json} Success Response:
     *
        {
          "counterSummary": {
            "c1cb4701-0a6e-4350-bb05-f35b56b550a6": {
              "_total": 1,
              "car": 1
            }
          },
          "trackerSummary": {
            "totalItemsTracked": 36
          },
          "_id": "5d1cb11e445cae3654e2274a",
          "dateStart": "2019-07-03T13:43:58.602Z",
          "dateEnd": "2019-07-03T13:44:01.463Z",
          "videoResolution": {
            "w": 1280,
            "h": 720
          }
        }
     */
    express.get('/recording/:id', (req, res) => {
      dbManager.getRecording(req.params.id).then((recordingData) => {
        res.json(recordingData);
      });
    });

    /**
     * @api {delete} /recording/:id Delete recording
     * @apiName Delete recording
     * @apiGroup Recording
     *
     * @apiDescription Delete recording
     *
     * @apiParam {String} id Recording id (id field of /recordings)
     *
     * @apiSuccessExample Success-Response:
     *   HTTP/1.1 200 OK
     */
    express.delete('/recording/:id', (req, res) => {
      dbManager.deleteRecording(req.params.id).then(() => {
        res.sendStatus(200);
      });
    });

    /**
     * @api {get} /recording/:id/counter Counter data
     * @apiName Counter data
     * @apiGroup Recording
     *
     * @apiDescription Get counter data for a specific recording
     *
     * @apiParam {String} id Recording id (id field of GET /recordings)
     *
     * @apiSuccess {String} id recordingId you will use to fetch more data on a specific recording
     * @apiSuccess {String} dateStart recording start date
     * @apiSuccess {String} dateEnd recording end date
     * @apiSuccess {Object} areas Areas defined in this recording (see Counter -> Get areas for documentation)
     * @apiSuccess {Object} counterSummary For each area, nb items counted
     * @apiSuccess {Object} trackerSummary Total tracked items for all the recording
     * @apiSuccess {Object} counterHistory Details of all items that have been counted
     *
     * @apiSuccessExample {json} Success Response:
     *     [
            {
              "_id": "5cc3400252340f451cd7397a",
              "dateStart": "2019-04-26T17:29:38.190Z",
              "dateEnd": "2019-04-26T17:32:14.563Z",
              "areas": {
                "94afa4f8-1d24-4011-a481-ad3036e959b4": {
                  "color": "yellow",
                  "location": {
                    "point1": {
                      "x": 241,
                      "y": 549
                    },
                    "point2": {
                      "x": 820,
                      "y": 513
                    },
                    "refResolution": {
                      "w": 1280,
                      "h": 666
                    }
                  },
                  "name": "test",
                  "computed": {
                    "a": 0.06721747654390149,
                    "b": -609.7129253605938,
                    "lineBearings": [
                      151.14243038407085,
                      331.14243038407085
                    ]
                  }
                }
              },
              "counterSummary": {
                "94afa4f8-1d24-4011-a481-ad3036e959b4": {
                  "car": 111,
                  "_total": 111
                }
              },
              "trackerSummary": {
                "totalItemsTracked": 566
              },
              "counterHistory": [
                [
                  {
                    "timestamp": "2019-04-26T17:29:38.811Z",
                    "area": "94afa4f8-1d24-4011-a481-ad3036e959b4",
                    "name": "car",
                    "id": 1021
                    "bearing": 155,
                    "countingDirection": "rightleft_bottomtop"
                  }
                ],
                [
                  {
                    "timestamp": "2019-04-26T17:29:40.338Z",
                    "area": "94afa4f8-1d24-4011-a481-ad3036e959b4",
                    "name": "car",
                    "id": 1030,
                    "bearing": 155,
                    "countingDirection": "rightleft_bottomtop"
                  }
                ]
            }
          ]
     */
    express.get('/recording/:id/counter', (req, res) => {
      dbManager.getCounterHistoryOfRecording(req.params.id).then((counterData) => {
        if(Object.keys(counterData).length === 0) {
          res.sendStatus(404);
          return;
        }

        res.setHeader('Content-Type', 'application/json');
        const startDate = counterData.dateStart.toISOString().split('T')[0];
        const fileName = `counterData-${startDate}-${req.params.id}.json`;
        res.setHeader('Content-disposition', `attachment; filename=${fileName}`);
        res.json(counterData);
      }).catch((reason) => {
        console.log('Getting counter records failed');
        console.log(reason);
        res.sendStatus(500);
      });
    });

    /**
     * @api {get} /recording/:id/counter/csv Counter history (CSV)
     * @apiName Counter history (CSV)
     * @apiGroup Recording
     *
     * @apiDescription Get counter history data as CSV file
     *
     * @apiParam {String} id Recording id (id field of /recordings)
     *
     * @apiSuccessExample {csv} Success Response:
     *    "Timestamp","Counter area","ObjectClass","UniqueID","CountingDirection"
     *    "2019-05-02T19:10:22.150Z","blabla","car",4096,"rightleft_bottomtop"
          "2019-05-02T19:10:23.658Z","truc","car",4109,"rightleft_bottomtop"
          "2019-05-02T19:10:26.728Z","truc","car",4126,"rightleft_bottomtop"
          "2019-05-02T19:10:26.939Z","blabla","car",4099,"leftright_topbottom"
          "2019-05-02T19:10:28.997Z","test","car",4038,"leftright_topbottom"
          "2019-05-02T19:10:29.495Z","blabla","car",4135,"rightleft_bottomtop"
          "2019-05-02T19:10:29.852Z","truc","car",4122,"rightleft_bottomtop"
          "2019-05-02T19:10:32.070Z","blabla","car",4134,"rightleft_bottomtop"
          "2019-05-02T19:10:34.144Z","truc","car",4151,"rightleft_bottomtop"
          "2019-05-02T19:10:36.925Z","truc","car",4156,"rightleft_bottomtop"
     */
    express.get('/recording/:id/counter/csv', (req, res) => {
      dbManager.getCounterHistoryOfRecording(req.params.id).then((counterData) => {
        let data = counterData.counterHistory;
        if (data) {
        // Flatten
          data = flatten(data);
          // Map counting area name
          data = data.map((countedItem) => {
            const ret = {
              ...countedItem,
              timestamp: countedItem.timestamp.toISOString(),
              area: counterData.areas[countedItem.area].name,
            };

            // Adds GPS export fields to CSV
            if (isGpsEnabled) {
            // Links
              const isExportOsmLink = config.GPS && config.GPS.csvExportOpenStreetMapsUrl === true;
              if (isExportOsmLink) {
                const isLatLonPresent = countedItem.lat !== null && countedItem.lon !== null;
                if (isLatLonPresent) {
                  ret.link = `https://www.openstreetmap.org/?mlat=${countedItem.lat}&mlon=${countedItem.lon}#map=19/${countedItem.lat}/${countedItem.lon}`;
                } else {
                  ret.link = null;
                }
              }

              // Timestamp
              const isGpsTimestampPresent = countedItem.gpsTimestamp !== null;
              if (isGpsTimestampPresent) {
                ret.gpsTimestamp = countedItem.gpsTimestamp.toISOString();
              }
            }

            return ret;
          });
        } else {
          data = [];
        }
        console.log(`Exporting ${req.params.id} counter history to CSV`);
        const startDate = counterData.dateStart.toISOString().split('T')[0];
        const fileName = `counterData-${startDate}-${req.params.id}.csv`;
        res.csv(data, true, { 'Content-disposition': `attachment; filename=${fileName}` });
      });
    });

    /**
     * @api {get} /status Status
     * @apiName Status
     * @apiGroup Helper
     *
     * @apiDescription Return opendatacam status (isRecording, recordingId etc etc)
     *
     * @apiSuccessExample {json} Success Response:
     *
     * {
        "counterSummary": {
          "22d35d27-7d73-4f54-a99c-a3391f5c1c46": {
            "_total": 4,
            "car": 4
          }
        },
        "trackerSummary": {
          "totalItemsTracked": 201
        },
        "videoResolution": {
          "w": 1280,
          "h": 720
        },
        "appState": {
          "yoloStatus": {
            "isStarting": true,
            "isStarted": false
          },
          "isListeningToYOLO": true,
          "recordingStatus": {
            "isRecording": true,
            "currentFPS": 29,
            "recordingId": "5cf6bf29d19529238c17affb",
            "dateStarted": "2019-06-04T18:57:45.169Z"
          }
        }
      }
     */
    express.get('/status', (req, res) => {
      res.json(Opendatacam.getStatus());
    });

    /**
     * @api {get} /config Config
     * @apiName Config
     * @apiGroup Helper
     *
     * @apiDescription Get config.json content loaded by Opendatacam
     *
     * @apiSuccessExample {json} Success Response:
     * {
        "OPENDATACAM_VERSION": "3.0.1",
        "PATH_TO_YOLO_DARKNET": "/darknet",
        "VIDEO_INPUT": "TO_REPLACE_VIDEO_INPUT",
        "NEURAL_NETWORK": "TO_REPLACE_NEURAL_NETWORK",
        "VIDEO_INPUTS_PARAMS": {
          "file": "opendatacam_videos/demo.mp4",
          "usbcam": "v4l2src device=/dev/video0 ! video/x-raw, framerate=30/1, width=640, height=360 ! videoconvert ! appsink",
          "experimental_raspberrycam_docker": "v4l2src device=/dev/video2 ! video/x-raw, framerate=30/1, width=640, height=360 ! videoconvert ! appsink",
          "raspberrycam_no_docker": "nvarguscamerasrc ! video/x-raw(memory:NVMM),width=1280, height=720, framerate=30/1, format=NV12 ! nvvidconv ! video/x-raw, format=BGRx, width=640, height=360 ! videoconvert ! video/x-raw, format=BGR ! appsink",
          "remote_cam": "YOUR IP CAM STREAM (can be .m3u8, MJPEG ...), anything supported by opencv"
        },
        "VALID_CLASSES": [
          "*"
        ],
        "DISPLAY_CLASSES": [
          {
            "class": "bicycle",
            "icon": "1F6B2.svg"
          },
          {
            "class": "person",
            "icon": "1F6B6.svg"
          },
          {
            "class": "truck",
            "icon": "1F69B.svg"
          },
          {
            "class": "motorbike",
            "icon": "1F6F5.svg"
          },
          {
            "class": "car",
            "icon": "1F697.svg"
          },
          {
            "class": "bus",
            "icon": "1F68C.svg"
          }
        ],
        "PATHFINDER_COLORS": [
          "#1f77b4",
          "#ff7f0e",
          "#2ca02c",
          "#d62728",
          "#9467bd",
          "#8c564b",
          "#e377c2",
          "#7f7f7f",
          "#bcbd22",
          "#17becf"
        ],
        "COUNTER_COLORS": {
          "yellow": "#FFE700",
          "turquoise": "#A3FFF4",
          "green": "#a0f17f",
          "purple": "#d070f0",
          "red": "#AB4435"
        },
        "NEURAL_NETWORK_PARAMS": {
          "yolov4": {
            "data": "cfg/coco.data",
            "cfg": "cfg/yolov4-416x416.cfg",
            "weights": "yolov4.weights"
          },
          "yolov4-tiny": {
            "data": "cfg/coco.data",
            "cfg": "cfg/yolov4-tiny.cfg",
            "weights": "yolov4-tiny.weights"
          }
        },
        "TRACKER_ACCURACY_DISPLAY": {
          "nbFrameBuffer": 300,
          "settings": {
            "radius": 3.1,
            "blur": 6.2,
            "step": 0.1,
            "gradient": {
              "1": "red",
              "0.4": "orange"
            },
            "canvasResolutionFactor": 0.1
          }
        },
        "MONGODB_URL": "mongodb://127.0.0.1:27017"
      }
     *
     */
    express.get('/config', (req, res) => {
    // console.log(config);
      res.json(config);
    });

    // API to read opendatacam_videos directory and return list of videos available
    // TODO JSDOC
    // Get video files available in opendatacam_videos directory
    express.get('/files', (req, res) => {
      FileSystemManager.getFiles().then((files) => {
        res.json(files);
      }, (error) => {
        res.sendStatus(500).send(error);
      });
    });

    const storage = multer.diskStorage({
      destination(req, file, cb) {
        cb(null, FileSystemManager.getFilesDirectoryPath());
      },
      filename(req, file, cb) {
        cb(null, file.originalname);
      },
    });
    const uploadMulter = multer({
      storage,
      fileFilter(req, file, cb) {
        if (file.originalname.match(/\.(mp4|avi|mov)$/)) {
          cb(null, true);
        } else {
          cb(new Error('Only video files are allowed!'));
        }
      },
    }).single('video');

    // API to Upload file and restart yolo on that file
    // TODO JSDOC
    // TODO Only upload file here and then add another endpoint to restart YOLO on a given file
    express.post('/files', (req, res) => {
      uploadMulter(req, res, (err) => {
        console.log('uploadMulter callback');
        if (err) {
          console.log(err);
          res.sendStatus(500);
          return;
        }

        // Everything went fine.
        console.log('File upload done');

        // Restart YOLO
        console.log('Stop YOLO');
        Opendatacam.stopRecording();
        YOLO.stop().then(() => {
          console.log('YOLO stopped');
          // TODO set run on file
          console.log(req.file.path);

          const yoloConfigClone = cloneDeep(yoloConfig);
          yoloConfigClone.videoParams = req.file.path;
          yoloConfigClone.videoType = 'file';
          YOLO.init(yoloConfigClone);

          YOLO.start();
          Opendatacam.recordingStatus.filename = req.file.filename;
        }, (error) => {
          console.log('YOLO does not stop');
          console.log(error);
        });

        res.json(req.file.path);
      });
    });

    /**
     * @api {post} /ui Save UI settings
     * @apiName  Save UI settings
     * @apiGroup Helper
     *
     * @apiDescription Save UI settings
     *
     * Through this api you can persist some UI settings like whether counter and pathfinder
     * features are enabled
     *
     *
     * @apiParam {Boolean} counterEnabled If counter feature is enabled
     * @apiParam {Boolean} pathfinderEnabled If pathfinder feature is enabled
     *
     * @apiParamExample {json} Request Example:
     *    {
            counterEnabled: true,
            pathfinderEnabled: true
          }
     * @apiSuccessExample Success-Response:
     *   HTTP/1.1 200 OK
     */
    express.post('/ui', (req, res) => {
      Opendatacam.setUISettings(req.body);
      res.sendStatus(200);
    });

    /**
     * @api {get} /ui Get UI settings
     * @apiName  Get UI settings
     * @apiGroup Helper
     *
     * @apiDescription Get UI settings
     *
     * Through this api you can get UI settings like whether counter and pathfinder features are
     * enabled
     *
     *
     * @apiSuccessExample {json} Success Response:
     *    {
            counterEnabled: true,
            pathfinderEnabled: true
          }
     */
    express.get('/ui', (req, res) => {
      const uiSettings = Opendatacam.getUISettings();
      res.json(uiSettings);
    });

    express.use('/api/doc', serveStatic('.build/apidoc'));

    // Global next.js handler
    express.get('*', (req, res) => handle(req, res));

    server.listen(port, (err) => {
      if (err) throw err;
      if (port === 80) {
        console.log('> Ready on http://localhost');
        console.log(`> Ready on http://${ip.address()}`);
      } else {
        console.log(`> Ready on http://localhost:${port}`);
        console.log(`> Ready on http://${ip.address()}:${port}`);
      }
    });
  });

// Clean up node.js process if opendatacam stops or crash

process.stdin.resume(); // so the program will not close instantly

function exitHandler(options, exitCode) {
  // if (options.cleanup) {
  Opendatacam.clean();
  // };
  if (exitCode || exitCode === 0) console.log(exitCode);
  if (options.exit) process.exit();
}

// do something when app is closing
process.on('exit', exitHandler.bind(null, { cleanup: true }));

// catches ctrl+c event
process.on('SIGINT', exitHandler.bind(null, { exit: true }));

// catches "kill pid" (for example: nodemon restart)
process.on('SIGUSR1', exitHandler.bind(null, { exit: true }));
process.on('SIGUSR2', exitHandler.bind(null, { exit: true }));

// catches uncaught exceptions
// process.on('uncaughtException', exitHandler.bind(null, {exit:true}));

process.on('uncaughtException', (err) => {
  // This should not happen
  console.log('Pheew ....! Something unexpected happened. This should be handled more '
    + 'gracefully. I am sorry. The culprit is: ', err);
});
