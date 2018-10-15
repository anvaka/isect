var alternativeImplementation = require('bentley-ottman-sweepline');

var g = require('./generators');
var isect = require('../');
var sweep = isect.sweep;
var brute = isect.brute;
var bush = isect.bush;

var lines = g.complete(12, 40);
var bruteLines = g.complete(12, 40);
var bushLines = g.complete(12, 40);

var seed = 1536687392180;

var randomLines = g.random(100, 42, seed);
var bruteRandomLines = g.random(100, 42, seed);
var bushRandomLines = g.random(100, 42, seed);

var sparseLines = g.sparse(50, seed);
var bruteSparseLines = g.sparse(50, seed);
var bushSparseLines = g.sparse(50, seed);

var slanted = g.parallelSlanted(1000);
var bruteSlanted = g.parallelSlanted(1000);
var bushSlanted = g.parallelSlanted(1000);

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
.add('Bush: Circular lines 12x40', function() {
  var res = bush(bruteLines).run();
  // Note: Similar to brute force, flatbush based implementation reports
  // only two segments per intersection
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
.add('Bush: 100 Random lines in 42px box', function() {
  var res = bush(bushRandomLines).run();
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
.add('Bush: 2,500 sparse lines', function() {
  var res = bush(bushSparseLines).run();
  if (res.length !== 358) throw new Error('Invalid number of intersections');
})
.add('Sweep: 1,000 slanted, not intersect', function() {
  var res = sweep(slanted).run();
  if (res.length !== 0) throw new Error('Invalid number of intersections');
})
.add('Brute: 1,000 slanted, not intersect', function() {
  var res = brute(bruteSlanted).run();
  if (res.length !== 0) throw new Error('Invalid number of intersections');
})
.add('Bush: 1,000 slanted, not intersect', function() {
  var res = brute(bushSlanted).run();
  if (res.length !== 0) throw new Error('Invalid number of intersections');
})
// .add('Alternative circular lines 12x40', function () {
//   var res = alternativeImplementation(aRandomLines);
//   if (res.length !== 1123) throw new Error('Invalid number of intersections');
// })
.on('cycle', function(event) {
  console.log(String(event.target));
})
.run();
