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

The benchmark code is available here.

[![K12 graph](https://i.imgur.com/PTXwvd3.png)]()
```
Sweep: Circular lines 12x40 x 1,022 ops/sec ±1.94% (90 runs sampled)
Brute: Circular lines 12x40 x 7,252 ops/sec ±3.15% (78 runs sampled)
Sweep: 100 Random lines lines in 42px box x 267 ops/sec ±0.80% (89 runs sampled)
Brute: 100 Random lines lines in 42px box x 3,751 ops/sec ±2.42% (76 runs sampled)
Sweep: 2,500 sparse lines x 135 ops/sec ±0.55% (75 runs sampled)
Brute: 2,500 sparse lines x 13.57 ops/sec ±0.43% (38 runs sampled)
```


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
var iSector = isect([{
  from: {x:  0, y:  0},
  to:   {x: 10, y: 10}
}, {
  from: {x:  0, y: 10},
  to:   {x: 10, y:  0}
}]);

// Detect them all, operation is synchronous. 
var intersections = iSector.run();
console.log(intersections);
// Prints:
// 
//    [ { point: { x: 5, y: 5 }, segments: [ [Object], [Object] ] } ]
// 
// array of segments contain both segments.
```

## Early stopping

If you don't care about all intersections, but want to know if there is
at least one intersection, you can pass a `onFound()` callback and request
the library to stop as soon as it finds the intersection:

``` js
var iSector = isect([/* array of segments */], {
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