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
    console.log(Counter.getOriginalCountingAreas());
    query.countingAreas = Counter.getOriginalCountingAreas();
    
    return app.render(req, res, '/', query)
  })

  express.post('/counter/start', (req, res) => {

    WebcamStream.stop();
    YOLO.start();  
    Counter.reset();
    Counter.registerCountingAreas(req.body.countingAreas)
    Counter.start();
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
    res.csv(Counter.getCounterHistory(), false ,{'Content-disposition': 'attachment; filename=export.csv'});
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
