const express = require('express')();
const csv = require('csv-express');
const bodyParser = require('body-parser');
const http = require('http');
const next = require('next');
const ip = require('ip');
const WebSocketServer = require('websocket').server;
const forever = require('forever-monitor');
const YOLO = require('./server/processes/YOLO');
const Opendatacam = require('./server/Opendatacam');
const request = require('request');
const fs = require('fs');
const cloneDeep = require('lodash.clonedeep');

// const SIMULATION_MODE = process.env.NODE_ENV !== 'production'; // When not running on the Jetson
const SIMULATION_MODE = true;

const port = parseInt(process.env.PORT, 10) || 8080
const dev = process.env.NODE_ENV !== 'production'
const app = next({ dev })
const handle = app.getRequestHandler()

// Init processes
YOLO.init(SIMULATION_MODE);

// // First request received ?
// let firstRequestReceived = false;

// let isCounting = false;

// HTTPJSONSTREAM req
let HTTPJSONStreamReq;

app.prepare()
.then(() => {
  // Start HTTP server
  const server = http.createServer(express);
  express.use(bodyParser.json());
  
  // This render pages/index.js for a request to /
  express.get('/', (req, res) => {

    YOLO.start(); // Inside yolo process will check is started

    // if(!firstRequestReceived) {
    //   // Start YOLO process stream
    //   YOLO.start();
    //   firstRequestReceived = true;
    // }

    // Hacky way to pass params to getInitialProps on SSR
    // HERE NEED TO PASS THE WHOLE STATE TO HYDRATE THE CLIENT
    // Remove this and instead fetch on getInitialProps in the client the whole state
    // let query = req.query;
    // query.isCounting = isCounting;
    // // console.log(Opendatacam.getOriginalCountingAreas());
    // query.countingAreas = Opendatacam.getOriginalCountingAreas();
    
    return app.render(req, res, '/')
  })

  express.post('/counter/start', (req, res) => {
    Opendatacam.reset();
    Opendatacam.start();
    Opendatacam.registerCountingAreas(req.body.countingAreas)
    // isCounting = true;

    // Maybe move this logic inside a separated class / in Counter
    // Open HTTP request to receive json data of detection from YOLO process
    const urlData = getURLData(req);

    var options = {
      hostname: urlData.address,
      port:     8070,
      path:     '/',
      method:   'GET'
    };

    HTTPJSONStreamReq = http.request(options, function(res) {
      res.on('data', function(chunk) {
        var msg = chunk.toString();
        // console.log('Message: ' + msg);
        try {
          var detectionsOfThisFrame = JSON.parse(msg);
          Opendatacam.updateWithNewFrame(detectionsOfThisFrame.objects);
        } catch (error) {
          // console.log("not json")
        }
      });

      res.on('close', () => {
        if(isCounting)  {
          console.log("==== HTTP Stream closed by darknet, reset UI, might be running from file and ended it or have troubles with webcam and need restart =====")
          YOLO.stop();
          isCounting = false;
        } else {
          // Counting stopped by user, keep yolo running
        }
      });
    });

    HTTPJSONStreamReq.on('error', function(e) {
      YOLO.stop();
      isCounting = false;
      console.log('Something went wrong: ' + e.message);
    });

    // Actually send request
    HTTPJSONStreamReq.end();

    res.json(Opendatacam.getCountingDashboard());
  });

  express.get('/counter/stop', (req, res) => {
    isCounting = false;
    HTTPJSONStreamReq.abort();
    res.send('Stop counting')
  });

  express.get('/counter/dashboard', (req, res) => {
    res.json(Opendatacam.getCountingDashboard());
  });

  express.get('/counter/current-tracked-items', (req, res) => {
    res.json(Opendatacam.getTrackedItemsThisFrame());
  });

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



// Utilities
// function getWebcamURL(req) {
//   const urlData = getURLData(req)
//   if(process.env.NODE_ENV !== 'production') {
//     return `${urlData.protocol}://${urlData.address}:${port}/static/placeholder/webcam.jpg`
//   } else {
//     return `${urlData.protocol}://${urlData.address}:8090/webcam.jpg`
//   }
// }

function getURLData(req) {
  let protocol = 'http';
  if(req.headers['x-forwarded-proto'] === 'https') {
    protocol = 'https';
  }

  const parsedUrl = req.get('Host').split(':');
  if(parsedUrl.length > 1) {
    return {
      address: parsedUrl[0],
      port: parsedUrl[1],
      protocol
    }
  } else {
    return {
      address: parsedUrl[0],
      port: 80,
      protocol
    }
  }
}
