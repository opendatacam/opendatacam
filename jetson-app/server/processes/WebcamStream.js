const forever = require('forever-monitor');

/*
  This process has two sub-process
  -> a ffserver that expose an enpoint to see the images
  -> piping the stream of the webcam to the ffserver
*/

let WebcamStream = {
  // isRunning: false,
  isInitialized: false,
  ffServer: {
    process: null,
    isRunning: false
  },
  streamWebcam: {
    process: null,
    isRunning: false
  }
};

module.exports = {
  init: function() {

    // FFMPEG Server process
    // cwd is relative to the main.js where things are called
    WebcamStream.ffServer.process = new (forever.Monitor)(['ffserver','-f','ffserver.conf'],{
      max: 1,
      cwd: "./server/processes/ffserver"
    });

    WebcamStream.ffServer.process.on("start", () => {
      console.log('WebcamStream: Sub-Process FFServer started');
      WebcamStream.ffServer.isRunning = true;
    });

    WebcamStream.ffServer.process.on("stop", () => {
      console.log('WebcamStream: Sub-Process FFServer stopped');
      WebcamStream.ffServer.isRunning = false;
    });

    // Stream Webcam To FFServer
    // Pipe webcam feed to ffmpeg server: ffmpeg -f video4linux2 -i /dev/video1 http://localhost:8090/feed1.ffm
    // TODO be able to set the webcam in the config file
    // cwd is relative to the main.js where things are called
    WebcamStream.streamWebcam.process = new (forever.Monitor)(['ffmpeg','-f','video4linux2','-input_format','mjpeg','-video_size','1280x720','-i','/dev/video1','http://localhost:8090/feed1.ffm'],{
      max: 1,
      cwd: "./server/processes/ffserver"
    });
    // WebcamStream.streamWebcam.process = new (forever.Monitor)(['ffmpeg','-i','/home/nvidia/Desktop/prototype1_720p.mp4','http://localhost:8090/feed1.ffm'],{
    //   max: 1,
    //   cwd: "./processes/ffserver"
    // });

    WebcamStream.streamWebcam.process.on("start", () => {
      console.log('WebcamStream: Sub-Process Stream webcam started');
      WebcamStream.streamWebcam.isRunning = true;
    });

    WebcamStream.streamWebcam.process.on("stop", () => {
      console.log('WebcamStream : Sub-Process Stream webcam stopped');
      WebcamStream.streamWebcam.isRunning = false;
    });

    console.log('Process WebcamStream initialized');
    WebcamStream.isInitialized = true;

    // TODO handle other kind of events
    // https://github.com/foreverjs/forever-monitor#events-available-when-using-an-instance-of-forever-in-nodejs
  },

  start: function() {
    if(!WebcamStream.streamWebcam.isRunning) {
      WebcamStream.streamWebcam.process.start();
    }
    if(!WebcamStream.ffServer.isRunning) {
      WebcamStream.ffServer.process.start();
    }
  },

  stop: function() {
    if(WebcamStream.streamWebcam.isRunning) {
      WebcamStream.streamWebcam.process.stop();
    }
    if(WebcamStream.ffServer.isRunning) {
      WebcamStream.ffServer.process.stop();
    }
  }
}
