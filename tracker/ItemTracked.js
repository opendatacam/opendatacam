var uuidv4 = require('uuid/v4');

// Properties example
// {
//   "x": 1021,
//   "y": 65,
//   "w": 34,
//   "h": 27,
//   "prob": 26,
//   "name": "car"
// }

var DEFAULT_UNMATCHEDFRAMES_TOLERANCE = 10;

// Use a simple incremental unique id for the display
var idDisplay = 0;

exports.ItemTracked = function(properties){
  var itemTracked = {};
  // ==== Private =====
  // Am I available to be matched?
  itemTracked.available = true;
  // Should I be deleted?
  itemTracked.delete = false;
  // How many unmatched frame should I survive?
  itemTracked.frameUnmatchedLeftBeforeDying = DEFAULT_UNMATCHEDFRAMES_TOLERANCE;
  // ==== Public =====
  itemTracked.x = properties.x;
  itemTracked.y = properties.y;
  itemTracked.w = properties.w;
  itemTracked.h = properties.h;
  itemTracked.name = properties.name;
  // TODO: add itemTracked.yoloIndex
  // Assign an unique id to each Item tracked
  itemTracked.id = uuidv4();
  // Use an simple id for the display and debugging
  itemTracked.idDisplay = idDisplay;
  idDisplay++
  // Give me a new location / size
  itemTracked.update = function(properties){
    this.x = properties.x;
    this.y = properties.y;
    this.w = properties.w;
    this.h = properties.h;
    this.name = properties.name;
    // reset dying counter
    this.frameUnmatchedLeftBeforeDying = DEFAULT_UNMATCHEDFRAMES_TOLERANCE
    // TODO: add itemTracked.yoloIndex ?
  }
  itemTracked.makeAvailable = function() {
    this.available = true;
  }
  itemTracked.makeUnavailable = function() {
    this.available = false;
  }
  itemTracked.countDown = function() {
    this.frameUnmatchedLeftBeforeDying--;
  }
  itemTracked.isDead = function() {
    return this.frameUnmatchedLeftBeforeDying < 0;
  }
  itemTracked.toJSON = function() {
    return {
      id: this.id,
      idDisplay: this.idDisplay,
      x: this.x,
      y: this.y,
      w: this.w,
      h: this.h,
      name: this.name
    }
  }
  return itemTracked;
};

