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
  },

  // Taken from https://stackoverflow.com/a/3838357/1228937
  checkIfLineIntersects(x1, y1, x2, y2, x3, y3, x4, y4) {

    var result = {
      doesIntersect: false,
      angle: null
    }

    // Segment1 = {(x1, y1), (x2, y2)}
    // Segment2 = {(x3, y3), (y4, y4)}

    // The abcisse Range Xa of the potential point of intersection (Xa,Ya) must be contained in both interval I1 and I2, defined as follow :
    // I1 = [Math.min(x1,x2), Math.max(x1,x2)]
    // I2 = [Math.min(x3,x4), Math.max(x3,x4)]

    // And we could say that Xa is included into :
    // Ia = [Math.max(Math.min(x1,x2), Math.min(x3,x4)),
    //  Math.min( Math.max(x1,x2), Math.max(x3,x4) )]

    // Now, we need to check that this interval Ia exists :
    if (Math.max(x1,x2) < Math.min(x3,x4)) {
      return result;
    }

    // So, we have two line formula, and a mutual interval. Your line formulas are:
    // f1(x) = A1*x + b1 = y
    // f2(x) = A2*x + b2 = y

    // TODO add check if one line is vertical (x1-x2 ===  0) or (x3-x4===0)

    // As we got two points by segment, we are able to determine A1, A2, b1 and b2:
    var A1 = (y1-y2)/(x1-x2);
    var A2 = (y3-y4)/(x3-x4);
    var b1 = y1-A1*x1;
    var b2 = y3-A2*x3;

    // If the segments are parallel, then A1 == A2 :
    if (A1 === A2) {
      return result;
    }

    // A point (Xa,Ya) standing on both line must verify both formulas f1 and f2:
    // Ya = A1 * Xa + b1
    // Ya = A2 * Xa + b2
    // A1 * Xa + b1 = A2 * Xa + b2
    // => leads to:
    var Xa = (b2 - b1) / (A1 - A2)

    if ( (Xa < Math.max( Math.min(x1,x2), Math.min(x3,x4) )) || (Xa > Math.min( Math.max(x1,x2), Math.max(x3,x4) )) ) {
      return result;  // intersection is out of bound
    }
    else {

      // intersect, compute angle of intersection


      return {
        doesIntersect: true,
        angle: null
      }
    }
  },

  // Reference: https://jsfiddle.net/justin_c_rounds/Gd2S2/light/
  // Explanation: https://stackoverflow.com/a/24392281/1228937
  checkLineIntersection(line1StartX, line1StartY, line1EndX, line1EndY, line2StartX, line2StartY, line2EndX, line2EndY) {
    // if the lines intersect, the result contains the x and y of the intersection (treating the lines as infinite)
    // and booleans for whether line segment 1 or line segment 2 contain the point
    var denominator, a, b, numerator1, numerator2, result = {
        x: null,
        y: null,
        angle: null,
        onLine1: false,
        onLine2: false
    };
    denominator = ((line2EndY - line2StartY) * (line1EndX - line1StartX)) - ((line2EndX - line2StartX) * (line1EndY - line1StartY));
    if (denominator == 0) {
        return result;
    }
    a = line1StartY - line2StartY;
    b = line1StartX - line2StartX;
    numerator1 = ((line2EndX - line2StartX) * a) - ((line2EndY - line2StartY) * b);
    numerator2 = ((line1EndX - line1StartX) * a) - ((line1EndY - line1StartY) * b);
    a = numerator1 / denominator;
    b = numerator2 / denominator;

    // if we cast these lines infinitely in both directions, they intersect here:
    result.x = line1StartX + (a * (line1EndX - line1StartX));
    result.y = line1StartY + (a * (line1EndY - line1StartY));
    /*
      // it is worth noting that this should be the same as:
      x = line2StartX + (b * (line2EndX - line2StartX));
      y = line2StartX + (b * (line2EndY - line2StartY));
    */
    // if line1 is a segment and line2 is infinite, they intersect if:
    if (a > 0 && a < 1) {
        result.onLine1 = true;
    }
    // if line2 is a segment and line1 is infinite, they intersect if:
    if (b > 0 && b < 1) {
        result.onLine2 = true;
    }
    // if line1 and line2 are segments, they intersect if both of the above are true
    if(result.onLine1 && result.onLine2) {
      // compute angle of intersection
      // TODO ADD case one of the line is vertical, compute with an horizontal line and do alpha = 90 - gamma

      // So, we have two line formula, and a mutual interval. Your line formulas are:
      // f1(x) = A1*x + b1 = y
      // f2(x) = A2*x + b2 = y
      // As we got two points by segment, we are able to determine A1, A2, b1 and b2:
      var A1 = (line1StartY-line1EndY)/(line1StartX-line1EndX);
      var A2 = (line2StartY-line2EndY)/(line2StartX-line2EndX);

      tanAlpha = Math.abs((A2 - A1) / (1 + A1 * A2));
      var angle = Math.atan(tanAlpha) * 180/Math.PI;

      result.angle = angle;
    }

    return result;
  }
}
