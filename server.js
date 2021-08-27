const express = require('express')();
const multer  = require('multer');
const serveStatic = require('serve-static')
const csv = require('csv-express');
const bodyParser = require('body-parser');
const http = require('http');
const next = require('next');
const sse = require('server-sent-events');
const ip = require('ip');
const YOLO = require('./server/processes/YOLO');
const Opendatacam = require('./server/Opendatacam');
const flatten = require('lodash.flatten');
const getURLData = require('./server/utils/urlHelper').getURLData;
const DBManager = require('./server/db/DBManager')
const FileSystemManager = require('./server/fs/FileSystemManager')
const MjpegProxy = require('./server/utils/mjpegproxy').MjpegProxy;
const intercept = require("intercept-stdout");
const config = require('./config.json');
const configHelper = require('./server/utils/configHelper')

if(process.env.npm_package_version !== config.OPENDATACAM_VERSION) {
  console.log('-----------------------------------')
  console.log(`- ERROR Config.json version doesn't match Opendatacam package.json version -`)
  console.log(`- Use a config.json file version matching: ${process.env.npm_package_version}`)
  console.log('-----------------------------------')
  return;
}

const SIMULATION_MODE = process.env.NODE_ENV !== 'production'; // When not running on the Jetson
// const SIMULATION_MODE = true;

const port = parseInt(process.env.PORT, 10) || configHelper.getAppPort()
const dev = process.env.NODE_ENV !== 'production'
const app = next({ dev })
const handle = app.getRequestHandler()

// Log config loaded
if(SIMULATION_MODE) {
  console.log('-----------------------------------')
  console.log('-     Opendatacam initialized     -')
  console.log('- IN SIMULATION MODE              -')
  console.log('-----------------------------------')
} else {
  console.log('-----------------------------------')
  console.log('-     Opendatacam initialized     -')
  console.log('- Config loaded:                  -')
  console.log(JSON.stringify(config, null, 2));
  console.log('-----------------------------------')
}

// Init processes
YOLO.init(SIMULATION_MODE);

// Init connection to db
DBManager.init().then(
  () => {
    console.log('Success init db')
  },
  err => {
    console.error(err)
  }
)

// TODO Move the stdout code into it's own module
var videoResolution = null;

if(SIMULATION_MODE) {
  videoResolution = {
    w: 1280,
    h: 720
  }
  Opendatacam.setVideoResolution(videoResolution)
}

var stdoutBuffer = "";
var stdoutInterval = "";
var bufferLimit = 30000;
var unhook_intercept = intercept(function(text) {
  var stdoutText = text.toString();
  // Hacky way to get the video resolution from YOLO
  // We parse the stdout looking for "Video stream: 640 x 480"
  // alternative would be to add this info to the JSON stream sent by YOLO, would need to send a PR to https://github.com/alexeyab/darknet
  if(stdoutText.indexOf('Video stream:') > -1) {
    var splitOnStream = stdoutText.toString().split("stream:")
    var ratio = splitOnStream[1].split("\n")[0];
    videoResolution = {
      w : parseInt(ratio.split("x")[0].trim()),
      h : parseInt(ratio.split("x")[1].trim())
    }
    Opendatacam.setVideoResolution(videoResolution);
  }
  stdoutBuffer += stdoutText;
  stdoutInterval += stdoutText;

  // Keep buffer maximum to 10000 characters
  if(stdoutBuffer.length > bufferLimit) {
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
    Opendatacam.listenToYOLO(urlData);

    return app.render(req, res, '/')
  })

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
    Opendatacam.listenToYOLO(urlData);
    res.sendStatus(200)
  });

  /**
   * @api {get} /webcam/stream Stream (MJPEG)
   * @apiName Stream
   * @apiGroup Webcam
   *
   * @apiDescription Limitation: Only available after YOLO has started
   *
   * This endpoint streams the webcam as a MJPEG stream. (streams the sequence of JPEG frames over HTTP).
   * The TCP connection is not closed as long as the client wants to receive new frames and the server wants to provide new frames
   * Only support one client at a time, if another one connect, the first HTTP connection is closed
   *
   * More on MJPEG over HTTP: https://en.wikipedia.org/wiki/Motion_JPEG#M-JPEG_over_HTTP
   *
  */
  express.get('/webcam/stream', (req, res) => {
    const urlData = getURLData(req);
    // Proxy MJPEG stream from darknet to avoid freezing issues
    return new MjpegProxy(`http://${urlData.address}:${config.PORTS.darknet_mjpeg_stream}`).proxyRequest(req, res);
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
  express.get('/webcam/resolution',  (req, res) => {
    res.json(videoResolution);
  })

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

  var consoleRes = null;
  var consoleInterval = null;
  express.get('/console',  (req, res) => {
    if(consoleRes) {
      console.log('New client, close previous stream')
      consoleRes.end();
      if(consoleInterval) {
        clearInterval(consoleInterval);
      }
    } else {
      console.log('First request on console stream')
    }
    consoleRes = res;
    consoleRes.write(stdoutBuffer);

    consoleInterval = setInterval(() => {
      consoleRes.write(stdoutInterval);
      stdoutInterval = "";
    }, 2000)
  })

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
   * @apiParam {Object} point1 First point of the counter line definition
   * @apiParam {Object} point2 Second point of the counter line definition
   * @apiParam {Object} refResolution Resolution of client side canvas where the line is drawn
   * @apiParam {string="bidirectional","leftright_topbottom", "rightleft_bottomtop"} Direction of counting, if object passes the other direction, it won't be counted
   *
   * @apiParamExample {json} Request Example:
   *     {
            "countingAreas": {
              "5287124a-4598-44e7-abaf-394018a7278b": {
                "color": "yellow",
                "location": {
                  "point1": {
                    "x": 221,
                    "y": 588
                  },
                  "point2": {
                    "x": 673,
                    "y": 546
                  },
                  "refResolution": {
                    "w": 1280,
                    "h": 666
                  }
                },
                "name": "Counter line 1",
                "type": "bidirectional"
              }
            }
          }
  * @apiSuccessExample Success-Response:
  *   HTTP/1.1 200 OK
  */
  express.post('/counter/areas', (req, res) => {
    Opendatacam.registerCountingAreas(req.body.countingAreas)
    res.sendStatus(200)
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
   * @apiSuccess {string="bidirectional","leftright_topbottom", "rightleft_bottomtop"} Direction of counting, if object passes the other direction, it won't be counted
   * @apiSuccess {Object} computed Computed linear function representing the counting line (used by the counting algorithm)
   * @apiSuccessExample {json} Response
   *  {
        "fbb8a65b-03cc-4c95-8d6f-663ac4bd9aa0": {
          "color": "yellow",
          "location": {
            "point1": {
              "x": 263,
              "y": 625
            },
            "point2": {
              "x": 472,
              "y": 615
            },
            "refResolution": {
              "w": 1500,
              "h": 871
            }
          },
          "name": "test",
          "type": "bidirectional",
          "computed": {
            "a": 0.046349957976037706,
            "b": -527.0496981416069,
            "lineBearings": [
              151.6353351530571,
              331.6353351530571
            ]
          }
        },
        "a684ad42-d6fe-4be4-b77b-09b8473cc487": {
          "color": "turquoise",
          "location": {
            "point1": {
              "x": 532,
              "y": 647
            },
            "point2": {
              "x": 729,
              "y": 641
            },
            "refResolution": {
              "w": 1500,
              "h": 871
            }
          },
          "name": "area 2",
          "type": "bidirectional",
          "computed": {
            "a": 0.029503983402006398,
            "b": -548.2275463758912,
            "lineBearings": [
              151.6353351530571,
              331.6353351530571
            ]
          }
        }
      }
   *
  */
  express.get('/counter/areas', (req, res) => {
    res.json(Opendatacam.getCountingAreas());
  })

  // Maybe Remove the need for dependency with direct express implem: https://github.com/expressjs/compression#server-sent-events
  /**
   * @api {get} /tracker/sse Tracker data
   * @apiName Data
   * @apiGroup Tracker
   *
   * @apiDescription From the browser, you can open a SSE (Server side event) connection to get data from Opendatacan on each frame.
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
   * *Limitation: Only support one client at a time, if another one connect, the first SSE connection is closed*
   *
   * More doc on server side event, read [What are SSE : Server Side Events](https://medium.com/axiomzenteam/websockets-http-2-and-sse-5c24ae4d9d96)
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
  express.get('/tracker/sse', sse, function(req, res) {
    Opendatacam.startStreamingData(res.sse);
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
    if(config.VIDEO_INPUT !== "file") {
      Opendatacam.startRecording();
    } else {
      Opendatacam.requestFileRecording()
    }
    res.sendStatus(200)
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
    res.sendStatus(200)
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
   * @apiSuccess {String} _id recordingId you will use to fetch more data on a specific recording
   * @apiSuccess {String} dateStart recording start date
   * @apiSuccess {String} dateEnd recording end date
   * @apiSuccess {Object} areas Areas defined in this recording (see Counter -> Get areas for documentation)
   * @apiSuccess {Object} counterSummary For each area, nb items counted
   * @apiSuccess {Object} trackerSummary Total tracked items for all the recording
   * @apiSuccessExample {json} Success Response:
   *    {
   *      "offset": 0,
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
    var limit = parseInt(req.query.limit, 10) || 20;
    var offset = parseInt(req.query.offset, 10) || 0;

    var recordingPromise = DBManager.getRecordings(limit, offset)
    var countPromise = DBManager.getRecordingsCount()

    Promise.all([recordingPromise, countPromise]).then((values) => {
      res.json({
        offset: offset,
        limit: limit,
        total: values[1],
        recordings: values[0]
      })
    })
  });

  /**
   * @api {get} /recording/:id/tracker Tracker data
   * @apiName Tracker data
   * @apiGroup Recording
   *
   * @apiDescription Get tracker data for a specific recording **(can be very large as it returns all the data for each frame)**
   *
   * @apiParam {String} id Recording id (_id field of GET /recordings endpoint)
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
    DBManager.getTrackerHistoryOfRecording(req.params.id).then((trackerData) => {
      res.json(trackerData);
      // res.setHeader('Content-disposition', 'attachment; filename= trackerData.json');
      // res.setHeader('Content-type', 'application/json');
      // res.write(JSON.stringify(trackerData), function (err) {
      //     res.end();
      // })
    });
  })

  /**
   * @api {get} /recording/:id Get recording
   * @apiName Get recording
   * @apiGroup Recording
   *
   * @apiDescription Get recording details
   *
   * @apiParam {String} id Recording id (_id field of /recordings)
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
  DBManager.getRecording(req.params.id).then((recordingData) => {
    res.json(recordingData)
  });
})

  /**
   * @api {delete} /recording/:id Delete recording
   * @apiName Delete recording
   * @apiGroup Recording
   *
   * @apiDescription Delete recording
   *
   * @apiParam {String} id Recording id (_id field of /recordings)
   *
   * @apiSuccessExample Success-Response:
  *   HTTP/1.1 200 OK
  */
  express.delete('/recording/:id', (req, res) => {
    DBManager.deleteRecording(req.params.id).then((success) => {
      res.sendStatus(200)
    });
  })

  /**
   * @api {get} /recording/:id/counter Counter data
   * @apiName Counter data
   * @apiGroup Recording
   *
   * @apiDescription Get counter data for a specific recording
   *
   * @apiParam {String} id Recording id (_id field of GET /recordings)
   *
   * @apiSuccess {String} _id recordingId you will use to fetch more data on a specific recording
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
    DBManager.getCounterHistoryOfRecording(req.params.id).then((counterData) => {
      res.json(counterData);
      // res.setHeader('Content-disposition', 'attachment; filename= trackerData.json');
      // res.setHeader('Content-type', 'application/json');
      // res.write(JSON.stringify(trackerData), function (err) {
      //     res.end();
      // })
    });
  })

  /**
   * @api {get} /recording/:id/counter/csv Counter history (CSV)
   * @apiName Counter history (CSV)
   * @apiGroup Recording
   *
   * @apiDescription Get counter history data as CSV file
   *
   * @apiParam {String} id Recording id (_id field of /recordings)
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
    DBManager.getCounterHistoryOfRecording(req.params.id).then((counterData) => {
      var data = counterData.counterHistory;
      if(data) {
        // Flatten
        data = flatten(data);
        // Map counting area name
        data = data.map((countedItem) => {
          return {
            ...countedItem,
            timestamp: countedItem.timestamp.toISOString(),
            area: counterData.areas[countedItem.area].name
          }
        })
      } else {
        data = [];
      }
      console.log(`Exporting ${req.params.id} counter history to CSV`);
      res.csv(data, false ,{'Content-disposition': `attachment; filename=counterData-${counterData.dateStart.toISOString().split("T")[0]}-${req.params.id}.csv`});
    });
  })

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
  })

  /**
   * @api {get} /config Config
   * @apiName Config
   * @apiGroup Helper
   *
   * @apiDescription Get config.json content loaded by Opendatacam
   *
   * @apiSuccessExample {json} Success Response:
   * {
      "OPENDATACAM_VERSION": "3.0.2",
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
  })

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


  var storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, FileSystemManager.getFilesDirectoryPath())
    },
    filename: function (req, file, cb) {
      cb(null, file.originalname)
    }
  })
  var uploadMulter = multer({
    storage: storage,
    fileFilter: function (req, file, cb) {
      if (!file.originalname.match(/\.(mp4|avi|mov)$/)) {
        return cb(new Error('Only video files are allowed!'));
      }
      cb(null, true);
    }
  }).single('video')

  // API to Upload file and restart yolo on that file
  // TODO JSDOC
  // TODO Only upload file here and then add another endpoint to restart YOLO on a given file
  express.post('/files', function (req, res, next) {
    uploadMulter(req, res, function (err) {
      console.log('uploadMulter callback')
      if(err) {
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
        YOLO.init(false, req.file.path);
        YOLO.start();
        Opendatacam.recordingStatus.filename = req.file.filename;
      },(error) => {
        console.log('YOLO does not stop')
        console.log(error);
      });

      res.json(req.file.path);



    })
  })




  /**
   * @api {post} /ui Save UI settings
   * @apiName  Save UI settings
   * @apiGroup Helper
   *
   * @apiDescription Save UI settings
   *
   * Through this api you can persist some UI settings like whether counter and pathfinder features are enabled
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
    Opendatacam.setUISettings(req.body)
    res.sendStatus(200)
  });

  /**
   * @api {get} /ui Get UI settings
   * @apiName  Get UI settings
   * @apiGroup Helper
   *
   * @apiDescription Get UI settings
   *
   * Through this api you can get UI settings like whether counter and pathfinder features are enabled
   *
   *
  * @apiSuccessExample {json} Success Response:
   *    {
          counterEnabled: true,
          pathfinderEnabled: true
        }
  */
 express.get('/ui', (req, res) => {
  var uiSettings = Opendatacam.getUISettings()
  res.json(uiSettings);
});

  express.use("/api/doc", serveStatic('apidoc'))

  // Global next.js handler
  express.get('*', (req, res) => {
    return handle(req, res)
  })



  server.listen(port, (err) => {
    if (err) throw err
    if (port === 80) {
      console.log(`> Ready on http://localhost`)
      console.log(`> Ready on http://${ip.address()}`)
    } else {
      console.log(`> Ready on http://localhost:${port}`)
      console.log(`> Ready on http://${ip.address()}:${port}`)
    }
  })
})


// Clean up node.js process if opendatacam stops or crash

process.stdin.resume(); //so the program will not close instantly

function exitHandler(options, exitCode) {
  // if (options.cleanup) {
  Opendatacam.clean();
  // };
  if (exitCode || exitCode === 0) console.log(exitCode);
  if (options.exit) process.exit();
}

//do something when app is closing
process.on('exit', exitHandler.bind(null,{cleanup:true}));

//catches ctrl+c event
process.on('SIGINT', exitHandler.bind(null, {exit:true}));

// catches "kill pid" (for example: nodemon restart)
process.on('SIGUSR1', exitHandler.bind(null, {exit:true}));
process.on('SIGUSR2', exitHandler.bind(null, {exit:true}));

//catches uncaught exceptions
// process.on('uncaughtException', exitHandler.bind(null, {exit:true}));


process.on('uncaughtException', function (err) {
  // This should not happen
  console.log("Pheew ....! Something unexpected happened. This should be handled more gracefully. I am sorry. The culprit is: ", err);
});
