var fs  = require("fs");
var Tracker = require('./Tracker');

yolo = {};
tracked = {};

var path = "../app/static/detections/1_prototype_video";


var IGNORED_AREAS = [];

// var IGNORED_AREAS = [{
//   xMin: 0,
//   yMin: 0,
//   xMax: 308,
//   yMax: 251
// },{
//   xMin: 628,
//   yMin: 0,
//   xMax: 1280,
//   yMax: 156
// }];

function ignoreAreas(detections, ignoredAreas) {
  return detections.filter((detection) => {
    let insideIgnoredArea = false;
    ignoredAreas.map((ignoredArea) => {
      if(detection.x > ignoredArea.xMin &&
         detection.x < ignoredArea.xMax &&
        detection.y > ignoredArea.yMin &&
        detection.y < ignoredArea.yMax) {
        insideIgnoredArea = true;
      }
    });
    return !insideIgnoredArea;
  });
}

fs.readFile(`${path}/rawdetections.txt`, function(err, f){
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


    Object.keys(yolo).forEach(function(frameNb) {
      // Remove unwanted areas
      let detectionsForThisFrame = ignoreAreas(yolo[frameNb], IGNORED_AREAS);

      Tracker.updateTrackedItemsWithNewFrame(detectionsForThisFrame, parseInt(frameNb, 10));
      tracked[frameNb] = Tracker.getJSONOfTrackedItems();
    });

    tracked["general"] = Tracker.getJSONOfAllTrackedItems();

    const NB_ACTIVE_FRAME = 60;
    console.log(`Nb items that appeared then dissapeared and have been matched for more than ${NB_ACTIVE_FRAME} frames`);
    console.log(tracked["general"].filter((item) => item.nbActiveFrame > NB_ACTIVE_FRAME).length);


    fs.writeFile(`${path}/tracker.json`, JSON.stringify(tracked), function() {
      console.log('tracked data wrote');
    });
});





