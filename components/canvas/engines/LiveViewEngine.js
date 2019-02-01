import { scaleDetection } from '../../../utils/resolution';

class LiveViewEngine {
  drawTrackerData (
    context,
    objectTrackerData,
    canvasResolution,
    originalResolution
  ) {
    context.globalAlpha = 1
    context.strokeStyle = 'blue'
    context.lineWidth = 5
    context.font = '30px Arial'
    context.fillStyle = 'blue'
    objectTrackerData.map(objectTracked => {
      let objectTrackedScaled = scaleDetection(
        objectTracked,
        canvasResolution,
        originalResolution
      )
      context.fillStyle = 'blue'
      context.strokeStyle = 'blue'
      let x = objectTrackedScaled.x - objectTrackedScaled.w / 2
      let y = objectTrackedScaled.y - objectTrackedScaled.h / 2
      context.strokeRect(
        x + 5,
        y + 5,
        objectTrackedScaled.w - 10,
        objectTrackedScaled.h - 10
      )
      context.fillText(
        objectTrackedScaled.id,
        x + objectTrackedScaled.w / 2 - 20,
        y + objectTrackedScaled.h / 2
      )
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
