var fs = require("fs");

// Utility to transform the 30 FPS detection simulation data to a 
// real world 8 FPS one

var TARGET_FPS = 8;
var INPUT_FPS = 30;

var pathRawDetectionsInput = 'static/placeholder/rawdetections.txt'
var pathRawDetectionsReducesFPSOutput = 'static/placeholder/rawdetections8FPS.json'

fs.readFile(`${pathRawDetectionsInput}`, function(err, f){
  var lines = f.toString().split('\n');
  var newFrameIndex = 0;
  var detectionsTargetFPS = {};
  console.log(`Turning ${lines.length} frames at 30 FPS into`)
  lines.forEach(function(l) {
    try {
      var detection = JSON.parse(l);
      if(detection.frame % (INPUT_FPS / TARGET_FPS) < 1) {
        detectionsTargetFPS[newFrameIndex] = detection.detections;
        newFrameIndex++;
      }
    } catch (e) {
      // console.log('Error parsing line');
      // console.log(e);
    }
  });

  console.log(`${newFrameIndex} frames at 8 FPS`)

  fs.writeFile(`${pathRawDetectionsReducesFPSOutput}`, JSON.stringify(detectionsTargetFPS), function() {
    console.log('Output tracker data wrote');
  });
})
