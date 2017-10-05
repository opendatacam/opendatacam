var argv = require('minimist')(process.argv.slice(2));

const fs = require("fs");
const spawn = require("child_process").spawn;
const darknet = require("@moovel/yolo");
const utils = require("./utils");

let ffmpeg = null;
let counter = 0;

var videoInput = argv.in;
var exportPath = argv.out;

var detectionTitle = "detected";

if(!argv.mode) {
	help();
}

// ffmpeg -f rawvideo -s 768x576 -pix_fmt bgr24 -i data.modified.raw data.png
function ffmpegPipe(dimensions, filename) {
  if (!ffmpeg) {
    ffmpeg = spawn(
      "ffmpeg",
      [
        "-loglevel",
        "warning",
        "-f",
        "rawvideo",
        "-pix_fmt",
        "rgb24", // 'bgr24' or 'rgb24' if color channels are swapped
        "-s",
        `${dimensions.width}x${dimensions.height}`,
        "-y",
        "-i",
        "-",
        "-r",
        "25", // target framerate
        filename
      ],
      {
        stdio: ["pipe", process.stdout, process.stderr]
      }
    );
    return ffmpeg.stdin;
  } else {
    return ffmpeg.stdin;
  }
}

if (argv.mode === "video") {

  darknet.detect(
    {
      cfg: "./cfg/yolo.cfg",
      weights: "./yolo.weights",
      data: "./cfg/coco.data",
      // cameraIndex: 0,
      video: videoInput,
      thresh: 0.24
    },
    function(modified, original, detections, dimensions) {
      const millis = new Date().getTime();

      const detectionsOut = {
        // time: millis,
        frame: counter,
        detections: utils.formatDetections(detections, dimensions)
      };
      fs.appendFileSync(exportPath + detectionTitle + ".txt", JSON.stringify(detectionsOut) + "\n");

      // utils.encodeTimeRGB(modified, millis, dimensions, 15, 3);
			/*
      utils.encodeTimeBW(original, millis, dimensions, 9, 5);
     	ffmpegPipe(dimensions, exportPath + detectionTitle + ".mp4").write(original);
			*/

      counter++;
    }
  );

}

function help() {
	console.log('usage: node darknet-video --mode video --in ./data/videos/video1.MP4 --out ./detections/');
};
