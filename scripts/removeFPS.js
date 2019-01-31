var fs = require("fs");

/* 
    No longer used... Catch directly JSON output of Alexey darknet fork
*/

// Utility to transform the 30 FPS detection simulation data to a 
// real world 8 FPS one

var TARGET_FPS = 30;
var INPUT_FPS = 30;

var pathRawDetectionsInput = 'static/placeholder/rawdetections.txt'
var pathRawDetectionsReducesFPSOutput = 'static/placeholder/rawdetections30FPS.json'




fs.readFile(`${pathRawDetectionsInput}`, function(err, f){
  var lines = f.toString().split('\n');
  var newFrameIndex = 0;
  var detectionsTargetFPS = {};
  console.log(`Turning ${lines.length} frames at 30 FPS into`)
  lines.forEach(function(l) {
    try {
      var detection = JSON.parse(l);
      if(detection.frame % (INPUT_FPS / TARGET_FPS) < 1) {
        // Put it in the same format as the detections outputted by AlexeyB darknet fork: 
        // {"class_id":%d, "name":"%s", "relative_coordinates":{"center_x":%f, "center_y":%f, "width":%f, "height":%f}, "confidence":%f}
        // from {"x":1061,"y":316,"w":51,"h":33,"prob":29,"name":"car"}
        detectionsTargetFPS[newFrameIndex] = detection.detections.map((detection) => {
          return {
            class_id: detection.name,
            name: detection.name,
            relative_coordinates: {
              center_x: Math.round((detection.x / 1920) * 1000) / 1000,
              center_y: Math.round((detection.y / 1080) * 1000) / 1000,
              width: Math.round((detection.w / 1920) * 1000) / 1000,
              height: Math.round((detection.h / 1080) * 1000) / 1000
            },
            confidence: detection.prob
          }
        });
        newFrameIndex++;
      }
    } catch (e) {
      // console.log('Error parsing line');
      // console.log(e);
    }
  });

  console.log(`${newFrameIndex} frames at ${TARGET_FPS} FPS`)

  fs.writeFile(`${pathRawDetectionsReducesFPSOutput}`, JSON.stringify(detectionsTargetFPS), function() {
    console.log('Output tracker data wrote');
  });
})
