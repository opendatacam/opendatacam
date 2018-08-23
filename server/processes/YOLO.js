const forever = require('forever-monitor');
const config = require('../../config.json');
const simulation8FPSDetectionsData = require('../../static/placeholder/rawdetections8FPS.json');
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

    // On webcam
    // ./darknet detector demo cfg/voc.data cfg/yolo-voc.cfg yolo-voc.weights -c 1 -address "ws://localhost" -port 8080
    // Comment the following lines to run on a file directly
    YOLO.process = new (forever.Monitor)(['./darknet','detector','demo','cfg/voc.data','cfg/yolo-voc.cfg','yolo-voc.weights','-c','1', '-address','ws://localhost','-port','8080'],{
      max: 1,
      cwd: config.PATH_TO_YOLO_DARKNET,
      killTree: true
    });

    // On file
    // ./darknet detector demo cfg/voc.data cfg/yolo-voc.cfg yolo-voc.weights -filename YOUR_FILE_PATH_RELATIVE_TO_DARK_NET_FOLDER.mp4 -address "ws://localhost" -port 8080
    // YOUR_FILE_PATH_RELATIVE_TO_DARK_NET_FOLDER.mp4 -> relative to darknet directory (set up in config.json), if outside this directory do:
    // ../file.mp4 or ../videos/file.mp4
    
    // Uncomment the following lines to run on a file directly

    // YOLO.process = new (forever.Monitor)(['./darknet','detector','demo','cfg/voc.data','cfg/yolo-voc.cfg','yolo-voc.weights','-filename', 'YOUR_FILE_PATH_RELATIVE_TO_DARK_NET_FOLDER.mp4', '-address','ws://localhost','-port','8080'],{
    //   max: 1,
    //   cwd: config.PATH_TO_YOLO_DARKNET,
    //   killTree: true
    // });

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

        let detections = simulation8FPSDetectionsData;
        let frameNb = 0;

        // Simulate YOLO 15s booting time
        setTimeout(() => {
          // Simulate a 8 FPS detections
          YOLO.simulationInterval = setInterval(sendDetection, 125)
        }, 2000)
        
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
                  console.log('Reset simulation counter')
                  // Infinite
                  frameNb = 0;
                  // clearInterval(YOLO.simulationInterval)
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
