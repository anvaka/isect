var g = require('./generators');
var performance = require('perf_hooks').performance;
var isect = require('../');
var brute = isect.brute;
var sweep = isect.sweep;

var metrics = [];
var lines;
for (var i = 3; i < 6; ++i) {
  lines = g.complete(i, i * 10);

  var res = measure(bruteForcer, 10);
  res.lines = lines.length;

  metrics.push(res);
}

function sweeper() {
  return sweep(lines).run();
}

function bruteForcer() {
  return brute(lines).run();
}

console.log(toCsv(metrics));

function toCsv(arr) {
  var headers = Object.keys(arr[0]);
  console.log(headers.join(','));
  arr.forEach(row => {
    console.log(headers.map(h => row[h]).join(','))
  })
}

function measure(tester, testCount) {
  var results = [];
  var found = 0;
  for (var i = 0; i < testCount; ++i) {
    var start = performance.now();
    var res = tester();
    var elapsed = performance.now() - start;
    results.push(elapsed);

    if (i > 0) {
      if (found !== res.length) throw new Error('It does not agree!');
    } else found = res.length;
  }

  var stats = computeStats(results);
  stats.found = found;
  return stats;
}

function computeStats(arr) {
  arr.sort((a, b) => a - b);
  var min = arr[0];
  var max = arr[arr.length - 1];
  var total = 0;
  for (var i = 0; i < arr.length; ++i) {
    total += arr[i];
  }
  var avg = total/arr.length;
  var median = arr[Math.round(arr.length/2)];

  return {min, max, avg, median};
}