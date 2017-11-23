const Tracker = require('../../../tracker/tracker');
const isInsideSomeAreas = require('./utils').isInsideSomeAreas;
const cloneDeep = require('lodash.clonedeep');


const initialState = {
  currentFrame: 0,
  countedItems: [],
  counterData: {
    car: 0
  },
  image: {
    w: 1280,
    h: 720
  },
  countingAreas: [{"x":0,"y":280,"w":426.66,"h":200}]
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

    // Scale detection
    const detectionScaledOfThisFrame = detectionsOfThisFrame.map((detection) => {
        let detectionScaled = detection;
        detectionScaled.name = detection.class;
        detectionScaled.x = detection.x * imageWidth;
        detectionScaled.y = detection.y * imageHeight;
        detectionScaled.w = detection.w * imageWidth;
        detectionScaled.h = detection.h * imageHeight;
        return detectionScaled;
    });


    console.log(`Received Detection:`);
    console.log('=========');
    console.log(JSON.stringify(detectionScaledOfThisFrame));
    console.log('=========');
    console.log('Update tracker with this frame')
    console.log(`Frame id: ${Counter.currentFrame}`);
    console.log('=========')

    Tracker.updateTrackedItemsWithNewFrame(detectionScaledOfThisFrame, Counter.currentFrame);

    // console.log('Tracker data');
    // console.log('=========')
    // console.log(JSON.stringify(Tracker.getJSONOfTrackedItems()));
    // console.log('=========')

    // Count items that have entered a counting area and haven't been already counted
    const newItemsToCount = Tracker.getJSONOfAllTrackedItems()
      .filter((item) => 
          Counter.countedItems.indexOf(item.id) === -1 && // not already counted 
          item.nbActiveFrame > 3
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
