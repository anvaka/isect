/**
 *  TODO: This duplicates what I have in demo/interactive. I couldn't
 *  figure out the way to import common js module in latest version of
 *  vue webpack template. Lost somewhere in babel forest of plugins.
 *  Sorry about code dupe.
 */
var createRandom = require('ngraph.random');
var seed = +new Date();
var prng = createRandom(seed);

module.exports = {
  random: random,
  cube: cube,
  grid: grid,
  complete: complete,
  drunkGrid: drunkGrid,
  sparse: sparse
}

function sparse(size, seed) {
  if (seed !== undefined) {
    prng = createRandom(seed);
  }
  var lines = [];
  var rows = size, columns = size;
  for (var j = 0; j < rows; ++j) {
    for (var i = 0; i < columns; ++i) {
      var x = i * 10, y = j * 10;
      var a = prng.gaussian();

      lines.push({
        from: {x, y},
        to: {x: x + 10 * Math.cos(a), y: y + 10 * Math.sin(a)}
      });
    }
  }
  return lines;
}

function random(count = 4, range = 100, seed) {
  if (seed !== undefined) {
    prng = createRandom(seed);
  }
  var lines = [];
  for (var i = 0; i < count; ++i) {
    lines.push({
      from: {x: (prng.nextDouble() - 0.5) * range, y: (prng.nextDouble() - 0.5) * range},
      to: {x: (prng.nextDouble() - 0.5) * range, y: (prng.nextDouble() - 0.5) * range}
    });
  }
  return lines;
}

function cube(count = 4, dPi = 30) {
  var angle = 0;
  var r = 4;
  if (dPi === 0) dPi = 1;
  var dAngle = Math.PI/dPi;

  var lines = [];
  for (var i = 0; i < count; ++i) {
    angle += dAngle;
    var x = Math.cos(angle) * r;
    var y = Math.sin(angle) * r;
    r *= 1.04;

    lines.push({
      from: {x: x, y: y},
      to: {x: -y, y: x},
    },
    {
      from: {x: -y, y: x},
      to: {x: -x, y: -y}
    },
    {
      from: {x: -x, y: -y},
      to: {x: y, y: -x}
    },
    {
      from: {x: y, y: -x},
      to: {x: x, y: y}
    }
    );
  }
  return lines;
}

function grid(vertical = 10, horizontal = 10) {
  var lines = [];
  var dx = 0; var dy = -0.3;
  for (var i = 0; i < vertical; i += 1) {
    lines.push({
      from: {x: dx, y: i + dy},
      to: {x: dx + (horizontal - 1), y: i + dy}
    });
  }

  for (i = 0; i < horizontal; i += 1) {
    lines.push({
      from: {x: dx + i, y: dy},
      to: {x: dx + i, y: (vertical - 1) + dy}
    });
  }
  return lines;
}

function complete(count = 10, range = 100) {
  var angleStep = 2 * Math.PI / count;
  var lines = [];
  var seen = new Set();

  for (var i = 0; i < count; ++i) {
    var angle = angleStep * i;
    var x = Math.cos(angle) * range / 2;
    var y = Math.sin(angle) * range / 2;
    for (var j = 0; j < count; ++j) {
      if (j !== i) {
        var ex = Math.cos(angleStep * j) * range / 2;
        var ey = Math.sin(angleStep * j) * range / 2;
        var name = `${i},${j}`;
        var l = {
          name: name,
          from: {x: x, y: y},
          to: {x: ex, y: ey}
        };
        var sKey = getKey(i, j);
        if (!seen.has(sKey)) {
          lines.push(l);
          seen.add(sKey)
        }
      }
    }
  }

  return lines;

  function getKey(i, j) {
    return i < j ? i + ';' + j : j + ';' + i;
  }
}

function drunkGrid(size = 10, variance = 10, seed) {
  if (seed !== undefined) {
    prng = createRandom(seed);
  }
  var lines = [];
  var dx = 0; var dy = -0.3;
  for (var i = 0; i < size; i += 1) {
    lines.push({
      name: 'h' + i,
      from: {x: dx + prng.gaussian() * variance, y: i + dy + prng.gaussian() * variance},
      to: {x: dx + (size - 1) + prng.gaussian() * variance, y: i + dy + prng.gaussian() * variance}
    });
    lines.push({
      name: 'v' + i,
      from: {x: dx + i + prng.gaussian() * variance, y: dy + prng.gaussian() * variance},
      to: {x: dx + i + prng.gaussian() * variance, y: (size - 1) + dy + prng.gaussian() * variance}
    });
  }

  return lines;
}
