# isect - intersection detection library

This library allows you to find all intersections in a given set of
segments. 

[![demo](https://i.imgur.com/XiQ45h7.gif)](https://anvaka.github.io/isect/)

[Try the demo online](https://anvaka.github.io/isect/)

# Algorithms

The library implements two algorithms

## Bentley-Ottmann sweep line algorithm

This algorithm has `O(n*log(n) + k*log(n))` performance, where `n` is number of
segments, and `k` is number of intersections.

This method is preferred when you have large number of lines, and not too many
intersections (`k = o(n^2/log(n)`, to be more specific). 

The algorithm follows "Computation Geometry, Algorithms and Applications" book
by Mark de Berg, Otfried Cheong, Marc van Kreveld, and Mark Overmars. It does support
degenerate cases, though read limitations to learn more.

[![demo](https://i.imgur.com/dQrGKTt.gif)](https://anvaka.github.io/isect/?isAsync=true&p0=12&p1=40&generator=complete&algorithm=sweep&stepsPerFrame=1)

## Brute force algorithm

This is "naive" implementation where each segment is compared with all other segments,
and thus has O(n*n) performance.

Despite it's naiveté, it works much faster than Bentley-Ottmann algorithm for the cases
when there are a few thousand lines and millions of intersections. This scenario is
common in force-based graph drawing, where "hairball" is formed by a few thousand lines.

[![demo](https://i.imgur.com/SUKRHt4.gif)](https://anvaka.github.io/isect/?isAsync=true&p0=12&p1=40&generator=complete&algorithm=brute&stepsPerFrame=1)

## Performance measurements

The benchmark code is [available here](https://github.com/anvaka/isect/blob/master/perf/index.js). Higher ops per second value is better!

### K12 graph

[![K12 graph](https://i.imgur.com/PTXwvd3m.png)](https://anvaka.github.io/isect/?isAsync=false&p0=12&p1=40&generator=complete&algorithm=brute&stepsPerFrame=1)

* Sweep: x 1,022 ops/sec ±1.94% (90 runs sampled)
* Brute: x **7,252** ops/sec ±3.15% (78 runs sampled)

The graph has only `66` unique segments, and `313` unique
intersections. Brute force algorithm is 7x faster than Sweep Line

### 100 random lines

[![100 random lines](https://i.imgur.com/ytOEsyNm.png)](https://anvaka.github.io/isect/?isAsync=false&p0=100&p1=40&generator=random&algorithm=brute&stepsPerFrame=1)

In this demo 100 lines are randomly sampled inside a box with a side of 42px.

* Sweep: x 267 ops/sec ±0.80% (89 runs sampled)
* Brute: x **3,751** ops/sec ±2.42% (76 runs sampled)

Again, brute force algorithm wins by large margin. You might be wondering if there
even a point to have sweep line implementation? Yes! Let's measure how algorithms
perform on a dataset with many lines and very few intersections. 

### Sparse intersections

[![sparse](https://i.imgur.com/ZkzZS9sm.png)](https://anvaka.github.io/isect/?isAsync=false&p0=50&p1=40&generator=sparse&algorithm=sweep&stepsPerFrame=1)

* Sweep: x **135** ops/sec ±0.55% (75 runs sampled)
* Brute: x 13.5 ops/sec ±0.43% (38 runs sampled)

Now is the time for the sweep line to shine! We have only `~350` intersections and `2,500`
lines. And sweep line outperforms brute force by a factor of 10.

# usage

Install the module from npm:

```
npm i isect
```

Or download from CDN:

<script src='https://cdn.rawgit.com/anvaka/isect/v1.0.0/build/isect.min.js'></script>

If you download from CDN the library will be available under `isect` global name.

## Basic usage

The code below detects all intersections between segments in the array:

``` js
var isect = require('isect');

// Prepare the library to detect all intersection
var sweepLine = isect.sweep([{
  from: {x:  0, y:  0},
  to:   {x: 10, y: 10}
}, {
  from: {x:  0, y: 10},
  to:   {x: 10, y:  0}
}]);

// Detect them all, operation is synchronous. 
var intersections = sweepLine.run();
console.log(intersections);
// Prints:
// 
//    [ { point: { x: 5, y: 5 }, segments: [ [Object], [Object] ] } ]
// 
// array of segments contain both segments.
```

## Brute force

You can also run the above example with a brute force algorithm. Simply
change `.sweep()` to `.brute()` :

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
```

Both `.sweep()` and `.brute()` have identical API. In every example below
you can replace `.sweep()` with `.brute()` - just pay attention to notes that calls out
a discrepancies in the API.

## Early stopping

If you don't care about all intersections, but want to know if there is
at least one intersection, you can pass a `onFound()` callback and request
the library to stop as soon as it finds an intersection:

``` js
var sweepLine = isect.sweep([/* array of segments */], {
  onFound(point, interior, lower, upper) {
    // `point` is {x, y} of the intersection,
    // `interior`is array of segments that have this point inside
    // `lower` are segments that have point as a lower endpoint (segment.to)
    // `upper` are segments that have point as an upper endpoint (segment.from)

    // If you return true from this method, no further processing will be done:

    return true; // yes, stop right now!
  }
});
```

*Note:* `.brute()` also supports early stopping. Unlike `.sweep()` it doesn't de-dupe 
points. If more than two segments intersect in the same point, the `onFound()` is called
for each pair of intersecting segments. Another major difference between `.sweep()` and `.brute()`
is that `.brute()` never provides `lower` or `upper` arrays - you would have to do check yourself.

## Asynchronous workflow

If you want to give browser time to catch up with user input, it may be desirable to break the
algorithm into chunks (so that UI thread is not swamped). You can do this by calling `.step()`
method of the algorithm's instance:


``` js
var sweepLine = isect.sweep([/* array of segments */]);
// instead of sweepLine.run(), we do:
var isDone = sweepLine.step()
// isDone will be set to true, once the algorithm is completed.
```

This is precisely how I do step-by-step animation of the algorithm:

[![demo](https://i.imgur.com/dQrGKTt.gif)](https://anvaka.github.io/isect/?isAsync=true&p0=12&p1=40&generator=complete&algorithm=sweep&stepsPerFrame=1)

[Click here](https://anvaka.github.io/isect/?isAsync=true&p0=12&p1=40&generator=complete&algorithm=sweep&stepsPerFrame=1) to see it in action. 

## Limitations

The sweep line algorithm is susceptible to floating point rounding errors. It is
possible to construct an example, with nearly horizontal lines, that would
cause it to fail.

While library does detected `point-segment` overlap, it does not detected `point-point`
overlap. I.e. identical points in the input dataset, that do not overlap any segment
will not be reported.

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
