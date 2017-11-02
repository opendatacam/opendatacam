var WebSocketServer = require('websocket').server;
var http = require('http');
var Tracker = require('../../tracker/tracker');

var frameNb = 0;

var imageWidth = 1280;
var imageHeight = 720;

var server = http.createServer(function(request, response) {
    console.log((new Date()) + ' Received request for ' + request.url);
    response.writeHead(404);
    response.end();
});
server.listen(8080, function() {
    console.log((new Date()) + ' Server is listening on port 8080');
});

wsServer = new WebSocketServer({
    httpServer: server,
    // You should not use autoAcceptConnections for production
    // applications, as it defeats all standard cross-origin protection
    // facilities built into the protocol and the browser.  You should
    // *always* verify the connection's origin and decide whether or not
    // to accept it.
    autoAcceptConnections: false
});

function originIsAllowed(origin) {
  // put logic here to detect whether the specified origin is allowed.
  return true;
}

wsServer.on('request', function(request) {
    if (!originIsAllowed(request.origin)) {
      // Make sure we only accept requests from an allowed origin
      request.reject();
      console.log((new Date()) + ' Connection from origin ' + request.origin + ' rejected.');
      return;
    }
    
    var connection = request.accept('', request.origin);
    console.log((new Date()) + ' Connection accepted.');
    connection.on('message', function(message) {
        if (message.type === 'utf8') {
            
            var detectionsOfThisFrame = JSON.parse(message.utf8Data);
            detectionsOfThisFrame = detectionsOfThisFrame.map((detection) => {
                var detectionScaled = detection;
                detectionScaled.x = detection.x * imageWidth;
                detectionScaled.y = detection.y * imageHeight;
                detectionScaled.w = detection.w * imageWidth;
                detectionScaled.h = detection.h * imageHeight;
                return detectionScaled;
            })
            console.log(`Received Detection:`);
            console.log('=========');
            console.log(JSON.stringify(detectionsOfThisFrame));
            console.log('=========');
            console.log('Update tracker with this frame')
            console.log(`Frame id: ${frameNb}`);
            console.log('=========')
            Tracker.updateTrackedItemsWithNewFrame(detectionsOfThisFrame, frameNb);
            console.log('Tracker data');
            console.log('=========')
            console.log(JSON.stringify(Tracker.getJSONOfTrackedItems()));
            console.log('=========')
            frameNb++;
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
