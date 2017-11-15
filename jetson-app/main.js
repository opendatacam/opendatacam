const express = require('express')();
const http = require('http');
const next = require('next');
const WebSocketServer = require('websocket').server;
const forever = require('forever-monitor');

const port = parseInt(process.env.PORT, 10) || 8080
const dev = process.env.NODE_ENV !== 'production'
const app = next({ dev })
const handle = app.getRequestHandler()

// states
var yolo = new (forever.Monitor)(['./../../darknet-net/darknet','detector','demo','../../darknet-net/cfg/voc.data','../../darknet-net/cfg/yolo-voc.cfg','../../darknet-net/yolo-voc.weights','-filename', '../../prototype_level_1_5x.mp4', '-address','ws://localhost','-port','8080'],{
  max: 1
});

yolo.on('start', function(process, data) {
  console.log('Forever : start yolo process');
});

yolo.on('watch:restart', function(info) {
  console.error('Restaring script because ' + info.file + ' changed');
});

yolo.on('restart', function() {
  console.error('Forever restarting script for ' + child.times + ' time');
});

yolo.on('exit:code', function(code) {
  console.error('Forever detected script exited with code ' + code);
});

app.prepare()
.then(() => {
  // Start HTTP server
  const server = http.createServer(express);
  
  express.get('/', (req, res) => {
    return app.render(req, res, '/', req.query)
  })

  express.get('/start-yolo', (req, res) => {
    console.log('start yolo process');
    yolo.start();
    res.send('yolo.start() launched');
  });

  server.listen(port, (err) => {
    if (err) throw err
    console.log(`> Ready on http://localhost:${port}`)
  })

  // Start Websocket server
  wsServer = new WebSocketServer({
    httpServer: server,
    // You should not use autoAcceptConnections for production
    // applications, as it defeats all standard cross-origin protection
    // facilities built into the protocol and the browser.  You should
    // *always* verify the connection's origin and decide whether or not
    // to accept it.
    autoAcceptConnections: false
  });

  wsServer.on('request', function(request) {
      // function originIsAllowed(origin) {
      //   // put logic here to detect whether the specified origin is allowed.
      //   return true;
      // }
      // if (!originIsAllowed(request.origin)) {
      //   // Make sure we only accept requests from an allowed origin
      //   request.reject();
      //   console.log((new Date()) + ' Connection from origin ' + request.origin + ' rejected.');
      //   return;
      // }
      
      var connection = request.accept('', request.origin);
      console.log((new Date()) + ' Connection accepted.');
      connection.on('message', function(message) {
          if (message.type === 'utf8') {

              console.log('message from YOLO');
              
              // var detectionsOfThisFrame = JSON.parse(message.utf8Data);
              // detectionsOfThisFrame = detectionsOfThisFrame.map((detection) => {
              //     var detectionScaled = detection;
              //     detectionScaled.name = detection.class;
              //     detectionScaled.x = detection.x * imageWidth;
              //     detectionScaled.y = detection.y * imageHeight;
              //     detectionScaled.w = detection.w * imageWidth;
              //     detectionScaled.h = detection.h * imageHeight;
              //     return detectionScaled;
              // })
              // console.log(`Received Detection:`);
              // console.log('=========');
              // console.log(JSON.stringify(detectionsOfThisFrame));
              // console.log('=========');
              // console.log('Update tracker with this frame')
              // console.log(`Frame id: ${frameNb}`);
              // console.log('=========')
              // Tracker.updateTrackedItemsWithNewFrame(detectionsOfThisFrame, frameNb);
              // // console.log('Tracker data');
              // // console.log('=========')
              // // console.log(JSON.stringify(Tracker.getJSONOfTrackedItems()));
              // // console.log('=========')
              // // TODO use that to count
              // var newItemsToCount = Tracker.getJSONOfAllTrackedItems()
              //     .filter((item) => 
              //         countedItems.indexOf(item.id) === -1 && // not already counted 
              //         item.nbActiveFrame > 3
              //     ).filter((item) =>
              //         isInsideSomeAreas(countingAreas , item.disappearArea, item.idDisplay)
              //     );
              // newItemsToCount.forEach((itemToCount) => {
              //     countedItems.push(itemToCount.id);
              //     counter.car++;
              // });

              // console.log(`Counter: ${counter.car} 🚗`);

              // // console.log('=========')
              // frameNb++;


              // var itemsToCountOnThatFrame = Tracker.getJSONOfTrackedItems().filter((trackedItem) => trackedItem.isDead === true);
              // console.log(`Count items ${itemsToCountOnThatFrame.length}`);
              // console.log(itemsToCountOnThatFrame);
              // connection.sendUTF(message.utf8Data);
          }
          else if (message.type === 'binary') {
              console.log('Received Binary Message of ' + message.binaryData.length + ' bytes');
              // connection.sendBytes(message.binaryData);
          }
      });
      connection.on('close', function(reasonCode, description) {
          console.log((new Date()) + ' Peer ' + connection.remoteAddress + ' disconnected.');
      });
  });


})
