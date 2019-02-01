const self = module.exports = {
  isInsideArea: function(area, point) {
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
  },

  isInsideSomeAreas: function(areas, point, idDisplay) {
    const isInside = areas.some((area) => self.isInsideArea(area, point));
    return isInside;
  }
}
