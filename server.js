const express = require('express')();
const csv = require('csv-express');
const bodyParser = require('body-parser');
const http = require('http');
const next = require('next');
const sse = require('server-sent-events');
const ip = require('ip');
const YOLO = require('./server/processes/YOLO');
const Opendatacam = require('./server/Opendatacam');
const cloneDeep = require('lodash.clonedeep');
const getURLData = require('./server/utils/urlHelper').getURLData;
const DBManager = require('./server/db/DBManager')
const MjpegProxy = require('mjpeg-proxy').MjpegProxy;

const SIMULATION_MODE = process.env.NODE_ENV !== 'production'; // When not running on the Jetson
// const SIMULATION_MODE = true;

const port = parseInt(process.env.PORT, 10) || 8080
const dev = process.env.NODE_ENV !== 'production'
const app = next({ dev })
const handle = app.getRequestHandler()

// Init processes
YOLO.init(true);

// Init connection to db
DBManager.init().then(
  () => {
    console.log('Success init db')
  },
  err => {
    console.error(err)
  }
)

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

    // Hacky way to pass params to getInitialProps on SSR
    // Should hydrate differently
    let query = req.query;
    query.countingAreas = Opendatacam.getCountingAreas();

    return app.render(req, res, '/', query)
  })

  // Proxy MJPEG stream from darknet to avoid freezing issues
  express.get('/webcamstream', (req, res) => {
    const urlData = getURLData(req);
    return new MjpegProxy(`http://${urlData.address}:8090`).proxyRequest(req, res);
  });

  express.post('/counter/areas', (req, res) => {
    Opendatacam.registerCountingAreas(req.body.countingAreas)
    res.sendStatus(200)
  });

  // Maybe Remove the need for dependency with direct express implem: https://github.com/expressjs/compression#server-sent-events
  express.get('/tracker/sse', sse, function(req, res) {
    Opendatacam.startStreamingData(res.sse);
  });

  express.get('/recording/start', (req, res) => {
    Opendatacam.startRecording();
    res.sendStatus(200)
  });

  express.get('/recording/stop', (req, res) => {
    Opendatacam.stopRecording();
    res.sendStatus(200)
  });

  express.get('/recording/history', (req, res) => {
    DBManager.getRecordings().then((recordings) => {
      res.json(recordings)
    });
  });

  express.get('/recording/:id/trackerhistory', (req, res) => {
    DBManager.getTrackerHistoryOfRecording(req.params.id).then((trackerData) => {
      res.json(trackerData);
      // res.setHeader('Content-disposition', 'attachment; filename= trackerData.json');
      // res.setHeader('Content-type', 'application/json');
      // res.write(JSON.stringify(trackerData), function (err) {
      //     res.end();
      // })
    });
  })

  express.get('/recording/:id/counterhistory', (req, res) => {
    DBManager.getCounterHistoryOfRecording(req.params.id).then((counterData) => {
      res.json(counterData);
      // res.setHeader('Content-disposition', 'attachment; filename= trackerData.json');
      // res.setHeader('Content-type', 'application/json');
      // res.write(JSON.stringify(trackerData), function (err) {
      //     res.end();
      // })
    });
  })

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