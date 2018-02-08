const express = require('express')();
const bodyParser = require('body-parser')
const http = require('http');
const next = require('next');
const ip = require('ip');
const WebSocketServer = require('websocket').server;
const forever = require('forever-monitor');
const YOLO = require('./server/processes/YOLO');
const WebcamStream = require('./server/processes/WebcamStream');
const Counter = require('./server/counter/Counter');

const SIMULATION_MODE = true; // When not running on the Jetson

const port = parseInt(process.env.PORT, 10) || 8080
const dev = process.env.NODE_ENV !== 'production'
const app = next({ dev })
const handle = app.getRequestHandler()

// Init processes
YOLO.init(SIMULATION_MODE);
WebcamStream.init(SIMULATION_MODE);

app.prepare()
.then(() => {
  // Start HTTP server
  const server = http.createServer(express);
  express.use(bodyParser.json());
  
  // This render pages/index.js for a request to /
  express.get('/', (req, res) => {

    // Start webcam stream by default
    WebcamStream.start();

    // Make sur yolo is stopped
    YOLO.stop();

    return app.render(req, res, '/', req.query)
  })

  express.post('/counter/start', (req, res) => {

    Counter.reset();
    Counter.registerCountingAreas(req.body.countingAreas)

    // Simulate YOLO detection
    WebcamStream.stop();

    YOLO.start();

    res.send('Start counting')
  });

  express.get('/counter/stop', (req, res) => {

    YOLO.stop();

    // Leave time to YOLO to free the webcam
    // TODO Need to put a clearSetTimeout somewhere
    setTimeout(() => {
      WebcamStream.start();
    }, 2000);

    res.send('Stop counting')
  });

  express.get('/counter/dashboard', (req, res) => {
    res.json(Counter.getCountingDashboard());
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
