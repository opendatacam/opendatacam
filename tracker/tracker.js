var ItemTracked = require('./ItemTracked').ItemTracked;
var kdTree = require('./lib/kdTree-min.js').kdTree;


// A dictionary of itemTracked 
// key: uuid
// value: ItemTracked object
var mapOfItemsTracked = new Map();


//For stats only , to count need to have been matched at least MATCHED_MIN time
var nbItemsReallyMatched = 0;
var MATCHED_MIN = 30;
//End stats only

// This should be big
var KTREESEARCH_LIMIT = 10000;
// DISTANCE_LIMIT is the limit tolerated of distance between
// the center of the bbox across frames to be considered the same objects
var DISTANCE_LIMIT = 100;
// Limit the grow of the bbox between two frame to be considered the same object
var SIZE_VARIATION_LIMIT = 100;
// DEFAULT_UNMATCHEDFRAMES_TOLERANCE 
// is the number of frame we wait when an object isn't matched before 
// considering it gone
var DEFAULT_UNMATCHEDFRAMES_TOLERANCE = 30;

// Simple euclidian distance function between two points
var computeEuclidianDistance = function(item1, item2) {
  return Math.sqrt( Math.pow((item1.x - item2.x), 2) + Math.pow((item1.y- item2.y), 2));
}

// Distance function that takes in account bbox size + position
var computeDistance = function(item1, item2) {
  //** 1. COMPUTE EUCLIDIAN DISTANCE BETWEEN CENTERS */
  var euclidianDistance = computeEuclidianDistance(item1, item2)
  // Exclude this item1 to match the other is the distance between
  // the two center has grown too much
  if (euclidianDistance > DISTANCE_LIMIT) {
    // this is a way to exclude the item from beeing matched
    euclidianDistance = KTREESEARCH_LIMIT + 1;
  }
  //** 2. COMPUTE SIZE VARITION OF BBOX */
  var widthVariation = Math.abs(item1.w - item2.w);
  var heightVariation = Math.abs(item1.h - item2.h);
  var sizeVariation = (widthVariation + heightVariation);
  // Exclude this item1 to match the other is the distance between
  // the two center has grown too much
  if (sizeVariation > SIZE_VARIATION_LIMIT) {
    // this is a way to exclude the item from beeing matched
    sizeVariation = KTREESEARCH_LIMIT + 1;
  }
  // console.log(`euclidianDistance ${euclidianDistance}`);
  // console.log(`sizeVariation ${sizeVariation}`);
  return euclidianDistance + sizeVariation;
}


exports.updateTrackedItemsWithNewFrame = function(detectionsOfThisFrame) {

  // A kd-tree containing all the itemtracked
  // Need to rebuild on each frame, because itemTracked positions have changed
  // don't know how to update the existing kdTree items instead of rebuilding it
  // we could remove / insert updated ones as well if we want to improve perfw
  var treeItemsTracked = new kdTree(Array.from(mapOfItemsTracked.values()), computeDistance, ["x", "y", "w", "h"]);

  // Contruct a kd tree for the detections of this frame
  // For now don't add the index in yolo array
  var treeDetectionsOfThisFrame = new kdTree(detectionsOfThisFrame, computeDistance, ["x", "y", "w", "h"]);

  // SCENARIO 1: itemsTracked map is empty
  if(mapOfItemsTracked.size === 0) {
    // Just add every detected item as item Tracked
    detectionsOfThisFrame.forEach(function(itemDetected) {
      var newItemTracked = ItemTracked(itemDetected, DEFAULT_UNMATCHEDFRAMES_TOLERANCE)
      // Add it to the map
      mapOfItemsTracked.set(newItemTracked.id, newItemTracked)
      // Add it to the kd tree
      treeItemsTracked.insert(newItemTracked);
    });
  }
  // SCENARIO 2: We have fewer itemTracked than item detected by YOLO in the new frame
  else if (mapOfItemsTracked.size <= detectionsOfThisFrame.length) {
    var matchedList = new Array(detectionsOfThisFrame.length);
    matchedList.fill(false);
    // Match existing Tracked items with the items detected in the new frame
    // For each look in the new detection to find the closest match
    mapOfItemsTracked.forEach(function(itemTracked) {
      
      var treeSearchResult = treeDetectionsOfThisFrame.nearest(itemTracked, 1, KTREESEARCH_LIMIT)[0];

      // If we have found something
      if(treeSearchResult) {
        var indexClosestNewDetectedItem = detectionsOfThisFrame.indexOf(treeSearchResult[0]);
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
        // Add it to the kd tree
        treeItemsTracked.insert(newItemTracked);
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

      var treeSearchResult = treeItemsTracked.nearest(newItemDetected, 1, KTREESEARCH_LIMIT)[0];

      // If we have found something
      if(treeSearchResult) {
        var itemTrackedMatched = mapOfItemsTracked.get(treeSearchResult[0].id);

        itemTrackedMatched.makeUnavailable();
        // Update properties
        itemTrackedMatched.update(newItemDetected);
      }

    });

    // Count unmatched frame for unmatched itemTracked
    // and delete stalled itemTracked
    mapOfItemsTracked.forEach(function(itemTracked) {
      if(itemTracked.available) {
        itemTracked.countDown();
        itemTracked.updateTheoricalPosition();
        if(itemTracked.isDead()) {
          mapOfItemsTracked.delete(itemTracked.id);
          treeItemsTracked.remove(itemTracked);
          // If itemTracked was matched more than 30 times, count it
          if(itemTracked.nbTimeMatched >= MATCHED_MIN) {
            nbItemsReallyMatched++;
          }
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


exports.printNbOfItemMatchedOverTime = function() {
  // Add the ones still in the tree
  Array.from(mapOfItemsTracked.values()).forEach((itemTracked) => {
    if(itemTracked.nbTimeMatched >= MATCHED_MIN) {
      nbItemsReallyMatched++;
    }
  })
  console.log(`Nb items really  matched ${nbItemsReallyMatched}`);
  console.log(`Nb item matched: ${Array.from(mapOfItemsTracked.values()).pop().idDisplay}`);
};

