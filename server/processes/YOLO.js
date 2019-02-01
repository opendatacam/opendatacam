const forever = require('forever-monitor');
const config = require('../../config.json');
const simulation30FPSDetectionsData = require('../../static/placeholder/alexeydetections30FPS.json');
const fs = require('fs');
const path = require('path');
const http = require('http');
const killable = require('killable');
const mjpegServer = require('mjpeg-server');
const { updateWithNewFrame } = require('../Opendatacam');

let YOLO = {
  isStarting: false,
  isStarted: false,
  isInitialized: false,
  process: null,
  simulationMode: false,
  simulationServer: null
};


module.exports = {
  init: function(simulationMode) {

    YOLO.simulationMode = simulationMode;

    // On webcam
    // ./darknet detector demo cfg/voc.data cfg/yolo-voc.cfg yolo-voc.weights -c 1 -address "ws://localhost" -port 8080
    // Comment the following lines to run on a file directly
    YOLO.process = new (forever.Monitor)(['./darknet','detector','demo','cfg/voc.data','cfg/yolo-voc.cfg','yolo-voc.weights','-c','0', '-ext_output','-dont_show','-json_port','8070', '-mjpeg_port', '8090'],{
      max: 1,
      cwd: config.PATH_TO_YOLO_DARKNET,
      killTree: true
    });

    // ./darknet detector demo cfg/voc.data cfg/yolo-voc.cfg yolo-voc.weights -c 0 -ext_output -dont_show -json_port 8070 -mjpeg_port 8090

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

    // With new darknet implem, no -filename flag
    // ./darknet detector demo cfg/voc.data cfg/yolo-voc.cfg yolo-voc.weights video-stuttgart.mp4 -ext_output -dont_show

    // YOLO.process = new (forever.Monitor)(['./darknet','detector','demo','cfg/voc.data','cfg/yolo-voc.cfg','yolo-voc.weights','video-stuttgart-10-fps-sd.mp4','-dont_show','-json_port','8070', '-mjpeg_port', '8090'],{
    //   max: 1,
    //   cwd: config.PATH_TO_YOLO_DARKNET,
    //   killTree: true
    // });

    YOLO.process.on("start", () => {
      console.log('Process YOLO started');
      YOLO.isStarted = true;
    });

    YOLO.process.on("stop", () => {
      console.log('Process YOLO stopped');
      YOLO.isStarted = false;
    });

    console.log('Process YOLO initialized');
    YOLO.isInitialized = true;

    // TODO handle other kind of events
    // https://github.com/foreverjs/forever-monitor#events-available-when-using-an-instance-of-forever-in-nodejs
  },

  start: function() {
    // Do not start it twice
    if(YOLO.isStarted && YOLO.isStarting) {
      return;
    }

    if(YOLO.simulationMode) {
      this.startYOLOSimulation();
    } else {
      if(!YOLO.isStarted) {
        YOLO.process.start();
      }
    }
  },

  stop: function() {
    // TODO LATER add a isStopping state
    if(YOLO.simulationMode && YOLO.simulationServer) {
      YOLO.simulationServer.kill(function () {
        YOLO.isStarted = false;
      });
    } else {
      if(YOLO.isStarted) {
        YOLO.process.stop();
      }
    }
  },

  startYOLOSimulation: function() {
    /**
     *   Used in Dev mode for faster development
     *     - Simulate a MJPEG stream on port 8090
     *     - Update opendatacam tracker on each frame
     */
  
    console.log("Start MJPEG server");
    var frameNb = 16;
    var mjpegReqHandler = null;
    var timer = null;
    var dataThisFrame = [];
    YOLO.simulationServer = http.createServer(function(req, res) {
      console.log("Got request");

      if(mjpegReqHandler) {
        mjpegReqHandler.close();
        clearInterval(timer);
      }
      mjpegReqHandler = mjpegServer.createReqHandler(req, res);
      timer = setInterval(updateJPG, 70);

      function updateJPG() {
        fs.readFile(path.join(__dirname, '../../static/placeholder/frames') + "/" + String(frameNb).padStart(3, '0') + '.jpg', sendJPGData);
        frameNb++;
      }

      function sendJPGData(err, data) {
        if(err) {
          console.log(err);
        }
        mjpegReqHandler.write(data, function() {
          dataThisFrame = simulation30FPSDetectionsData.find((detection) => detection.frame_id == frameNb)
          if(dataThisFrame) {
            updateWithNewFrame(dataThisFrame.objects);
          }
          checkIfFinished();
        });
      }

      function checkIfFinished() {
        if (frameNb > 1823) {
          // clearInterval(timer);
          // mjpegReqHandler.close();
          console.log('Reset stream');
          frameNb = 16;
        }
      }
    }).listen(8090);
    killable(YOLO.simulationServer);

  },

  getState() {
    return YOLO;
  }
}
