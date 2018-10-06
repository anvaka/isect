import createEventQueue from './createEventQueue';
import createSweepStatus from './sweepStatus';
import SweepEvent from './SweepEvent';

import {intersectSegments, EPS, angle, samePoint} from './geom';

/**
 * A point on a line
 * 
 * @typedef {Object} Point
 * @property {number} x coordinate
 * @property {number} y coordinate
 */


/**
 * @typedef {Object} Segment 
 * @property {Point} from start of the segment
 * @property {Point} to end of the segment
 */

/**
 * @typedef {function(point : Point, interior : Segment[], lower : Segment[], upper : Segment[])} ReportIntersectionCallback
 */

/**
 * @typedef {Object} ISectOptions 
 * @property {ReportIntersectionCallback} onFound 
 */

 /**
  * @typedef {Object} ISectResult
  */

// We use EMPTY array to avoid pressure on garbage collector. Need to be
// very cautious to not mutate this array.
var EMPTY = [];

/**
 * Finds all intersections among given segments.
 * 
 * The algorithm follows "Computation Geometry, Algorithms and Applications" book
 * by Mark de Berg, Otfried Cheong, Marc van Kreveld, and Mark Overmars.
 * 
 * Line is swept top-down
 * 
 * @param {Segment[]} segments
 * @param {ISectOptions=} options
 * @returns {ISectResult}
 */
export default function isect(segments, options) {
  var results = [];
  var reportIntersection = (options && options.onFound) || defaultIntersectionReporter;

  var onError = (options && options.onError) || defaultErrorReporter;

  var eventQueue = createEventQueue(byY);
  var sweepStatus = createSweepStatus(onError, EPS);
  var lower, interior, lastPoint;

  segments.forEach(addSegment);

  return {
    /**
     * Find all intersections synchronously.
     * 
     * @returns array of found intersections.
     */
    run,

    /**
     * Performs a single step in the sweep line algorithm
     * 
     * @returns true if there was something to process; False if no more work to do
     */
    step,

    // Methods below are low level API for fine-grained control.
    // Don't use it unless you understand this code thoroughly

    /**
     * Add segment into the 
     */
    addSegment,

    /**
     * Direct access to event queue. Queue contains segment endpoints and
     * pending detected intersections.
     */
    eventQueue, 

    /**
     * Direct access to sweep line status. "Status" holds information about
     * all intersected segments.
     */
    sweepStatus,

    /**
     * Access to results array. Works only when you use default onFound() handler
     */
    results
  }

  function run() {
    while (!eventQueue.isEmpty()) {
      var eventPoint = eventQueue.pop();
      if (handleEventPoint(eventPoint)) {
        // they decided to stop.
        return;
      };
    }

    return results;
  }

  function step() {
    if (!eventQueue.isEmpty()) {
      var eventPoint = eventQueue.pop();
      handleEventPoint(eventPoint);
      // Note: we don't check results of `handleEventPoint()`
      // assumption is that client controls `step()` and thus they 
      // know better if they want to stop.
      return true;
    }
    return false;
  }

  function handleEventPoint(p) {
    lastPoint = p.point;
    var upper = p.from || EMPTY;

    lower = interior = undefined;
    // TODO: move lower/interior into sweep status method?

    sweepStatus.findSegmentsWithPoint(lastPoint, addLowerOrInterior);
    // if (segmentsWithPoint) {
    //   segmentsWithPoint.forEach()
    // } 

    if (!lower) lower = EMPTY;
    if (!interior) interior = EMPTY;

    var uLength = upper.length;
    var iLength = interior.length;
    var lLength = lower.length;
    var hasIntersection = uLength + iLength + lLength > 1;
    var hasPointIntersection = !hasIntersection && (uLength === 0 && lLength === 0 && iLength > 0);

    if (hasIntersection || hasPointIntersection) {
      p.isReported = true;
      if (reportIntersection(lastPoint, interior, lower, upper)) {
        return true;
      }
    }

    sweepStatus.deleteSegments(lower, interior, lastPoint);
    sweepStatus.insertSegments(interior, upper, lastPoint);

    var sLeft, sRight;

    var hasNoCrossing = (uLength + iLength === 0);

    if (hasNoCrossing) {
      var leftRight = sweepStatus.getLeftRightPoint(lastPoint);
      sLeft = leftRight.left;
      if (!sLeft) return;

      sRight = leftRight.right;
      if (!sRight) return;

      findNewEvent(sLeft, sRight, p);
    } else {
      var boundarySegments = sweepStatus.getBoundarySegments(upper, interior);

      findNewEvent(boundarySegments.beforeLeft, boundarySegments.left, p);
      findNewEvent(boundarySegments.right, boundarySegments.afterRight, p);
    }

    return false;
  }

  function addLowerOrInterior(s) {
    if (samePoint(s.to, lastPoint)) {
      if (!lower) lower = [s];
      else lower.push(s);
    } else if (!samePoint(s.from, lastPoint)) {
      if (!interior) interior = [s];
      else interior.push(s);
    }
  }

  function findNewEvent(left, right, p) {
    if (!left || !right) return;

    var intersection = intersectSegments(left, right);
    if (!intersection) {
        return;
    }

    var dy = p.point.y - intersection.y
    // TODO: should I add dy to intersection.y?
    if (dy < -EPS) {
      // this means intersection happened after the sweep line. 
      // We already processed it.
      return;
    }
    if (Math.abs(dy) < EPS && intersection.x <= p.point.x) {
      return;
    }

    // Need to adjust floating point for this special case,
    // since otherwise it gives rounding errors:
    roundNearZero(intersection);

    var current = eventQueue.find(intersection);

    if (current && current.isReported) {
      // We already reported this event. No need to add it one more time
      // TODO: Is this case even possible?
      onError('We already reported this event.');
      return;
    }

    if (!current) {
      var event = new SweepEvent(intersection)
      eventQueue.insert(event);
    }
  }

  function defaultIntersectionReporter(p, interior, lower, upper) {
    results.push({
      point: p, 
      segments: union(union(interior, lower), upper)
    });
  }

  function addSegment(segment) {
    var from = segment.from;
    var to = segment.to;

    // Small numbers give more precision errors. Rounding them to 0.
    roundNearZero(from);
    roundNearZero(to);

    var dy = from.y - to.y;

    // Note: dy is much smaller then EPS on purpose. I found that higher
    // precision here does less good - getting way more rounding errors.
    if (Math.abs(dy) < 1e-5) {
      from.y = to.y;
      segment.dy = 0;
    }
    if ((from.y < to.y) || (
        (from.y === to.y) && (from.x > to.x))
      ) {
      var temp = from;
      from = segment.from = to; 
      to = segment.to = temp;
    }

    // We pre-compute some immutable properties of the segment
    // They are used quite often in the tree traversal, and pre-computation
    // gives significant boost:
    segment.dy = from.y - to.y;
    segment.dx = from.x - to.x;
    segment.angle = angle(segment.dy, segment.dx);

    var isPoint = segment.dy === segment.dx && segment.dy === 0;
    var prev = eventQueue.find(from)
    if (prev && !isPoint) {
      // this detects identical segments early. Without this check
      // the algorithm would break since sweep line has no means to
      // detect identical segments.
      var prevFrom = prev.data.from;
      if (prevFrom) {
        for (var i = 0; i < prevFrom.length; ++i) {
          var s = prevFrom[i];
          if (samePoint(s.to, to)) {
            reportIntersection(s.from, [], s.from, s.to);
            reportIntersection(s.to, [], s.from, s.to);
            return;
          }
        }
      }
    }

    if (!isPoint) {
      if (prev) {
        if (prev.data.from) prev.data.from.push(segment);
        else prev.data.from = [segment];
      } else {
        var e = new SweepEvent(from, segment)
        eventQueue.insert(e);
      }
      var event = new SweepEvent(to)
      eventQueue.insert(event)
    } else {
      var event = new SweepEvent(to)
      eventQueue.insert(event)
    }
  } 
}

function roundNearZero(point) {
  if (Math.abs(point.x) < EPS) point.x = 0;
  if (Math.abs(point.y) < EPS) point.y = 0;
}

function defaultErrorReporter(errorMessage) {
  throw new Error(errorMessage);
}

function union(a, b) {
  if (!a) return b;
  if (!b) return a;

  return a.concat(b);
}

function byY(a, b) {
  // decreasing Y 
  var res = b.y - a.y;
  // TODO: This might mess up the status tree.
  if (Math.abs(res) < EPS) {
    // increasing x.
    res = a.x - b.x;
    if (Math.abs(res) < EPS) res = 0;
  }

  return res;
}