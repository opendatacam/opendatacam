var fs  = require("fs");
var Tracker = require('./Tracker');

yolo = {};
tracked = {};

fs.readFile("../x-playground/tracker-test/C0082-47mm_detected.txt", function(err, f){
    var lines = f.toString().split('\n');
    lines.forEach(function(l) {
      try {
        var detection = JSON.parse(l);
        yolo[detection.time] = detection.detections;
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

    fs.writeFile('../x-playground/tracker-test/trackerData.json', JSON.stringify(tracked), function() {
      console.log('tracked data wrote');
    });
});





