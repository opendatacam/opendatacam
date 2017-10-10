var fs  = require("fs");
var Tracker = require('./Tracker');

yolo = {};
tracked = {};

var file = "../app/static/detections/level_1/rawdetections";

var IGNORED_AREAS = [{
  xMin: 0,
  yMin: 0,
  xMax: 308,
  yMax: 251
},{
  xMin: 628,
  yMin: 0,
  xMax: 1280,
  yMax: 156
}];

function ignoreAreas(detections, ignoredAreas) {
  return detections.filter((detection) => {
    let insideIgnoredArea = false;
    ignoredAreas.map((ignoredArea) => {
      if(detection.x > ignoredArea.xMin &&
         detection.x < ignoredArea.xMax &&
        detection.y > ignoredArea.yMin &&
        detection.y < ignoredArea.yMax) {
        console.log('ignore');
        console.log(detection);
        insideIgnoredArea = true;
      }
    });
    return !insideIgnoredArea;
  });
}

fs.readFile(`${file}.txt`, function(err, f){
    var lines = f.toString().split('\n');
    lines.forEach(function(l) {
      try {
        var detection = JSON.parse(l);
        yolo[detection.frame] = detection.detections;
      } catch (e) {
        console.log('error parsing line:');
        console.log(l);
      }
    });

    

    Object.keys(yolo).forEach(function(timecode) {
      // Remove unwanted areas
      let detectionsForThisFrame = ignoreAreas(yolo[timecode], IGNORED_AREAS);

      Tracker.updateTrackedItemsWithNewFrame(detectionsForThisFrame);
      tracked[timecode] = Tracker.getJSONOfTrackedItems();
    });

    Tracker.printNbOfItemMatchedOverTime();

    fs.writeFile(`${file}_tracker.json`, JSON.stringify(tracked), function() {
      console.log('tracked data wrote');
    });
});





