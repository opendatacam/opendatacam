const fs = require('fs');
const spawn = require('child_process').spawn;
const darknet = require('@moovel/yolo');
const utils = require('./utils');

let ffmpeg = null;


// ffmpeg -f rawvideo -s 768x576 -pix_fmt bgr24 -i data.modified.raw data.png
function ffmpegPipe(dimensions, filename) {
  if (!ffmpeg) {
    ffmpeg = spawn('ffmpeg',
      [
        '-loglevel', 'warning',
        '-f', 'rawvideo',
        '-pix_fmt', 'rgb24', // 'bgr24' or 'rgb24' if color channels are swapped
        '-s', `${dimensions.width}x${dimensions.height}`,
        '-y',
        '-i', '-',
        '-r', '25', // target framerate
        filename
      ], {
        stdio: ['pipe', process.stdout, process.stderr],
      });
    return ffmpeg.stdin;
  } else {
    return ffmpeg.stdin;
  }
}

darknet.detect({
  cfg: './cfg/yolo.cfg',
  weights: './yolo.weights',
  data: './cfg/coco.data',
  video: './C0082-47mm.mp4',
  thresh: 0.24,
}, function(modified, original, detections, dimensions) {
  const millis = new Date().getTime();

  const detectionsOut = {
    time: millis,
    detections: utils.formatDetections(detections, dimensions)
  }
  fs.appendFileSync('detected.txt', JSON.stringify(detectionsOut) + '\n');

  // utils.encodeTimeRGB(modified, millis, dimensions, 15, 3);
  utils.encodeTimeBW(modified, millis, dimensions, 9, 3);
  ffmpegPipe(dimensions, 'detected.mp4').write(original);
});
