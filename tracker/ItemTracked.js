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

// Use a simple incremental unique id for the display
var idDisplay = 0;

var computeVelocityVector = function(item1, item2, nbFrame) {
  return {
    dx: (item2.x - item1.x) / nbFrame,
    dy: (item2.y - item1.y) / nbFrame,
  }
}

exports.ItemTracked = function(properties, frameNb, DEFAULT_UNMATCHEDFRAMES_TOLERANCE){
  var DEFAULT_UNMATCHEDFRAMES_TOLERANCE = DEFAULT_UNMATCHEDFRAMES_TOLERANCE;
  var itemTracked = {};
  // ==== Private =====
  // Am I available to be matched?
  itemTracked.available = true;
  // Should I be deleted?
  itemTracked.delete = false;
  // How many unmatched frame should I survive?
  itemTracked.frameUnmatchedLeftBeforeDying = DEFAULT_UNMATCHEDFRAMES_TOLERANCE;
  itemTracked.isZombie = false;
  itemTracked.appearFrame = frameNb;
  itemTracked.disappearFrame = null;
  itemTracked.disappearArea = {};
  // ==== Public =====
  itemTracked.x = properties.x;
  itemTracked.y = properties.y;
  itemTracked.w = properties.w;
  itemTracked.h = properties.h;
  itemTracked.name = properties.name;
  itemTracked.positionHistory = [];
  itemTracked.positionHistory.push({ x: properties.x, y: properties.y});
  itemTracked.velocity = {
    dx: 0,
    dy: 0
  };
  itemTracked.nbTimeMatched = 1;
  // TODO: add itemTracked.yoloIndex
  // Assign an unique id to each Item tracked
  itemTracked.id = uuidv4();
  // Use an simple id for the display and debugging
  itemTracked.idDisplay = idDisplay;
  idDisplay++
  // Give me a new location / size
  itemTracked.update = function(properties, frameNb){
    // if it was zombie and disappear frame was set, reset it to null
    if(this.disappearFrame) {
      this.disappearFrame = null;
      this.disappearArea = {}
    }
    this.isZombie = false;
    this.nbTimeMatched += 1;
    this.x = properties.x;
    this.y = properties.y;
    this.positionHistory.push({x: this.x, y: this.y});
    this.w = properties.w;
    this.h = properties.h;
    this.name = properties.name;
    // reset dying counter
    this.frameUnmatchedLeftBeforeDying = DEFAULT_UNMATCHEDFRAMES_TOLERANCE
    // TODO: add itemTracked.yoloIndex ?
    // Compute new velocityVector based on last positions history
    this.velocity = this.updateVelocityVector();
  }
  itemTracked.makeAvailable = function() {
    this.available = true;
  }
  itemTracked.makeUnavailable = function() {
    this.available = false;
  }
  itemTracked.countDown = function(frameNb) {
    // Set frame disappear number 
    if(this.disappearFrame === null) {
      this.disappearFrame = frameNb;
      this.disappearArea = {
        x: this.x,
        y: this.y,
        w: this.w,
        h: this.h
      }
    }
    this.frameUnmatchedLeftBeforeDying--;
    this.isZombie = true;
    // If it was matched less than 1 time, it should die quick
    if(this.nbTimeMatched <= 1) {
      this.frameUnmatchedLeftBeforeDying = -1;
    }
  }
  itemTracked.updateTheoricalPosition = function() {
    this.positionHistory.push({x: this.x, y: this.y});
    this.x = this.x + this.velocity.dx;
    this.y = this.y + this.velocity.dy;
  }
  itemTracked.isDead = function() {
    return this.frameUnmatchedLeftBeforeDying < 0;
  }
  // average based on the last X frames
  itemTracked.updateVelocityVector = function() {
    var AVERAGE_NBFRAME = 15;
    if(this.positionHistory.length <= AVERAGE_NBFRAME) {
      return computeVelocityVector(this.positionHistory[0], this.positionHistory[this.positionHistory.length - 1], AVERAGE_NBFRAME);
    } else {
      return computeVelocityVector(this.positionHistory[this.positionHistory.length - AVERAGE_NBFRAME], this.positionHistory[this.positionHistory.length - 1], AVERAGE_NBFRAME);
    }
  }
  itemTracked.toJSON = function() {
    return {
      id: this.id,
      idDisplay: this.idDisplay,
      x: this.x,
      y: this.y,
      w: this.w,
      h: this.h,
      bearing: Math.atan(this.velocity.dy / this.velocity.dx),
      name: this.name,
      isZombie: this.isZombie,
      zombieOpacity: this.frameUnmatchedLeftBeforeDying / DEFAULT_UNMATCHEDFRAMES_TOLERANCE,
      appearFrame: this.appearFrame,
      disappearFrame: this.disappearFrame
    }
  }
  itemTracked.toJSONGenericInfo = function() {
    return {
      id: this.id,
      idDisplay: this.idDisplay,
      appearFrame: this.appearFrame,
      disappearFrame: this.disappearFrame,
      disappearArea: this.disappearArea,
      nbActiveFrame: this.disappearFrame - this.appearFrame
    }
  }
  return itemTracked;
};

