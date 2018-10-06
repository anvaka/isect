# isect - intersection detection library

This library allows you to find all intersections in a given set of
segments. 

TODO: Image

# Methods

The library implements two methods

## Bentley-Ottmann sweep line algorithm

This algorithm has `O(n*log(n) + k*log(n))` performance, where `n` is number of
segments, and `k` is number of intersections.

This method is preferred when you have large number of lines, and not too many
intersections (`k = o(n^2/log(n)`, to be more specific). 

The algorithm follows "Computation Geometry, Algorithms and Applications" book
by Mark de Berg, Otfried Cheong, Marc van Kreveld, and Mark Overmars. It does support
degenerate cases, though read limitations to learn more.

## Brute force algorithm

This is "naive" implementation where each segment is compared with all other segments,
and thus has O(n*n) performance.

Despite it's naiveté, it works much faster than Bentley-Ottmann algorithm for the cases
when there are a few thousand lines and millions of intersections. This scenario is
common in force-based graph drawing, where "hairball" formed by a few thousand lines.

## Performance measurements

The benchmark code is available here. Higher ops per second value is better!

### K12 graph

![K12 graph](https://i.imgur.com/PTXwvd3.png)]

* Sweep: x 1,022 ops/sec ±1.94% (90 runs sampled)
* Brute: x **7,252** ops/sec ±3.15% (78 runs sampled)

The graph has only `66` unique segments, and `313` unique
intersections. Brute force algorithm is 7x faster than Sweep Line

### 100 random lines

![100 random lines](https://i.imgur.com/ytOEsyN.png)

In this demo 100 lines are randomly sampled inside a box with a side of 42px.

* Sweep: x 267 ops/sec ±0.80% (89 runs sampled)
* Brute: x **3,751** ops/sec ±2.42% (76 runs sampled)

Again, brute force algorithm wins by large margin. You might be wondering if there
even a point to have sweep line implementation? Yes! Let's measure how algorithms
perform on a dataset with many lines and very few intersections. 

### Sparse intersections

![sparse](https://i.imgur.com/ZkzZS9s.png)

* Sweep: x **135** ops/sec ±0.55% (75 runs sampled)
* Brute: x 13.5 ops/sec ±0.43% (38 runs sampled)

Now is the time for the sweep line to shine! We have only `~350` intersections and `2,500`
lines. And sweep line outperforms brute force by a factor of 10.

# usage

## installation 
Install the module from npm:

```
npm i isect
```

## basic usage

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

You can also run an example above using a brute force algorithm, simply
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
the library to stop as soon as it finds the intersection:

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
for each pair, intersecting in the point. Another major difference between `.sweep()` and `.brute()`
is that `.brute()` never gives `lower` or `upper` arrays - you would have to do check yourself.

## Asynchronous workflow

TODO: explain


## Performance


## Limitations

The library is susceptible to floating point rounding errors. It is
possible to construct an example, with nearly horizontal lines, that would
cause library to fail. TODO: link to drunk grid with small variance and large
number of lines.

While library does detected `point-segment` overlap, it does not detected `point-point`
overlap. I.e. identical points in the input dataset, that do not overlap any segment
will not be reported.