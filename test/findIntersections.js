var test = require('tap').test;
var sweep = require('../').sweep;
var rnd = require('../perf/generators').drunkGrid;

test('it can find vertical/horizontal intersections', (t) => {
  var intersections = sweep([{
    from: {x: -1, y: 0},
    to: {x: 1, y: 0},
  }, {
    from: {x: 0, y: -1},
    to: {x: 0, y: 1},
  }]).run();

  t.equals(intersections.length, 1, 'one intersection found');
  t.equals(intersections[0].point.x, 0)
  t.equals(intersections[0].point.y, 0)
  t.end();
})

test('it reports intersections', t => {
  var reportedPoint = null;
  sweep([{
    from: {x: -1, y: 0},
    to: {x: 1, y: 0},
  }, {
    from: {x: 0, y: -1},
    to: {x: 0, y: 1},
  }], {
    onFound(point /*, interior, lower, upper */) {
      reportedPoint = point
    }
  }).run();

  t.equals(reportedPoint.x, 0, 'x is ok');
  t.equals(reportedPoint.y, 0, 'y is ok');
  t.end();
});

test('it can find adjacent points', (t) => {
  var intersections = sweep([{
    from: {x: -1, y: 0},
    to: {x: 1, y: 0},
  }, {
    from: {x: 1, y: 0},
    to: {x: 2, y: 2},
  }]).run();

  t.equals(intersections.length, 1, 'one intersection found');
  t.equals(intersections[0].point.x, 1)
  t.equals(intersections[0].point.y, 0)
  t.end();
});

test('it can find all segments', t => {
  var intersections = sweep([{
    from: {x: 0, y: 0},
    to: {x: 1, y: 1},
  }, {
    from: {x: 1, y: 0},
    to: {x: 0, y: 1},
  }, {
    from: {x: 0.5, y: 0},
    to: {x: 0.5, y: 1},
  }]).run();

  t.equals(intersections.length, 1, 'one intersection found');
  t.equals(intersections[0].point.x, 0.5)
  t.equals(intersections[0].point.y, 0.5)
  t.equals(intersections[0].segments.length, 3, 'all three segments found')
  t.end();
});

test('it can early stop', t => {
  var results = [];
  sweep([{
    from: {x: -1, y: 0},
    to: {x: 1, y: 0},
  }, {
    from: {x: 0.5, y: 1},
    to: {x: 0.5, y: -1},
  }, {
    from: {x: 0.75, y: 1},
    to: {x: 0.75, y: -1},
  }], {
    onFound(point) {
      results.push(point);
      // Stop now!
      return true;
    }
  }).run();

  t.equals(results.length, 1, 'only one intersection reported');
  t.end();
})

test('it can find intersections in cube', t => {
  var intersections = sweep([
    {from: {x: -1, y: -1}, to: {x: -1, y: 1}}, 
    {from: {x: -1, y: 1}, to: {x: 1, y: 1}},
    {from: {x: 1, y: 1}, to: {x: 1, y: -1}},
    {from: {x: 1, y: -1}, to: {x: -1, y: -1}}
  ]).run();
  t.equals(intersections.length, 4, 'four intersections found');
  t.end();
});

test('it does not ignore endpoint if it is internal', t => {
  var intersections = sweep([{
    from: {x: -1, y: 0},
    to: {x: 1, y: 0},
  }, {
    from: {x: 1, y: 1},
    to: {x: 1, y: -1},
  }]).run();
  t.equals(intersections.length, 1, 'intersections found');
  t.end();
});

test('it rounds very close horizontal lines', t => {
  // y coordinate here is almost the same. This is a tricky case for
  // floating point operations, so we round `y` coordinate to avoid
  // precision errors:
  var lines = [
      {from: {x: 0.43428174033761024, y: -0.3734140731394291}, to: {x: -0.36442824453115463, y: -0.3734140805900097 }},
      {from: {x: -0.1504860669374466, y: -0.07342482730746269}, to: {x: 0.28500136360526085, y: -0.3957986496388912 }}
    ];
  var intersection = sweep(lines).run();
  t.equals(intersection.length, 1, 'intersection found');
  t.end();
});

test('it finds intersection when one segment ends on another', t => {
  var lines = [
    {from: {x: 0.8020039759576321, y: 1.0324788875877857}, to: {x: 0.449962355196476, y: -0.28189642354846}},
    {from: {x: -1.300572719424963, y: 1.1440130062401295}, to: {x: -0.40869949758052826, y: -0.6947379671037197}},
    {from: {x: 1.425792083144188, y: 1.1113514006137848}, to: {x: -1.1965897008776665, y: -0.5762606598436832}},
    {from: {x: 0.6898417733609676, y: 1.4930395111441612}, to: {x: -0.5260335020720959, y: -0.49431975558400154}},
    {from: {x: 1.1742585226893425, y: 0.6070638746023178}, to: {x: 0.3658513203263283, y: -0.38512956351041794}}
  ]
  var intersection = sweep(lines).run();
  t.equals(intersection.length, 5, 'intersection found');
  t.end();
});

test('it finds collinear lines', (t) => {
  var intersections = sweep([{
    from: {x: 0, y: 0},
    to: {x: 1, y: 1},
  }, {
    from: {x: 0.5, y: 0.5},
    to: {x: 2, y: 2},
  }]).run();

  t.equals(intersections.length, 2, 'two intersections found');
  t.end();
});

test('it finds overlapping horizontal segments', (t) => {
  var intersections = sweep([{
    from: {x: 0, y: 0},
    to: {x: 10, y: 0},
  }, {
    from: {x: 1, y: 0},
    to: {x: 11, y: 0},
  }, {
    from: {x: 2, y: 0},
    to: {x: 12, y: 0},
  }]).run();

  t.equals(intersections.length, 4, 'four intersections found');
  t.end();
});

test('finds overlapping triangles', (t) => {
  var intersections = sweep([
    {from: {x: 0, y: 0}, to: {x: 10, y:   0 }, name: 'B0,0'},
    {from: {x: 1, y: 0}, to: {x: 11, y:   0 }, name: 'B1,0'},
    {from: {x: 2, y: 0}, to: {x:  7, y: -10 }, name: 'D2,0'}
  ]).run();

  t.equals(intersections.length, 3, 'three intersections found');
  t.end();
});

test('finds a point', (t) => {
  var intersections = sweep([
    {from: {x: 0, y: 0}, to: {x: 10, y: 10 }, name: 'segment'},
    {from: {x: 5, y: 5}, to: {x: 5, y: 5 }, name: 'point'}
  ]).run();
  t.equals(intersections.length, 1, 'it finds the point');
  t.end();
});

test('it finds intersections when degenerative point segments are present', t => {
  var intersections = sweep([
    { from: { x: 0, y: 2 }, to: { x: 0, y: 2 }, name: 'point'},
    { from: { x: -4, y: 0}, to: { x: 2, y: 0 }, name: 'above-point'},
    { from: { x: -1, y: 6}, to: { x: 2, y: 0 }, name: 'to-the-right'},
    { from: { x: 2, y: 2 }, to: { x: 4, y: -3}, name: 'just a neighbor'}
  ]).run();

  t.equals(intersections.length, 1, 'it finds the intersection');
  t.end();
});

// test('it reports precision error', t => {
//   // These lines intersect in a point, that with default settings
//   // should cause an error due to precision (tree branch is invalid)
//   var lines = [
//     {from: {x: -0.020551152527332306, y: -0.174203060567379}, to: {x: -0.11163091659545898, y: -0.4594690687954426}},
//     {from: {x: 0.35762762650847435, y: -0.13034053519368172}, to: {x: -0.4633716866374016, y: -0.22582315653562546}},
//     {from: {x: 0.3875303864479065, y: 0.11689961701631546}, to: {x: -0.25046102330088615, y: -0.33835824206471443}}
//   ];

//   t.throws(() => {
//     sweep(lines).run();
//   });

//   // Now let's add default event handler:
//   var err;
//   sweep(lines, {
//     onError(e) {
//       // Note, we are not throwing. This may result in incorrect
//       // answer.
//       err = e;
//     }
//   }).run();
//   t.ok(err, 'Error reported');

//   // A better approach is to scale the input:
//   var scale = 10;
//   var scaled = lines.map(l => ({
//     from: {x: l.from.x * scale, y: l.from.y * scale},
//     to: {x: l.to.x * scale, y: l.to.y * scale},
//   }))

//   var scaledAnswer = sweep(scaled).run();
//   t.equals(scaledAnswer.length, 3, 'three intersections found');
//   t.end();
// })

// test('find throw', t => {
//   var seed = 0; // 2599483
//   while (true) {
//     try {
//       var lines = rnd(3, 1, seed)
//       sweep(lines).run()
//       seed += 1;
//       if (seed % 50000 === 0) console.log(seed);
//     } catch(e) {
//       console.log(seed);
//       break;
//     }
//   }
//   t.end();
// });
