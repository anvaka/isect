/**
 * Just a collection of geometry related utilities
 */

// This is used for precision checking (e.g. two numbers are equal
// if their difference is smaller than this number). The value is 
// chosen empirically. We still may run into precision related issues.
// TODO: we should allow consumers to configure this.
export const EPS = 1e-9;//10;

export function getIntersectionXPoint(segment, xPos, yPos) {
  var dy1 = segment.from.y - yPos;
  var dy2 = yPos - segment.to.y;
  var dy = segment.to.y - segment.from.y;
  if (Math.abs(dy1) < EPS) {
    // The segment starts on the sweep line
    if (Math.abs(dy) < EPS) {
      // the segment is horizontal. Intersection is at the point
      if (xPos <= segment.from.x) return segment.from.x;
      if (xPos > segment.to.x) return segment.to.x;
      return xPos;
    }
    return segment.from.x;
  }
  
  var dx = (segment.to.x - segment.from.x); 
  var xOffset; 
  if (dy1 >= dy2) {
    xOffset = dy1 * (dx / dy); 
    return (segment.from.x - xOffset);
  } 
  xOffset = dy2 * (dx / dy);
  return (segment.to.x + xOffset);
}

export function angle(dx, dy) {
  // https://stackoverflow.com/questions/16542042/fastest-way-to-sort-vectors-by-angle-without-actually-computing-that-angle
  var p = dx/(Math.abs(dx) + Math.abs(dy)) // -1 .. 1 increasing with x

  if (dy < 0) return p - 1;  // -2 .. 0 increasing with x
  return 1 - p               //  0 .. 2 decreasing with x
}

export function intersectSegments(a, b) {
  //  https://stackoverflow.com/a/1968345/125351
  var aStart = a.from, bStart = b.from;
  var p0_x = aStart.x, p0_y = aStart.y,
      p2_x = bStart.x, p2_y = bStart.y;

  var s1_x = a.dx, s1_y = a.dy, s2_x = b.dx, s2_y = b.dy;
  var div = s1_x * s2_y - s2_x * s1_y;

  var s = (s1_y * (p0_x - p2_x) - s1_x * (p0_y - p2_y)) / div;
  if (s < 0 || s > 1) return;

  var t = (s2_x * (p2_y - p0_y) + s2_y * (p0_x - p2_x)) / div;

  if (t >= 0 && t <= 1) {
    return {
      x: p0_x - (t * s1_x),
      y: p0_y - (t * s1_y)
    }
  }
}

export function same(x0, x1, y0, y1) {
  return Math.abs(x0 - x1) < EPS && Math.abs(y0 - y1) < EPS;
}

export function samePoint(a, b) {
  return Math.abs(a.x - b.x) < EPS && Math.abs(a.y - b.y) < EPS;
}
