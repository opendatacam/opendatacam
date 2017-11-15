var WebSocketServer = require('websocket').server;
var http = require('http');
var Tracker = require('../../tracker/tracker');

var frameNb = 0;

var countedItems = [];

var counter = {
    car: 0
}

// LEVEL 2 Counting areas
// var countingAreas = [
//     {"x":190,"y":225.33333333333334,"w":125.33333333333333,"h":92},
//     {"x":104,"y":646.6666666666666,"w":317.3333333333333,"h":75.99999999999999},
//     {"x":640,"y":643.3333333333334,"w":365.3333333333333,"h":78.66666666666667},
//     {"x":1053.4266666666667,"y":207.90666666666667,"w":56,"h":62.666666666666664},
//     {"x":241.33333333333334,"y":283.3333333333333,"w":130.66666666666666,"h":70.66666666666667}
// ]

// LEVEL 1 Counting areas
var countingAreas = [{"x":0,"y":280,"w":426.66,"h":200}]

var imageWidth = 1280;
var imageHeight = 720;

function isInsideArea(area, point) {
    const xMin = area.x
    const xMax = area.x + area.w;
    const yMin = area.y
    const yMax = area.y + area.h;
    
    if(point.x >= xMin &&
       point.x <= xMax &&
       point.y >= yMin &&
       point.y <= yMax) {
      return true;
    } else {
      return false;
    }
  }
  
function isInsideSomeAreas(areas, point, idDisplay) {
    const isInside = areas.some((area) => isInsideArea(area, point));
    // console.log(`Run isInsideSomeAreas for ${idDisplay}, returned: ${isInside}`);
    return isInside;
  }

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
                detectionScaled.name = detection.class;
                detectionScaled.x = detection.x * imageWidth;
                detectionScaled.y = detection.y * imageHeight;
                detectionScaled.w = detection.w * imageWidth;
                detectionScaled.h = detection.h * imageHeight;
                return detectionScaled;
            })
            // console.log(`Received Detection:`);
            // console.log('=========');
            // console.log(JSON.stringify(detectionsOfThisFrame));
            // console.log('=========');
            // console.log('Update tracker with this frame')
            // console.log(`Frame id: ${frameNb}`);
            // console.log('=========')
            Tracker.updateTrackedItemsWithNewFrame(detectionsOfThisFrame, frameNb);
            // console.log('Tracker data');
            // console.log('=========')
            // console.log(JSON.stringify(Tracker.getJSONOfTrackedItems()));
            // console.log('=========')
            // TODO use that to count
            var newItemsToCount = Tracker.getJSONOfAllTrackedItems()
                .filter((item) => 
                    countedItems.indexOf(item.id) === -1 && // not already counted 
                    item.nbActiveFrame > 3
                ).filter((item) =>
                    isInsideSomeAreas(countingAreas , item.disappearArea, item.idDisplay)
                );
            newItemsToCount.forEach((itemToCount) => {
                countedItems.push(itemToCount.id);
                counter.car++;
            });

            console.log(`Counter: ${counter.car} 🚗`);

            // console.log('=========')
            frameNb++;


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
