const Tracker = require('../../../tracker/tracker');
const isInsideSomeAreas = require('./utils').isInsideSomeAreas;
const cloneDeep = require('lodash.clonedeep');


const initialState = {
  timeLastFrame: new Date(),
  currentFrame: 0,
  countedItems: [],
  counterData: {
    car: 0
  },
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

    console.log('Tracker data');
    console.log('=========')
    console.log(JSON.stringify(Tracker.getJSONOfTrackedItems()));
    console.log('=========')

    // Count items that have entered a counting area and haven't been already counted
    const newItemsToCount = Tracker.getJSONOfAllTrackedItems()
      .filter((item) => 
          Counter.countedItems.indexOf(item.id) === -1 && // not already counted 
          Counter.currentFrame - item.appearFrame > 3 // matched for more than 3 frames
      ).filter((item) =>
          isInsideSomeAreas(Counter.countingAreas , item.disappearArea, item.idDisplay)
      );

    newItemsToCount.forEach((itemToCount) => {
      Counter.countedItems.push(itemToCount.id);
      Counter.counterData.car++;
    });

    console.log(`Counter: ${Counter.counterData.car} 🚗`);

    // Increment frame number
    Counter.currentFrame++;
  },

  getCountingData: function() {
    return Counter.counterData;
  }
}
