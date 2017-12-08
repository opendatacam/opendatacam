const Tracker = require('node-tracker-by-detections').Tracker;
const isInsideSomeAreas = require('./utils').isInsideSomeAreas;
const cloneDeep = require('lodash.clonedeep');


const initialState = {
  timeLastFrame: new Date(),
  currentFrame: 0,
  countedItems: [],
  counterData: {},
  image: {
    w: 1280,
    h: 720
  },
  countingAreas: [{"x":0,"y":0,"w":1280,"h":720}]
}

let Counter = cloneDeep(initialState);

module.exports = {

  reset: function() {
    // Reset counter
    Counter = cloneDeep(initialState);
    // Reset tracker
    Tracker.reset();
  },

  updateWithNewFrame: function(detectionsOfThisFrame) {

    // Compute FPS
    const now = new Date();
    const timeDiff = Math.abs(now.getTime() - Counter.timeLastFrame.getTime());
    Counter.timeLastFrame = now;
    console.log(`YOLO detections FPS: ${1000 / timeDiff}`);

    // Scale detection
    const detectionScaledOfThisFrame = detectionsOfThisFrame.map((detection) => {
      return {
        name: detection.class,
        x: detection.x * Counter.image.w,
        y: detection.y * Counter.image.h,
        w: detection.w * Counter.image.w,
        h: detection.h * Counter.image.h
      };
    });


    console.log(`Received Detection:`);
    console.log('=========');
    console.log(JSON.stringify(detectionScaledOfThisFrame));
    console.log('=========');
    console.log('Update tracker with this frame')
    console.log(`Frame id: ${Counter.currentFrame}`);
    console.log('=========')

    Tracker.updateTrackedItemsWithNewFrame(detectionScaledOfThisFrame, Counter.currentFrame);


    const trackerDataForThisFrame = Tracker.getJSONOfTrackedItems();

    console.log('Tracker data');
    console.log('=========')
    console.log(JSON.stringify(trackerDataForThisFrame));
    console.log('=========')

    // Count items that have entered a counting area and haven't been already counted
    const newItemsToCount = trackerDataForThisFrame.filter((item) => 
      Counter.countedItems.indexOf(item.id) === -1 && // not already counted 
      (Counter.currentFrame - item.appearFrame) > 3 // matched for more than 3 frames
    )
    // Do not filter on disappear Area as we are prototyping with a static scene
    // .filter((item) =>
      // isInsideSomeAreas(Counter.countingAreas , item.disappearArea, item.idDisplay)
    // );

    newItemsToCount.forEach((itemToCount) => {
      Counter.countedItems.push(itemToCount.id);
      if(Counter.counterData[itemToCount.name]) {
        Counter.counterData[itemToCount.name]++;
      } else {
        Counter.counterData[itemToCount.name] = 1;
      }
      
    });

    // Increment frame number
    Counter.currentFrame++;
  },

  getCountingData: function() {
    return Counter.counterData;
  }
}
