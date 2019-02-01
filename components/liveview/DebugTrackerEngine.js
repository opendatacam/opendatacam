import { scaleDetection } from '../../../../utils/resolution'

class DebugTrackerEngine {
  drawObjectTrackerData (
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
      if (objectTrackedScaled.isZombie) {
        context.fillStyle = `rgba(255, 153, 0, ${
          objectTrackedScaled.zombieOpacity
        })`
        context.strokeStyle = `rgba(255, 153, 0, ${
          objectTrackedScaled.zombieOpacity
        })`
      } else {
        context.fillStyle = 'blue'
        context.strokeStyle = 'blue'
      }
      let x = objectTrackedScaled.x - objectTrackedScaled.w / 2
      let y = objectTrackedScaled.y - objectTrackedScaled.h / 2
      context.strokeRect(
        x + 5,
        y + 5,
        objectTrackedScaled.w - 10,
        objectTrackedScaled.h - 10
      )
      context.fillText(
        objectTrackedScaled.idDisplay,
        x + objectTrackedScaled.w / 2 - 20,
        y + objectTrackedScaled.h / 2
      )
    })
  }

  drawRawDetections (context, detections, canvasResolution, originalResolution) {
    context.strokeStyle = '#f00'
    context.lineWidth = 5
    context.font = '15px Arial'
    context.fillStyle = '#f00'
    detections.map(detection => {
      let scaledDetection = scaleDetection(
        detection,
        canvasResolution,
        originalResolution
      )
      let x = scaledDetection.x - scaledDetection.w / 2
      let y = scaledDetection.y - scaledDetection.h / 2
      context.strokeRect(x, y, scaledDetection.w, scaledDetection.h)
      context.fillText(scaledDetection.name, x, y - 10)
    })
  }
}

const DebugTrackerEngineInstance = new DebugTrackerEngine()

export default DebugTrackerEngineInstance
