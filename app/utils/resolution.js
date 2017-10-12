

export function scaleDetection(detection, canvasResolution, originalResolution) {
  return {
    ...detection,
    x: detection.x * canvasResolution.w / originalResolution.w,
    y: detection.y * canvasResolution.h / originalResolution.h,
    w: detection.w * canvasResolution.w / originalResolution.w,
    h: detection.h * canvasResolution.h / originalResolution.h
  }
}

export function scaleArea(area, finalResolution, originalResolution) {
  return {
    x: area.x * finalResolution.w / originalResolution.w,
    y: area.y * finalResolution.h / originalResolution.h,
    w: area.w * finalResolution.w / originalResolution.w,
    h: area.h * finalResolution.h / originalResolution.h
  }
}

export function isInsideArea(area, point) {
  const xMin = area.x
  const xMax = area.x + area.w;
  const yMin = area.y
  const yMax = area.y + area.h;
  
  if(point.x >= xMin &&
     point.x <= xMax &&
     point.y >= yMin &&
     point.y <= yMax) {
    return true;
  } else {
    return false;
  }
}

export function isInsideSomeAreas(areas, point, idDisplay) {
  const isInside = areas.some((area) => isInsideArea(area, point));
  console.log(`Run isInsideSomeAreas for ${idDisplay}, returned: ${isInside}`);
  return isInside;
}
