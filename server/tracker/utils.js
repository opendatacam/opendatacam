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
  },

  computeLineBearing: function(x1,y1,x2,y2) {
    var angle = Math.atan((x2-x1)/(y1-y2))/(Math.PI/180)
    if ( angle > 0 ) {
      if (y1 < y2)
        return angle;
      else
        return 180 + angle;
    } else {
      if (x1 < x2)
        return 180 + angle;
      else
        return 360 + angle;
    }
  }
}
