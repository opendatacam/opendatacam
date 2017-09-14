const fs = require('fs');
const spawn = require('child_process').spawn;
const _ = require('lodash');
const darknet = require('@moovel/yolo');
const utils = require('./utils');

let ffmpeg = null;


function ffmpegPipe(dimensions, filename) {
  if (!ffmpeg) {
    ffmpeg = spawn('ffmpeg',
      [
        '-loglevel', 'warning',
        '-f', 'rawvideo',
        '-pix_fmt', 'bgr24', // or 'rgb24' if color channels are swapped
        '-s', `${dimensions.width}x${dimensions.height}`,
        '-y',
        '-i', '-',
        filename
      ], {
        stdio: ['pipe', process.stdout, process.stderr],
      });
    return ffmpeg.stdin;
  } else {
    return ffmpeg.stdin;
  }
}

darknet.detectImage({
  cfg: './cfg/yolo.cfg',
  weights: './yolo.weights',
  data: './cfg/coco.data',
  image: './data/night_test.jpg',
}, function(modified, original, detections, dimensions) {
  const millis = new Date().getTime();

  const detectionsOut = {
    time: millis,
    detections: utils.formatDetections(detections, dimensions)
  }
  fs.appendFileSync('detected.txt', JSON.stringify(detectionsOut) + '\n');

  // utils.encodeTimeRGB(modified, millis, dimensions, 15, 3);
  utils.encodeTimeBW(modified, millis, dimensions, 9, 3);
  ffmpegPipe(dimensions, 'detected.png').write(modified, function() {
    process.exit(0);
  });
});
