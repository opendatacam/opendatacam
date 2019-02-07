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
const simulation30FPSDetectionsData = require('./static/placeholder/alexeydetections30FPS.json');

// const SIMULATION_MODE = process.env.NODE_ENV !== 'production'; // When not running on the Jetson
const SIMULATION_MODE = true;

const port = parseInt(process.env.PORT, 10) || 8080
const dev = process.env.NODE_ENV !== 'production'
const app = next({ dev })
const handle = app.getRequestHandler()

// Init processes
YOLO.init(SIMULATION_MODE);

app.prepare()
.then(() => {
  // Start HTTP server
  const server = http.createServer(express);
  express.use(bodyParser.json());
  
  // This render pages/index.js for a request to /
  express.get('/', (req, res) => {

    YOLO.start(); // Inside yolo process will check is started

    const urlData = getURLData(req);
    Opendatacam.listenToYOLO(urlData);
    return app.render(req, res, '/')
  })

  express.post('/counter/areas', (req, res) => {
    Opendatacam.registerCountingAreas(req.body.countingAreas)
    res.sendStatus(200)
  });

  express.get('/tracker/sse', sse, function(req, res) {
    Opendatacam.startStreamingData(res.sse);
  });

  // express.get('/counter/dashboard', (req, res) => {
  //   res.json(Opendatacam.getCountingDashboard());
  // });

  // express.get('/tracker/current-tracked-items', (req, res) => {
  //   res.json(Opendatacam.getTrackedItemsThisFrame());
  // });

  express.get('/counter/export', function(req, res) {
    var dataToExport = cloneDeep(Opendatacam.getCounterHistory());
    // console.log(dataToExport);
    res.csv(dataToExport, false ,{'Content-disposition': 'attachment; filename=counterData.csv'});
  });


  express.get('/counter/trackerdata', function(req, res) {
    Opendatacam.getTrackerData().then(() => {
      // res.send('OK, file ready to download');
      res.download('static/trackerHistoryExport.json', 'trackerHistoryExport.json')
    }, () => {
      res.status(500).send('Something broke while generating the tracking history!');
    })
  });

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
