var createRandom = require('ngraph.random');
var prng = createRandom(42);

var params = [
  {
    name: 'random',
    algorithm: 'brute',
    args: [
      {min: 100, max: 500},  // number of lines
      {min: 100, max: 200},  // visible area
    ]
  },
  {
    name: 'complete',
    algorithm: 'brute',
    args: [
      {min: 10, max: 40},  // number of nodes
      function p1(qs) {
        return Math.round((10 + prng.gaussian()) * qs.p0);
        // {min: 400, max: 600},  // visible area
      }
    ]
  },
  {
    name: 'cube',
    algorithm: 'brute',
    args: [
      {min: 100, max: 150},  // number of rects
      function p2() {
        return Math.round((10 + prng.gaussian()));
      }
    ]
  },
  {
    name: 'drunkgrid',
    algorithm: 'brute',
    args: [
      {min: 10, max: 150},  // Row x Col
      function p2(qs) {
        var v = Math.round(Math.random() * 10) + 1;
        if (v === 0) return 0;
        if (qs.p0 > 20 && v < 1) v = 3;
        return v;
      }
    ]
  },
  {
    name: 'sparse',
    algorithm: 'sweep', 
    args: [
      {min: 50, max: 300},  // Count  
    ]
  },
  {
    name: 'triangle',
    algorithm(qs) {
      // sparse is better with sweep
      return (qs.p1 > 7) ? 'brute' : 'sweep'
    },
    args: [
      {min: 10, max: 30},  // Count  
      {min: 1, max: 20},  // Count  
    ]
  },
  {
    name: 'splash',
    algorithm: 'sweep', 
    args: [
      {min: 10, max: 50},  // Number of lines  
      {min: 40, max: 70},  // squared variance  
    ]
  },
  {
    name: 'island',
    algorithm: 'sweep', 
    args: [
      {min: 3, max: 10},  // Number of control points on circle
      {min: 6, max: 11},  // Number of subdivisions
    ]

  }
]

export default function generateRandomExample() {
  var generatorIdx = Math.round(Math.random() * (params.length - 1));
  var generator = params[generatorIdx];

  var qs = {
    generator: generator.name
  }
  generator.args.forEach((range, idx) => {
    var keyName = `p${idx}`;
    if (typeof range === 'function') {
      qs[keyName] = range(qs);
    } else  {
      qs[keyName] = Math.round(Math.random() * (range.max - range.min) + range.min);
    }
  });
  var algorithm = 'sweep';
  if (typeof generator.algorithm === 'function') {
    algorithm = generator.algorithm(qs);
  } else if (typeof generator.algorithm === 'string') {
    algorithm = generator.algorithm;
  }
  qs.algorithm = algorithm;

  return qs;
}