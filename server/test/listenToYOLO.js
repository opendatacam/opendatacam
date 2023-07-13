const http = require('http');

const options = {
  hostname: '192.168.2.161',
  port: 8070,
  path: '/',
  method: 'GET',
};

const HTTPRequestListeningToYOLO = http.request(options, (res) => {
  res.on('data', (chunk) => {
    const msg = chunk.toString();
    console.log(`Message: ${msg}`);
    // try {
    //     var detectionsOfThisFrame = JSON.parse(msg);
    //     self.updateWithNewFrame(detectionsOfThisFrame.objects);
    // } catch (error) {
    //     console.log("Error while updating Opendatacam with new frame")
    //     console.log(error);
    //     res.emit('close');
    // }
  });

  res.on('close', () => {
    // if (YOLO.getStatus().isStarted) {
    console.log('==== HTTP Stream closed by darknet, reset UI, might be running from file and ended it or have troubles with webcam and need restart =====');
    // YOLO.stop();
    // } else {
    //     // Counting stopped by user, keep yolo running
    // }
  });
});

HTTPRequestListeningToYOLO.on('error', (e) => {
  // YOLO.stop();
  console.log(`Something went wrong: ${e.message}`);
});

// Actually send request
HTTPRequestListeningToYOLO.end();
