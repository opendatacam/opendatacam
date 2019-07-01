import { scaleDetection } from '../../../utils/resolution';
import { getPathfinderColors } from '../../../utils/colors';
import simpleheat from './simpleheat';
import { getTrackerAccuracyNbFrameBuffer, getTrackerAccuracySettings } from '../../../statemanagement/app/TrackerStateManagement';

class TrackerAccuracyEngine {

  constructor() {
    this.lastFrameData = [];
    this.pathsColors = getPathfinderColors();
    this.simpleheat = null;
    this.heatmapData = [];
  }

  drawAccuracyHeatmap(canvasCtx, currentFrameData, canvasResolution, originalResolution) {
    // if simpleheat engine not initialiaze
    if (!this.simpleheat) {
      this.simpleheat = simpleheat(canvasCtx, canvasResolution)
      this.simpleheat.radius(canvasResolution.w * getTrackerAccuracySettings().radius / 100, canvasResolution.w * getTrackerAccuracySettings().blur / 100);
      this.simpleheat.gradient(getTrackerAccuracySettings().gradient);

    }
    if (this.heatmapData.length > getTrackerAccuracyNbFrameBuffer()) {
      // remove first item
      this.heatmapData.shift()
    }
    this.heatmapData.push(
      currentFrameData
        .filter((trackedItem) => trackedItem.isZombie === true)
        .map((trackedItem) => {
          let trackedItemScaled = scaleDetection(
            trackedItem,
            canvasResolution,
            originalResolution
          )
          return [trackedItemScaled.x, trackedItemScaled.y, getTrackerAccuracySettings().step]
        })
    )
    this.simpleheat.data(this.heatmapData.flat()).draw();
  }
}

export default TrackerAccuracyEngine
