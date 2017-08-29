const _ = require('lodash');

// encodes a given time in millis into color channels of an image
function encodeTime(frame, millis, size) {
  let binStr = millis.toString(2);
  binStr = binStr.padStart(42, '0');
  let binValues = binStr.split('');
  binValues = binValues.map(function(b){ return Number(b)*255 });
  let chunks = _.chunk(binValues, 3);
  let repeatedChunks = chunks.map(function(c) { return Array(size).fill(c)});
  repeatedChunks = _.flattenDeep(repeatedChunks);
  for (let i = 0; i < repeatedChunks.length; i++) {
    frame.writeUInt8(repeatedChunks[i], i);
  }
}

function formatDetections(detections, dimensions) {
  return detections.map(function(d){
    return {
      x: ~~(d.x*dimensions.width),
      y: ~~(d.y*dimensions.height),
      w: ~~(d.w*100),
      h: ~~(d.h*100),
      prob: ~~(d.prob*100),
      name: d.name
    }
  });
}

module.exports.encodeTime = encodeTime;
module.exports.formatDetections = formatDetections;
