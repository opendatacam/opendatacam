import { scaleDetection } from '../../../utils/resolution';
import { COLORS } from '../../../utils/colors';

class LiveViewEngine {
  drawTrackerData (
    context,
    objectTrackerData,
    canvasResolution,
    originalResolution
  ) {
    context.globalAlpha = 1
    context.lineWidth = 2
    objectTrackerData.map(objectTracked => {
      let objectTrackedScaled = scaleDetection(
        objectTracked,
        canvasResolution,
        originalResolution
      )
      let x = objectTrackedScaled.x - objectTrackedScaled.w / 2
      let y = objectTrackedScaled.y - objectTrackedScaled.h / 2
      // context.strokeStyle = 'black'
      // context.strokeRect(
      //   x + 5,
      //   y + 5,
      //   objectTrackedScaled.w - 10,
      //   objectTrackedScaled.h - 10
      // )
      context.setLineDash([10, 10]);
      context.strokeStyle = 'white'
      context.strokeRect(
        x + 5,
        y + 5,
        objectTrackedScaled.w - 10,
        objectTrackedScaled.h - 10
      )
      context.setLineDash([]);
      context.fillStyle = 'white';
      context.fillRect(
        x + 4,
        y - 10,
        objectTrackedScaled.w - 8,
        17
      )
      context.font = '10px'
      context.fillStyle = 'black'
      context.fillText(
        `${objectTrackedScaled.name}`,
        x + 8,
        y
      )
    })
  }

  drawTrackerDataCounterEditor (
    context,
    objectTrackerData,
    canvasResolution,
    originalResolution
  ) {
    context.globalAlpha = 1
    context.lineWidth = 2
    objectTrackerData.map(objectTracked => {
      let objectTrackedScaled = scaleDetection(
        objectTracked,
        canvasResolution,
        originalResolution
      )
      
      let x = objectTrackedScaled.x - objectTrackedScaled.w / 2
      let y = objectTrackedScaled.y - objectTrackedScaled.h / 2
    
      if(objectTracked.counted) {
        // counted contain countingareakey : see Opendatacam.js on server side
        context.strokeStyle = COLORS[objectTracked.counted];
        context.fillStyle = COLORS[objectTracked.counted];
        context.strokeRect(
          x + 5,
          y + 5,
          objectTrackedScaled.w - 10,
          objectTrackedScaled.h - 10
        )
        context.globalAlpha = 0.1;
        context.fillRect(
          x + 5,
          y + 5,
          objectTrackedScaled.w - 10,
          objectTrackedScaled.h - 10
        )
        context.globalAlpha = 1;
      } else {
        context.setLineDash([10, 10]);
        context.strokeStyle = 'white'
        context.strokeRect(
          x + 5,
          y + 5,
          objectTrackedScaled.w - 10,
          objectTrackedScaled.h - 10
        )
        context.setLineDash([]);
      }
    })
  }

  // drawRawDetections (context, detections, canvasResolution, originalResolution) {
  //   context.strokeStyle = '#f00'
  //   context.lineWidth = 5
  //   context.font = '15px Arial'
  //   context.fillStyle = '#f00'
  //   detections.map(detection => {
  //     let scaledDetection = scaleDetection(
  //       detection,
  //       canvasResolution,
  //       originalResolution
  //     )
  //     let x = scaledDetection.x - scaledDetection.w / 2
  //     let y = scaledDetection.y - scaledDetection.h / 2
  //     context.strokeRect(x, y, scaledDetection.w, scaledDetection.h)
  //     context.fillText(scaledDetection.name, x, y - 10)
  //   })
  // }
}

const LiveViewEngineInstance = new LiveViewEngine()

export default LiveViewEngineInstance
