var createRandom = require('ngraph.random');
var seed = +new Date();
var prng = createRandom(seed);

export function splash(linesCount, minMax) {
  var lines = [];
  for (var j = 0; j < linesCount; ++j) {
    var r = prng.gaussian() * minMax;
    var alpha = prng.gaussian() * Math.PI * 2;
    var points = getArr({
      x: prng.gaussian(),
      y: prng.gaussian() 
    }, {
      x: r * Math.cos(alpha), 
      y: r * Math.sin(alpha)
    }, 7);

    for (var i = 1; i < points.length; ++i) {
      lines.push({
        from: points[i - 1],
        to: points[i]
      })
    }
  }
  return lines;
}

export function island(pointsCount, bands) {
  var r = 100 * Math.sqrt(bands);
  var da = 2 * Math.PI/pointsCount;
  var angle = prng.gaussian();
  var lines = [];
  var end = {
    x: r * Math.cos(angle),
    y: r * Math.sin(angle)
  };
  var from = end;

  for (var j = 0; j < pointsCount; ++j) {
    r = prng.nextDouble() * 100;
    angle += da;
    var to = j < pointsCount - 1 ? {
      x: r * Math.cos(angle),
      y: r * Math.sin(angle)
    } : end; // close the loop.
    var points = getArr(from, to, bands);
    for (var i = 1; i < points.length; ++i) {
      lines.push({
        from: points[i - 1],
        to:   points[i]
      })
    }
    from = to;
  }

  return lines;
}

function getArr(tMin, tMax, bands = 8) {
  var arr = [tMin, tMax];
  var dx = tMax.x - tMin.x;
  var dy = tMax.y - tMin.y;
  var l = Math.sqrt(dx * dx + dy * dy);
  var variance = l;

  for (var j = 0; j < bands; ++j) {
    var newArr = [];
    // fill in intermediate entries
    for (var i = 1; i < arr.length; i += 1) {
      var prev = arr[i - 1];

      var mid = interpolate(prev, arr[i], Math.sqrt(variance));
      newArr.push(prev, mid);
    }
    newArr.push(arr[arr.length - 1]);
    variance /= 2;
    arr = newArr;
  }
  return arr;
}

function interpolate(p0, p1, variance) {
  return {
    x: (p0.x + p1.x) * 0.5 + prng.gaussian() * variance,
    y: (p0.y + p1.y) * 0.5 + prng.gaussian() * variance,
  }
}