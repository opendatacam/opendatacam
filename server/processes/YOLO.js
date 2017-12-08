const forever = require('forever-monitor');
const config = require('../../config.json');

let YOLO = {
  isRunning: false,
  isInitialized: false,
  process: null
};

module.exports = {
  init: function() {

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

  start: function() {
    if(!YOLO.isRunning) {
      YOLO.process.start();
    }
  },

  stop: function() {
    if(YOLO.isRunning) {
      YOLO.process.stop();
    }
  }
}
