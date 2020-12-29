import { scaleDetection, scalePoint } from '../../../utils/resolution';
import { evaluateCSSVariable, getCounterColor } from '../../../utils/colors';
import tailwindConfig from '../../../tailwind.config';

const { colors } = tailwindConfig.theme.extend;

class LiveViewEngine {
  drawTrackerData(
    context,
    objectTrackerData,
    canvasResolution,
    originalResolution,
  ) {
    context.globalAlpha = 1;
    context.lineWidth = 2;
    objectTrackerData.map((objectTracked) => {
      context.globalAlpha = Math.max(Math.min(objectTracked.opacity, 1), 0);
      const objectTrackedScaled = scaleDetection(
        objectTracked,
        canvasResolution,
        originalResolution,
      );
      const x = objectTrackedScaled.x - objectTrackedScaled.w / 2;
      const y = objectTrackedScaled.y - objectTrackedScaled.h / 2;
      // context.strokeStyle = 'black'
      // context.strokeRect(
      //   x + 5,
      //   y + 5,
      //   objectTrackedScaled.w - 10,
      //   objectTrackedScaled.h - 10
      // )
      context.setLineDash([10, 10]);
      context.strokeStyle = evaluateCSSVariable(colors.default);
      context.strokeRect(
        x + 5,
        y + 5,
        objectTrackedScaled.w - 10,
        objectTrackedScaled.h - 10,
      );
      context.setLineDash([]);
      context.fillStyle = evaluateCSSVariable(colors.default);
      context.fillRect(
        x + 4,
        y - 10,
        objectTrackedScaled.w - 8,
        17,
      );

      // confidence -- text
      context.font = '10px';
      context.fillStyle = evaluateCSSVariable(colors.inverse);
      const rightName = x + 10 + context.measureText(`${objectTrackedScaled.name}`).width;
      const xConfidence = x + objectTrackedScaled.w - 30;
      if (rightName < xConfidence) {
        context.fillText(
          `${Math.round(objectTrackedScaled.confidence * 100)}%`,
          xConfidence,
          y,
        );
      }

      // name -- background
      context.fillStyle = evaluateCSSVariable(colors.default);
      context.fillRect(
        x + 10,
        y - 10,
        context.measureText(`${objectTrackedScaled.name}`).width,
        17,
      );
      // name -- text
      context.fillStyle = evaluateCSSVariable(colors.inverse);
      context.fillText(
        `${objectTrackedScaled.name}`,
        x + 10,
        y,
      );
    });
  }

  drawTrackerDataCounterEditor(
    context,
    objectTrackerData,
    countingAreas,
    canvasResolution,
    originalResolution,
    timeNow = new Date().getTime(),
  ) {
    context.globalAlpha = 1;
    context.lineWidth = 2;
    objectTrackerData.map((objectTracked) => {
      const objectTrackedScaled = scaleDetection(
        objectTracked,
        canvasResolution,
        originalResolution,
      );

      const x = objectTrackedScaled.x - objectTrackedScaled.w / 2;
      const y = objectTrackedScaled.y - objectTrackedScaled.h / 2;

      // Counted status
      let displayCountedArea = null;
      // get last counted event
      const countedEvent = objectTracked.counted && objectTracked.counted[objectTracked.counted.length - 1];

      // For lines, display only during 1s after beeing counted
      if (countedEvent && countingAreas.getIn([countedEvent.areaKey, 'type']) !== 'polygon') {
        if (timeNow - countedEvent.timeMs < 1000) {
          displayCountedArea = true;
        }
      }

      // For polygon, as long as it is still inside the area
      if (countedEvent && countingAreas.getIn([countedEvent.areaKey, 'type']) === 'polygon') {
        if (objectTracked.areas.indexOf(countedEvent.areaKey) > -1) {
          displayCountedArea = true;
        }
      }

      // Display counted status for lines & polygon
      // => for lines : during 1s after beeing counted
      // => for polygons: as long as it remains inside the area
      if (displayCountedArea) {
        // displayCountedArea contain countingareakey : see Opendatacam.js on server side
        context.strokeStyle = getCounterColor(countingAreas.getIn([countedEvent.areaKey, 'color']));
        context.fillStyle = getCounterColor(countingAreas.getIn([countedEvent.areaKey, 'color']));
        context.strokeRect(
          x + 5,
          y + 5,
          objectTrackedScaled.w - 10,
          objectTrackedScaled.h - 10,
        );
        context.globalAlpha = 0.1;
        context.fillRect(
          x + 5,
          y + 5,
          objectTrackedScaled.w - 10,
          objectTrackedScaled.h - 10,
        );
        context.globalAlpha = 1;
      } else {
        context.setLineDash([10, 10]);
        context.strokeStyle = evaluateCSSVariable(colors.default);
        context.strokeRect(
          x + 5,
          y + 5,
          objectTrackedScaled.w - 10,
          objectTrackedScaled.h - 10,
        );
        context.setLineDash([]);
      }
    });
  }

  drawCountingAreas(
    context,
    countingAreas,
    canvasResolution,
  ) {
    countingAreas.map((area, id) => {
      if (area.get('location') !== null) {
        const data = area.get('location').toJS();
        const color = area.get('color');
        context.strokeStyle = getCounterColor(color);
        context.fillStyle = getCounterColor(color);
        context.lineWidth = 5; // TODO Have those dynamic depending on canvas resolution
        const edgeCircleRadius = 5;

        // Rescale points
        const points = data.points.map((point) => scalePoint(point, canvasResolution, data.refResolution));

        for (let index = 0; index < points.length; index++) {
          const point = points[index];
          // Draw circle
          context.beginPath();
          context.arc(point.x, point.y, edgeCircleRadius, 0, 2 * Math.PI, false);
          context.fill();

          // Draw line
          // Draw line connecting to previous point
          if (index > 0) {
            context.beginPath();
            context.moveTo(points[index - 1].x, points[index - 1].y);
            context.lineTo(points[index].x, points[index].y);
            context.stroke();
          }
        }

        // Draw polygon if length > 2
        if (points.length > 2) {
          context.globalAlpha = 0.3;
          context.beginPath();
          context.moveTo(points[0].x, points[0].y);
          points.map((point) => {
            context.lineTo(point.x, point.y);
            context.lineTo(point.x, point.y);
          });
          context.fill();
          context.globalAlpha = 1;
        }
      }
    });
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

const LiveViewEngineInstance = new LiveViewEngine();

export default LiveViewEngineInstance;
