var alternativeImplementation = require('bentley-ottman-sweepline');

var g = require('./generators');
var isect = require('../');
var sweep = isect.sweep;
var brute = isect.brute;

var lines = g.complete(12, 40);
var bruteLines = g.complete(12, 40);

var seed = 1536687392180;

var randomLines = g.random(100, 42, seed);
var bruteRandomLines = g.random(100, 42, seed);

var sparseLines = g.sparse(50, seed);
var bruteSparseLines = g.sparse(50, seed);

var aLines = lines.map(x => [[x.from.x, x.from.y], [x.to.x, x.to.y]]);
var aRandomLines = randomLines.map(x => [[x.from.x, x.from.y], [x.to.x, x.to.y]]);

  // var res = alternativeImplementation(aRandomLines);
  // console.log(res.length);
  // return;
var Benchmark = require('benchmark');
var suite = new Benchmark.Suite;

suite.add('Sweep: Circular lines 12x40', function() {
  var res = sweep(lines).run();
  if (res.length !== 313) throw new Error('Invalid number of intersections');
})
.add('Brute: Circular lines 12x40', function() {
  var res = brute(bruteLines).run();
  // Note: brute force reports only two segments per intersection,
  // while sweep line unites them all together.
  if (res.length !== 1071) throw new Error('Invalid number of intersections');
})
.add('Sweep: 100 Random lines lines in 42px box', function() {
  var res = sweep(randomLines).run();
  if (res.length !== 1123) throw new Error('Invalid number of intersections');
})
.add('Brute: 100 Random lines lines in 42px box', function() {
  var res = brute(bruteRandomLines).run();
  if (res.length !== 1123) throw new Error('Invalid number of intersections');
})
.add('Sweep: 2,500 sparse lines', function() {
  var res = sweep(sparseLines).run();
  if (res.length !== 358) throw new Error('Invalid number of intersections');
})
.add('Brute: 2,500 sparse lines', function() {
  var res = brute(bruteSparseLines).run();
  if (res.length !== 358) throw new Error('Invalid number of intersections');
})

// .add('Alternative circular lines 12x40', function () {
//   var res = alternativeImplementation(aRandomLines);
//   if (res.length !== 1123) throw new Error('Invalid number of intersections');
// })
.on('cycle', function(event) {
  console.log(String(event.target));
})
.run();
