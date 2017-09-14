var ItemTracked = require('./ItemTracked').ItemTracked;

// A dictionary of itemTracked 
// key: uuid
// value: ItemTracked object
var mapOfItemsTracked = new Map();

// DISTANCE_LIMIT is the limit tolerated of distance between
// the center of the bbox across frames to be considered the same objects
var DISTANCE_LIMIT = 40
// DEFAULT_UNMATCHEDFRAMES_TOLERANCE 
// is the number of frame we wait when an object isn't matched before 
// considering it gone
var DEFAULT_UNMATCHEDFRAMES_TOLERANCE = 10;

// Simple euclidian distance function between two points
var computeDistance = function(item1, item2) {
  return Math.sqrt( Math.pow((item1.x - item2.x), 2) + Math.pow((item1.y- item2.y), 2));
}

exports.updateTrackedItemsWithNewFrame = function(detectionsOfThisFrame) {

  // SCENARIO 1: itemsTracked map is empty
  if(mapOfItemsTracked.size === 0) {
    // Just add every detected item as item Tracked
    detectionsOfThisFrame.forEach(function(itemDetected) {
      var newItemTracked = ItemTracked(itemDetected, DEFAULT_UNMATCHEDFRAMES_TOLERANCE)
      // Add it to the map
      mapOfItemsTracked.set(newItemTracked.id, newItemTracked)
    });
  }
  // SCENARIO 2: We have fewer itemTracked than item detected by YOLO in the new frame
  else if (mapOfItemsTracked.size <= detectionsOfThisFrame.length) {
    var matchedList = new Array(detectionsOfThisFrame.length);
    matchedList.fill(false);
    // Match existing Tracked items with the items detected in the new frame
    // For each look in the new detection to find the closest match
    mapOfItemsTracked.forEach(function(itemTracked) {
      var indexClosestNewDetectedItem = -1;
      var closestDistance = DISTANCE_LIMIT;
      detectionsOfThisFrame.forEach(function(newItemDetected, indexNewItemDetected) {
        var distance = computeDistance(itemTracked, newItemDetected);
        if(distance < closestDistance) {
          // Something closer found
          closestDistance = distance;
          indexClosestNewDetectedItem = indexNewItemDetected;
        }
      });

      // If something is found
      if(indexClosestNewDetectedItem > -1)  {
        matchedList[indexClosestNewDetectedItem] = true;
        // Update properties of tracked object
        var updatedTrackedItemProperties = detectionsOfThisFrame[indexClosestNewDetectedItem]
        mapOfItemsTracked.get(itemTracked.id)
                        .update(updatedTrackedItemProperties)

      }
    });

    // Add any unmatched items as new trackedItems
    matchedList.forEach(function(matched, index) {
      if(!matched) {
        var newItemTracked = ItemTracked(detectionsOfThisFrame[index], DEFAULT_UNMATCHEDFRAMES_TOLERANCE)
        // Add it to the map
        mapOfItemsTracked.set(newItemTracked.id, newItemTracked)
      }
    });

    // TODO
    // We should start killing the itemTracked that haven't been matched also as scenario 3 
  }
  // SCENARIO 3 : We have more itemTracked than item detected by YOLO in the new frame
  else {
    // All itemTracked should start as beeing available for matching
    mapOfItemsTracked.forEach(function(itemTracked) {
      itemTracked.makeAvailable();
    });

    // For every new detection of this frame, try to find a match in the existing
    // tracked items
    detectionsOfThisFrame.forEach(function(newItemDetected, indexNewItemDetected) {
      var idClosestExistingTrackedItem = null;
      var closestDistance = DISTANCE_LIMIT;

      mapOfItemsTracked.forEach(function(itemTracked) {
        var distance = computeDistance(itemTracked, newItemDetected);
        if(distance < closestDistance && itemTracked.available) {
          // Something closer found
          closestDistance = distance;
          idClosestExistingTrackedItem = itemTracked.id;
        }
      });

      // If we have found a match
      if(idClosestExistingTrackedItem !== null) {
        var itemTrackedMatched = mapOfItemsTracked.get(idClosestExistingTrackedItem);
        itemTrackedMatched.makeUnavailable();
        // Update properties
        itemTrackedMatched.update(newItemDetected);
      }

      // Unmatched 
    });

    // Count unmatched frame for unmatched itemTracked
    // and delete stalled itemTracked
    mapOfItemsTracked.forEach(function(itemTracked) {
      if(itemTracked.available) {
        itemTracked.countDown();
        if(itemTracked.isDead()) {
          mapOfItemsTracked.delete(itemTracked.id);
        }
      }
    });
  }
}

exports.getJSONOfTrackedItems = function() {
  return Array.from(mapOfItemsTracked.values()).map(function(itemTracked) {
    return itemTracked.toJSON();
  });
};
