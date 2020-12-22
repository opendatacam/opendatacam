/* eslint no-console: "off" */

const fs = require('fs');

/* No longer used... Catch directly JSON output of Alexey darknet fork */

// Utility to transform the 30 FPS detection simulation data to a
// real world 8 FPS one

const TARGET_FPS = 30;
const INPUT_FPS = 30;

const pathRawDetectionsInput = 'static/placeholder/rawdetections.txt';
const pathRawDetectionsReducesFPSOutput = 'static/placeholder/rawdetections30FPS.json';

fs.readFile(`${pathRawDetectionsInput}`, (err, f) => {
  const lines = f.toString().split('\n');
  let newFrameIndex = 0;
  const detectionsTargetFPS = {};
  console.log(`Turning ${lines.length} frames at 30 FPS into`);
  lines.forEach((l) => {
    try {
      const detection = JSON.parse(l);
      if (detection.frame % (INPUT_FPS / TARGET_FPS) < 1) {
        // Put it in the same format as the detections outputted by AlexeyB darknet fork:
        // {
        //   "class_id":%d,
        //   "name":"%s",
        //   "relative_coordinates": {"center_x":%f, "center_y":%f, "width":%f, "height":%f},
        //   "confidence":%f
        // }
        // from {"x":1061,"y":316,"w":51,"h":33,"prob":29,"name":"car"}
        detectionsTargetFPS[newFrameIndex] = detection.detections.map((d) => ({
          class_id: d.name,
          name: d.name,
          relative_coordinates: {
            center_x: Math.round((d.x / 1920) * 1000) / 1000,
            center_y: Math.round((d.y / 1080) * 1000) / 1000,
            width: Math.round((d.w / 1920) * 1000) / 1000,
            height: Math.round((d.h / 1080) * 1000) / 1000,
          },
          confidence: d.prob,
        }));
        newFrameIndex += 1;
      }
    } catch (e) {
      // console.log('Error parsing line');
      // console.log(e);
    }
  });

  console.log(`${newFrameIndex} frames at ${TARGET_FPS} FPS`);

  fs.writeFile(`${pathRawDetectionsReducesFPSOutput}`, JSON.stringify(detectionsTargetFPS), () => {
    console.log('Output tracker data wrote');
  });
});
