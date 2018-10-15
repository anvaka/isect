import intersectSegments from './src/intersectSegments';

/**
 * This is a brute force solution with O(n^2) performance.
 * (`n` is number of segments).
 * 
 * Use this when number of lines is low, and number of intersections
 * is high.
 */
export default function brute(lines, options) {
  var results = [];
  var reportIntersection = (options && options.onFound) || 
                            defaultIntersectionReporter;
  var asyncState;

  return {
    /**
     * Execute brute force of the segment intersection search
     */
    run,
    /**
     * Access to results array. Works only when you use default onFound() handler
     */
    results,

    /**
     * Performs a single step in the brute force algorithm ()
     */
    step
  }

  function step() {
    if (!asyncState) {
      asyncState = {
        i: 0
      }
    }
    var test = lines[asyncState.i];
    for (var j = asyncState.i + 1; j < lines.length; ++j) {
      var other = lines[j];
      var pt = intersectSegments(test, other);
      if (pt) {
        if (reportIntersection(pt, [test, other])) {
          return;
        }
      }
    }
    asyncState.i += 1;
    return asyncState.i < lines.length;
  }

  function run() {
    for(var i = 0; i < lines.length; ++i) {
      var test = lines[i];
      for (var j = i + 1; j < lines.length; ++j) {
        var other = lines[j];
        var pt = intersectSegments(test, other);
        if (pt) {
          if (reportIntersection(pt, [test, other])) {
            return;
          }
        }
      }
    }
    return results;
  }

  function defaultIntersectionReporter(p, interior) {
    results.push({
      point: p, 
      segments: interior
    });
  }
}