import { scaleDetection } from '../../../utils/resolution';
import { getPathfinderColors } from '../../../utils/colors';

class PathViewEngine {

  constructor() {
    this.lastFrameData = [];
    this.pathsColors = getPathfinderColors();
  }

  drawLine(context, line, color = 'green') {
    context.strokeStyle = color;
    context.lineWidth = 5;
    context.lineCap = "round";
    context.beginPath();
    context.moveTo(line.pointA.x, line.pointA.y);
    context.lineTo(line.pointB.x, line.pointB.y);
    context.stroke();
  }

  drawPaths (context, currentFrameData,  canvasResolution, originalResolution) {
    this.lastFrameData = currentFrameData.map((objectTracked) => {
      let trackedItemScaled = scaleDetection(
        objectTracked,
        canvasResolution,
        originalResolution
      )
      // If this tracked Item was already there in last frame
      var lastFrameTrackedItem = this.lastFrameData.find((lastFrameItemTracked) => trackedItemScaled.id === lastFrameItemTracked.id)
      if(lastFrameTrackedItem) {
        let color = lastFrameTrackedItem.color ? lastFrameTrackedItem.color : this.pathsColors[Math.floor(Math.random()*this.pathsColors.length)]
        trackedItemScaled.color = color;
        this.drawLine(context, {
          pointA: {
            x: lastFrameTrackedItem.x,
            y: lastFrameTrackedItem.y
          },
          pointB: {
            x: trackedItemScaled.x,
            y: trackedItemScaled.y
          }
        }, color)
      }

      return trackedItemScaled;
    })
  }

  resetLastFrameData() {
    this.lastFrameData = [];
  }
}

export default PathViewEngine
