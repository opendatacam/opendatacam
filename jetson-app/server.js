const express = require('express')();
const http = require('http');
const next = require('next');
const WebSocketServer = require('websocket').server;
const forever = require('forever-monitor');
const YOLO = require('./server/processes/YOLO');
const WebcamStream = require('./server/processes/WebcamStream');
const Counter = require('./server/counter/Counter');

const port = parseInt(process.env.PORT, 10) || 8080
const dev = process.env.NODE_ENV !== 'production'
const app = next({ dev })
const handle = app.getRequestHandler()

// Init processes
YOLO.init();
WebcamStream.init();

app.prepare()
.then(() => {
  // Start HTTP server
  const server = http.createServer(express);
  
  // This render pages/index.js for a request to /
  express.get('/', (req, res) => {
    // Start webcam stream by default
    WebcamStream.start();
    // Make sur yolo is stopped
    YOLO.stop();
    return app.render(req, res, '/', req.query)
  })

  express.get('/counter/start', (req, res) => {
    Counter.reset();
    WebcamStream.stop();
    YOLO.start();
    res.send('Start counting')
  });

  express.get('/counter/stop', (req, res) => {
    YOLO.stop();
    WebcamStream.start();
    res.send('Stop counting')
  });

  express.get('/counter/data', (req, res) => {
    res.json(Counter.getCountingData());
  });

  // Global next.js handler
  express.get('*', (req, res) => {
    return handle(req, res)
  })

  server.listen(port, (err) => {
    if (err) throw err
    console.log(`> Ready on http://localhost:${port}`)
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
              console.log('detections from YOLO');
              var detectionsOfThisFrame = JSON.parse(message.utf8Data);
              Counter.updateWithNewFrame(detectionsOfThisFrame);
          }
      });
      connection.on('close', function(reasonCode, description) {
          console.log((new Date()) + ' Peer ' + connection.remoteAddress + ' disconnected.');
      });
  });


})
