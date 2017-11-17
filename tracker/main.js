var fs  = require("fs");
var Tracker = require('./Tracker');

yolo = {};
tracked = {};

var args = process.argv.slice(2);

// var path = "../app/static/detections/1_prototype_video";
var path = args[0];

// Larger than 40% of the frame
var LARGEST_ALLOWED = 1920 * 40 / 100;

var DETECT_LIST = ["car", "bicycle", "truck", "motorbike"];

// var IGNORED_AREAS = [{"x":634,"y":1022,"w":192,"h":60},{"x":1240,"y":355,"w":68,"h":68},{"x":1295,"y":335,"w":56.00000000000001,"h":56.00000000000001},{"x":1337,"y":300,"w":57.99999999999999,"h":57.99999999999999},{"x":1378,"y":265,"w":57.99999999999999,"h":57.99999999999999},{"x":1461,"y":-2.25,"w":378,"h":282},{"x":1770,"y":825,"w":180,"h":200}];
var IGNORED_AREAS = [];

function isInsideArea(area, point) {
  const xMin = area.x
  const xMax = area.x + area.w;
  const yMin = area.y
  const yMax = area.y + area.h;
  
  if(point.x >= xMin &&
     point.x <= xMax &&
     point.y >= yMin &&
     point.y <= yMax) {
    return true;
  } else {
    return false;
  }
}

function isInsideSomeAreas(areas, point) {
  const isInside = areas.some((area) => isInsideArea(area, point));
  return isInside;
}

function ignoreObjectsNotToDetect(detections, objectsToDetect) {
  return detections.filter((detection) => objectsToDetect.indexOf(detection.name) > -1)
}

// clean yolo noise "large detections"
function isTooLarge(detections) {
  if(detections.w >= LARGEST_ALLOWED) {
    return true;
  } else {
    return false;
  }
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
      let detectionsForThisFrame = yolo[frameNb].filter((detection) => !isInsideSomeAreas(IGNORED_AREAS, detection));
      // Remove unwanted items
      detectionsForThisFrame = ignoreObjectsNotToDetect(detectionsForThisFrame, DETECT_LIST);
      // Remove objects too big
      detectionsForThisFrame = yolo[frameNb].filter((detection) => !isTooLarge(detection));

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

    // fs.writeFile(`${path}/tracker-general.json`, JSON.stringify(tracked["general"]), function() {
    //   console.log('tracked general data wrote');
    // });
});





