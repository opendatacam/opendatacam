var fs  = require("fs");
var Tracker = require('./Tracker');

yolo = {};
tracked = {};

var file = "../app/static/detections/level_1/rawdetections";

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
      Tracker.updateTrackedItemsWithNewFrame(yolo[timecode]);
      tracked[timecode] = Tracker.getJSONOfTrackedItems();
    });

    Tracker.printNbOfItemMatchedOverTime();

    fs.writeFile(`${file}_tracker.json`, JSON.stringify(tracked), function() {
      console.log('tracked data wrote');
    });
});





