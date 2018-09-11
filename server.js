const express = require('express')();
const csv = require('csv-express');
const bodyParser = require('body-parser');
const http = require('http');
const next = require('next');
const ip = require('ip');
const WebSocketServer = require('websocket').server;
const forever = require('forever-monitor');
const YOLO = require('./server/processes/YOLO');
const WebcamStream = require('./server/processes/WebcamStream');
const Counter = require('./server/counter/Counter');
const request = require('request');
const fs = require('fs');
const cloneDeep = require('lodash.clonedeep');

const SIMULATION_MODE = process.env.NODE_ENV !== 'production'; // When not running on the Jetson

const port = parseInt(process.env.PORT, 10) || 8080
const dev = process.env.NODE_ENV !== 'production'
const app = next({ dev })
const handle = app.getRequestHandler()

let delayStartWebcam = null;

// Init processes
YOLO.init(SIMULATION_MODE);
WebcamStream.init(SIMULATION_MODE);

// First request received ?
let firstRequestReceived = false;

// Is currently counting state
let isCounting = false;

app.prepare()
.then(() => {
  // Start HTTP server
  const server = http.createServer(express);
  express.use(bodyParser.json());
  
  // This render pages/index.js for a request to /
  express.get('/', (req, res) => {

    if(!firstRequestReceived) {
      // Start webcam stream
      WebcamStream.start();
      firstRequestReceived = true;
    }

    // Hacky way to pass params to getInitialProps on SSR
    let query = req.query;
    query.isCounting = isCounting;
    // console.log(Counter.getOriginalCountingAreas());
    query.countingAreas = Counter.getOriginalCountingAreas();
    
    return app.render(req, res, '/', query)
  })

  express.post('/counter/start', (req, res) => {
    // Save last frame of webcam before shutting down
    const url = getWebcamURL(req);
    request(url, {encoding: 'binary'}, function(error, response, body) {
      fs.writeFile('static/lastwebcamframe.jpg', body, 'binary', function (err) {});
      WebcamStream.stop();
      YOLO.start();
    });
    Counter.reset();
    Counter.start();
    Counter.registerCountingAreas(req.body.countingAreas)
    isCounting = true;
    res.json(Counter.getCountingDashboard());
  });

  express.get('/counter/stop', (req, res) => {

    YOLO.stop();

    if(delayStartWebcam) {
      clearTimeout(delayStartWebcam);
    }
    // Leave time to YOLO to free the webcam before starting it
    // TODO Need to put a clearSetTimeout somewhere
    delayStartWebcam = setTimeout(() => {
      WebcamStream.start();
    }, 2000);

    isCounting = false;

    res.send('Stop counting')
  });

  express.get('/counter/dashboard', (req, res) => {
    res.json(Counter.getCountingDashboard());
  });

  express.get('/counter/current-tracked-items', (req, res) => {
    res.json(Counter.getTrackedItemsThisFrame());
  });

  express.get('/counter/export', function(req, res) {
    var dataToExport = cloneDeep(Counter.getCounterHistory());
    // console.log(dataToExport);
    res.csv(dataToExport, false ,{'Content-disposition': 'attachment; filename=counterData.csv'});
  });


  express.get('/counter/trackerdata', function(req, res) {
    Counter.getTrackerData().then(() => {
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

  // Start Websocket server
  // Will listen to YOLO detections
  wsServer = new WebSocketServer({
    httpServer: server,
    autoAcceptConnections: false
  });

  wsServer.on('request', function(request) {      
    var connection = request.accept('', request.origin);
    console.log((new Date()) + ' Connection accepted.');
    connection.on('message', function(message) {
        if (message.type === 'utf8') {
            // console.log('detections from YOLO');
            var detectionsOfThisFrame = JSON.parse(message.utf8Data);
            Counter.updateWithNewFrame(detectionsOfThisFrame);
        }
    });
    connection.on('close', function(reasonCode, description) {
        console.log((new Date()) + ' Peer ' + connection.remoteAddress + ' disconnected.');
    });
  });

})



// Utilities
function getWebcamURL(req) {
  const urlData = getURLData(req)
  if(process.env.NODE_ENV !== 'production') {
    return `${urlData.protocol}://${urlData.address}:${port}/static/placeholder/webcam.jpg`
  } else {
    return `${urlData.protocol}://${urlData.address}:8090/webcam.jpg`
  }
}

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
