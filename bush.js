import Flatbush from 'flatbush';
import intersectSegments from './src/intersectSegments';

/**
 * This implementation is inspired by discussion here 
 * https://twitter.com/mourner/status/1049325199617921024 and 
 * here https://github.com/anvaka/isect/issues/1
 * 
 * It builds an index of all segments using static spatial index
 * and then for each segment it queries overlapping rectangles.
 */
export default function bush(lines, options) {
  var results = [];
  var reportIntersection = (options && options.onFound) || 
                            defaultIntersectionReporter;
  var asyncState;

  var index = new Flatbush(lines.length);
  lines.forEach(addToIndex);
  index.finish();

  return {
    run: run,
    step: step,
    results: results,

    // undocumented, don't use unless you know what you are doing:
    checkIntersection: checkIntersection
  }

  function run() {
    for (var i = 0; i < lines.length; ++i) {
      if (checkIntersection(lines[i], i)) {
        return; // stop early
      }
    }
    return results;
  }

  function checkIntersection(currentSegment, currentId) {
    // sorry about code duplication.
    var minX = currentSegment.from.x; var maxX = currentSegment.to.x;
    var minY = currentSegment.from.y; var maxY = currentSegment.to.y;
    var t;
    if (minX > maxX) { t = minX; minX = maxX; maxX = t; }
    if (minY > maxY) { t = minY; minY = maxY; maxY = t; }

    var ids = index.search(minX, minY, maxX, maxY);

    for (var i = 0; i < ids.length; ++i) {
      var segmentIndex = ids[i];
      if (segmentIndex <= currentId) continue; // we have either reported it, or it is current.

      var otherSegment = lines[segmentIndex];
      var point = intersectSegments(otherSegment, currentSegment);

      if (point) {
        if (reportIntersection(point, [currentSegment, otherSegment])) {
          // stop early
          return true;
        }
      }
    }
  }

  function step() {
    if (!asyncState) {
      asyncState = {i: 0};
    }
    var test = lines[asyncState.i];
    checkIntersection(test, asyncState.i);
    asyncState.i += 1;
    return asyncState.i < lines.length;
  }


  function addToIndex(line) {
    var minX = line.from.x; var maxX = line.to.x;
    var minY = line.from.y; var maxY = line.to.y;
    var t;
    if (minX > maxX) { t = minX; minX = maxX; maxX = t; }
    if (minY > maxY) { t = minY; minY = maxY; maxY = t; }
    index.add(minX, minY, maxX, maxY);
  }

  function defaultIntersectionReporter(p, interior) {
    results.push({
      point: p, 
      segments: interior
    });
  }
}