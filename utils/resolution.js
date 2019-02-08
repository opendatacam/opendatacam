export function scaleDetection (
    detection,
    canvasResolution,
    originalResolution
  ) {
    return {
        ...detection,
        x: detection.x * canvasResolution.w / originalResolution.w,
        y: detection.y * canvasResolution.h / originalResolution.h,
        w: detection.w * canvasResolution.w / originalResolution.w,
        h: detection.h * canvasResolution.h / originalResolution.h
    }
}

export function scalePoint (
  point,
  canvasResolution,
  originalResolution
) {
  return {
      ...point,
      x: point.x * canvasResolution.w / originalResolution.w,
      y: point.y * canvasResolution.h / originalResolution.h
  }
}