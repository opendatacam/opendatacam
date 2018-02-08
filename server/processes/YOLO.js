const forever = require('forever-monitor');
const config = require('../../config.json');
const WebSocketClient = require('websocket').client;
const fs = require('fs');

let YOLO = {
  isRunning: false,
  isInitialized: false,
  process: null,
  simulationMode: false,
  simulationInterval: null
};


module.exports = {
  init: function(simulationMode) {

    YOLO.simulationMode = simulationMode;

    // On file
    // ./darknet detector demo cfg/voc.data cfg/yolo-voc.cfg yolo-voc.weights -filename ../prototype_level_1_5x.mp4 -address "ws://localhost" -port 8080
    // YOLO.process = new (forever.Monitor)(['./darknet','detector','demo','cfg/voc.data','cfg/yolo-voc.cfg','yolo-voc.weights','-filename', '../prototype_level_1_5x.mp4', '-address','ws://localhost','-port','8080'],{
    //   max: 1,
    //   cwd: "../../darknet-net"
    // });

    // On webcam
    // ./darknet detector demo cfg/voc.data cfg/yolo-voc.cfg yolo-voc.weights -c 1 -address "ws://localhost" -port 8080
    YOLO.process = new (forever.Monitor)(['./darknet','detector','demo','cfg/voc.data','cfg/yolo-voc.cfg','yolo-voc.weights','-c','1', '-address','ws://localhost','-port','8080'],{
      max: 1,
      cwd: config.PATH_TO_YOLO_DARKNET,
      killTree: true
    });

    YOLO.process.on("start", () => {
      console.log('Process YOLO started');
      YOLO.isRunning = true;
    });

    YOLO.process.on("stop", () => {
      console.log('Process YOLO stopped');
      YOLO.isRunning = false;
    });

    console.log('Process YOLO initialized');
    YOLO.isInitialized = true;

    // TODO handle other kind of events
    // https://github.com/foreverjs/forever-monitor#events-available-when-using-an-instance-of-forever-in-nodejs
  },

  startYOLOSimulation: function() {
    let client = new WebSocketClient();

    client.on('connectFailed', function(error) {
        console.log('Connect Error: ' + error.toString());
    });

    client.on('connect', function(connection) {
        console.log('WebSocket Client Connected');
        connection.on('error', function(error) {
            console.log("Connection Error: " + error.toString());
        });
        connection.on('close', function() {
            console.log('echo-protocol Connection Closed');
        });

        let detections = {};
        let frameNb = 0;

        // Get some simulation data
        fs.readFile('static/placeholder/rawdetections.txt', function(err, f){
          if(err) {
            console.log(err);
            return;
          }
          var lines = f.toString().split('\n');
          lines.forEach(function(l) {
            try {
              var detection = JSON.parse(l);
              detections[detection.frame] = detection.detections;
            } catch (e) {
              console.log('Error parsing line');
            }
          });

          // Simulate YOLO 15s booting time
          setTimeout(() => {
            YOLO.simulationInterval = setInterval(sendDetection, 10)
          }, 15000)
          
        });
        
        function sendDetection() {
            if (connection.connected) {
                // Convert detection coordinates to float
                // 1920 => 1
                // detection.x, detection.w => ?
                // 1080 => 1
                // detection.y, detection.h => ?
                let detection = detections[frameNb].map((detection) => {
                  return {
                    ...detection,
                    class: detection.name,
                    x: detection.x / 1920,
                    y: detection.y / 1080,
                    w: detection.w / 1920,
                    h: detection.h / 1080
                  }
                })
                connection.sendUTF(JSON.stringify(detection));

                if(detections[frameNb + 1]) {
                  frameNb++;
                } else {
                  clearInterval(YOLO.simulationInterval)
                }
            }
        }
        
    });

    client.connect('ws://localhost:8080/');
  },

  start: function() {
    if(YOLO.simulationMode) {
      this.startYOLOSimulation();
    } else {
      if(!YOLO.isRunning) {
        YOLO.process.start();
      }
    }
  },

  stop: function() {
    if(YOLO.simulationMode && YOLO.simulationInterval) {
      clearInterval(YOLO.simulationInterval)
    } else {
      if(YOLO.isRunning) {
        YOLO.process.stop();
      }
    }
  }
}
