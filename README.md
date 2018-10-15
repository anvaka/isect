# isect - intersection detection library [![Build Status](https://travis-ci.org/anvaka/isect.svg?branch=master)](https://travis-ci.org/anvaka/isect)

This library allows you to find all intersections in a given set of
segments. 

[![demo](https://i.imgur.com/XiQ45h7.gif)](https://anvaka.github.io/isect/)

[Try the demo online](https://anvaka.github.io/isect/)

# Algorithms

The library implements three algorithms

## Bentley-Ottmann sweep line algorithm

This algorithm has `O(n*log(n) + k*log(n))` performance, where `n` is number of
segments, and `k` is number of intersections.

This method is preferred when you have large number of lines, and not too many
intersections (`k = o(n^2/log(n))`, to be more specific). 

The algorithm follows "Computation Geometry, Algorithms and Applications" book
by Mark de Berg, Otfried Cheong, Marc van Kreveld, and Mark Overmars. It does support
degenerate cases, though read limitations to learn more.

[![demo](https://i.imgur.com/dQrGKTt.gif)](https://anvaka.github.io/isect/?isAsync=true&p0=12&p1=40&generator=complete&algorithm=sweep&stepsPerFrame=1)

## Brute force algorithm

This is "naive" implementation where each segment is compared with all other segments,
and thus has O(n*n) performance.

Despite its naiveté, it works much faster than Bentley-Ottmann algorithm for the cases
when there are a few thousand lines and millions of intersections. This scenario is
common in force-based graph drawing, where "hairball" is formed by a few thousand lines.

[![demo](https://i.imgur.com/SUKRHt4.gif)](https://anvaka.github.io/isect/?isAsync=true&p0=12&p1=40&generator=complete&algorithm=brute&stepsPerFrame=1)

## "Bush" algorithm

This algorithm was suggested by [@mourner](https://twitter.com/mourner/status/1049325199617921024) and
[@dy](https://github.com/anvaka/isect/issues/1). 
It uses [mourner/flatbush](https://github.com/mourner/flatbush) as a spatial
index of segments, and then iterates over every segment, checking overlapping bounding boxes.

Intuitively, worst case performance of this algorithm is comparable with brute force. When every segment
overlaps with every other segment we should expect `O(n^2)` operations. In practice, however, this 
algorithm beats both `Bentley-Ottman` and `Brute force` approaches.

Its beauty is in its simplicity. It adapts very well to both sparse and dense segments distribution.

You can also find performance test suite below, so you can decide for yourself. I would absolutely go with
this algorithm as my default choice.

## Performance 

The benchmark code is [available here](https://github.com/anvaka/isect/blob/master/perf/index.js). Higher ops per second is better!

### K12 graph

[![K12 graph](https://i.imgur.com/PTXwvd3m.png)](https://anvaka.github.io/isect/?isAsync=false&p0=12&p1=40&generator=complete&algorithm=brute&stepsPerFrame=1)

* Sweep: Circular lines 12x40 x 1,069 ops/sec ±1.98% (91 runs sampled)
* **Brute: Circular lines 12x40 x 7,463 ops/sec ±3.01% (76 runs sampled)**
* Bush: Circular lines 12x40 x 5,678 ops/sec ±2.20% (80 runs sampled)

The graph has only `66` unique segments, and `313` unique
intersections. Brute force algorithm is 7x faster than Sweep Line, closely followed by


### 100 random lines

[![100 random lines](https://i.imgur.com/ytOEsyNm.png)](https://anvaka.github.io/isect/?isAsync=false&p0=100&p1=40&generator=random&algorithm=brute&stepsPerFrame=1)

In this demo 100 lines are randomly sampled inside a box with a side of 42px.

* Sweep: 100 Random lines lines in 42px box x 277 ops/sec ±1.20% (87 runs sampled)
* **Brute: 100 Random lines lines in 42px box x 3,606 ops/sec ±3.61% (74 runs sampled)**
* Bush: 100 Random lines in 42px box x 3,314 ops/sec ±2.66% (83 runs sampled)

Again, the brute force algorithm wins. The distance between brute force and 
Bush shortens. Sweep line comes last.

### Sparse intersections

[![sparse](https://i.imgur.com/ZkzZS9sm.png)](https://anvaka.github.io/isect/?isAsync=false&p0=50&p1=40&generator=sparse&algorithm=sweep&stepsPerFrame=1)

* Sweep: 2,500 sparse lines x 156 ops/sec ±0.97% (80 runs sampled)
* Brute: 2,500 sparse lines x 13.62 ops/sec ±0.91% (38 runs sampled)
* **Bush: 2,500 sparse lines x 592 ops/sec ±1.05% (93 runs sampled)**

Now Bush algorithm wins by huge margin. Bentley-Ottman comes second, and brute
force comes the last.

### Parallel Slanted lines

[![slanted](https://i.imgur.com/vYAZzNvm.png)](https://anvaka.github.io/isect/?isAsync=false&p0=1000&p1=40&generator=parallelSlanted&algorithm=sweep&stepsPerFrame=1)

* **Sweep: 1000 slanted, not intersect x 622 ops/sec ±1.23% (91 runs sampled)**
* Brute: 1000 slanted, not intersect x 230 ops/sec ±2.37% (87 runs sampled)
* Bush: 1000 slanted, not intersect x 243 ops/sec ±1.07% (87 runs sampled)

In this example there too many lines, and none of them intersect. Furthermore, most of the
rectangular bounding boxes do intersect, which gives more work for the `bush` algorithm

# usage

Install the module from npm:

```
npm i isect
```

Or download from CDN:

``` html
<script src='https://cdn.rawgit.com/anvaka/isect/v2.0.0/build/isect.min.js'></script>
```

If you download from CDN the library will be available under `isect` global name.

## Basic usage

The code below detects all intersections between segments in the array:

``` js
var isect = require('isect');

// Prepare the library to detect all intersection
var detectIntersections = isect.bush([{
  from: {x:  0, y:  0},
  to:   {x: 10, y: 10}
}, {
  from: {x:  0, y: 10},
  to:   {x: 10, y:  0}
}]);

// Detect them all, operation is synchronous. 
var intersections = detectIntersections.run();
console.log(intersections);
// Prints:
// 
//    [ { point: { x: 5, y: 5 }, segments: [ [Object], [Object] ] } ]
// 
// array of segments contain both segments.
```

## Brute force and Sweep Line

You can also run the above example with a different algorithm. Simply
change `.bush()` to `.sweep()` (to run Bentley-Ottman) or to `.brute()` (to try
brute force):

``` js

var isect = require('isect');

// Prepare the library to detect all intersection
var bruteForce = isect.brute([{
  from: {x:  0, y:  0},
  to:   {x: 10, y: 10}
}, {
  from: {x:  0, y: 10},
  to:   {x: 10, y:  0}
}]);

var intersections = bruteForce.run();
console.log(intersections);

// do the same with sweep line:
var sweepLine = isect.sweep([{
  from: {x:  0, y:  0},
  to:   {x: 10, y: 10}
}, {
  from: {x:  0, y: 10},
  to:   {x: 10, y:  0}
}]);

var intersections = sweepLine.run();
console.log(intersections);
```

All algorithms have identical API. In every example below
you can replace `.bush()` with `.sweeep()` or `.brute()`  - just pay attention to notes that calls out
a discrepancies in the API.

## Early stopping

If you don't care about all intersections, but want to know if there is
at least one intersection, you can pass a `onFound()` callback and request
the library to stop as soon as it finds an intersection:

``` js
var intersections = isect.bush([/* array of segments */], {
  onFound(point, segments) {
    // `point` is {x, y} of the intersection,
    // `segments` are intersecting segments.

    // If you return true from this method, no further processing will be done:

    return true; // yes, stop right now!
  }
});
```

## Asynchronous workflow

If you want to give browser time to catch up with user input, it may be desirable to break the
algorithm into chunks (so that UI thread is not swamped). You can do this by calling `.step()`
method of the algorithm's instance:


``` js
var detector = isect.bush([/* array of segments */]);
// instead of detector.run(), we do:
var isDone = detector.step()
// isDone will be set to true, once the algorithm is completed.
```

This is precisely how I do step-by-step animation of the algorithm:

[![demo](https://i.imgur.com/dQrGKTt.gif)](https://anvaka.github.io/isect/?isAsync=true&p0=12&p1=40&generator=complete&algorithm=sweep&stepsPerFrame=1)

[Click here](https://anvaka.github.io/isect/?isAsync=true&p0=12&p1=40&generator=complete&algorithm=sweep&stepsPerFrame=1) to see it in action. 

## Limitations

The sweep line algorithm is susceptible to floating point rounding errors. It is
possible to construct an example, with nearly horizontal lines, that would
cause it to fail.

While sweep line implementation detects `point-segment` overlap, I didn't implement `point-point`
overlap. I.e. identical points in the input array that do not overlap any segment
are not reported.

# Miscellaneous 

* The source code for the demo is [available here](https://github.com/anvaka/isect/tree/master/demo/interactive).
* The sweep line algorithm requires a binary search tree. I'm using [w8r/splay-tree](https://github.com/w8r/splay-tree) for this purpose. Love the library a lot!
I have also tried AVL tree, but found their performance worse than splay tree.
* If you need a sweep line with higher precision, consider porting this library to
use [decimal.js](https://github.com/MikeMcl/decimal.js-light).
* I would absolutely love to have faster intersection algorithms implemented in JavaScript.
If you know any - please share. In particular this paper [An optimal algorithm for finding segments intersections](http://club.pdmi.ras.ru/moodle/file.php/15/Materials/p211-balaban.pdf) looks very promising!
Their runtime is `O(n * log(n) + k)` which should be faster than Bentley-Ottmann.

# License

MIT

# Thanks!

I hope you enjoy the library. Feel free to ping me (anvaka@gmail.com or https://twitter.com/anvaka) if
you have any feedback.
