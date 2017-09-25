var fs  = require("fs");
var Tracker = require('./Tracker');

yolo = {};
tracked = {};

fs.readFile("../x-playground/car-disappear/C0082-47mm-absolute.txt", function(err, f){
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

    fs.writeFile('../x-playground/car-disappear/trackerData.json', JSON.stringify(tracked), function() {
      console.log('tracked data wrote');
    });
});





