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