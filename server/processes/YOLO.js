const forever = require('forever-monitor');
const config = require('../../config.json');
var WebSocketClient = require('websocket').client;

let YOLO = {
  isRunning: false,
  isInitialized: false,
  process: null,
  simulationMode: false
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
      cwd: config.PATH_TO_YOLO_DARKNET
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
    var client = new WebSocketClient();

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
        connection.on('message', function(message) {
            if (message.type === 'utf8') {
                console.log("Received: '" + message.utf8Data + "'");
            }
        });
        
        function sendNumber() {
            if (connection.connected) {
                var number = Math.round(Math.random() * 0xFFFFFF);
                connection.sendUTF(number.toString());
                setTimeout(sendNumber, 1000);
            }
        }
        sendNumber();
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
    if(YOLO.simulationMode) {
      
    } else {
      if(YOLO.isRunning) {
        YOLO.process.stop();
      }
    }
  }
}
