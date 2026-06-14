/* follows "An implementation of top-down splaying"
 * by D. Sleator <sleator@cs.cmu.edu> March 1992
 */

/**
 * @typedef {*} Key
 */


/**
 * @typedef {*} Value
 */


/**
 * @typedef {function(node:Node):void} Visitor
 */


/**
 * @typedef {function(a:Key, b:Key):number} Comparator
 */


/**
 * @param {function(node:Node):string} NodePrinter
 */


/**
 * @typedef {Object}  Node
 * @property {Key}    Key
 * @property {Value=} data
 * @property {Node}   left
 * @property {Node}   right
 */

class Node {

  constructor (key, data) {
    this.key    = key;
    this.data   = data;
    this.left   = null;
    this.right  = null;
  }
}

function DEFAULT_COMPARE (a, b) { return a > b ? 1 : a < b ? -1 : 0; }


/**
 * Simple top down splay, not requiring i to be in the tree t.
 * @param {Key} i
 * @param {Node?} t
 * @param {Comparator} comparator
 */
function splay (i, t, comparator) {
  if (t === null) return t;
  let l, r, y;
  const N = new Node();
  l = r = N;

  while (true) {
    const cmp = comparator(i, t.key);
    //if (i < t.key) {
    if (cmp < 0) {
      if (t.left === null) break;
      //if (i < t.left.key) {
      if (comparator(i, t.left.key) < 0) {
        y = t.left;                           /* rotate right */
        t.left = y.right;
        y.right = t;
        t = y;
        if (t.left === null) break;
      }
      r.left = t;                               /* link right */
      r = t;
      t = t.left;
    //} else if (i > t.key) {
    } else if (cmp > 0) {
      if (t.right === null) break;
      //if (i > t.right.key) {
      if (comparator(i, t.right.key) > 0) {
        y = t.right;                          /* rotate left */
        t.right = y.left;
        y.left = t;
        t = y;
        if (t.right === null) break;
      }
      l.right = t;                              /* link left */
      l = t;
      t = t.right;
    } else {
      break;
    }
  }
  /* assemble */
  l.right = t.left;
  r.left = t.right;
  t.left = N.right;
  t.right = N.left;
  return t;
}


/**
 * @param  {Key}        i
 * @param  {Value}      data
 * @param  {Comparator} comparator
 * @param  {Tree}       tree
 * @return {Node}      root
 */
function insert (i, data, t, comparator, tree) {
  const node = new Node(i, data);

  tree._size++;

  if (t === null) {
    node.left = node.right = null;
    return node;
  }

  t = splay(i, t, comparator);
  const cmp = comparator(i, t.key);
  if (cmp < 0) {
    node.left = t.left;
    node.right = t;
    t.left = null;
  } else if (cmp >= 0) {
    node.right = t.right;
    node.left = t;
    t.right = null;
  }
  return node;
}


/**
 * Insert i into the tree t, unless it's already there.
 * @param  {Key}        i
 * @param  {Value}      data
 * @param  {Comparator} comparator
 * @param  {Tree}       tree
 * @return {Node}       root
 */
function add (i, data, t, comparator, tree) {
  const node = new Node(i, data);

  if (t === null) {
    node.left = node.right = null;
    tree._size++;
    return node;
  }

  t = splay(i, t, comparator);
  const cmp = comparator(i, t.key);
  if (cmp === 0) return t;
  else {
    if (cmp < 0) {
      node.left = t.left;
      node.right = t;
      t.left = null;
    } else if (cmp > 0) {
      node.right = t.right;
      node.left = t;
      t.right = null;
    }
    tree._size++;
    return node;
  }
}


/**
 * Deletes i from the tree if it's there
 * @param {Key}        i
 * @param {Tree}       tree
 * @param {Comparator} comparator
 * @param {Tree}       tree
 * @return {Node}      new root
 */
function remove (i, t, comparator, tree) {
  let x;
  if (t === null) return null;
  t = splay(i, t, comparator);
  var cmp = comparator(i, t.key);
  if (cmp === 0) {               /* found it */
    if (t.left === null) {
      x = t.right;
    } else {
      x = splay(i, t.left, comparator);
      x.right = t.right;
    }
    tree._size--;
    return x;
  }
  return t;                         /* It wasn't there */
}


function split (key, v, comparator) {
  let left, right;
  if (v === null) {
    left = right = null;
  } else {
    v = splay(key, v, comparator);

    const cmp = comparator(v.key, key);
    if (cmp === 0) {
      left  = v.left;
      right = v.right;
    } else if (cmp < 0) {
      right   = v.right;
      v.right = null;
      left    = v;
    } else {
      left   = v.left;
      v.left = null;
      right  = v;
    }
  }
  return { left, right };
}


function merge (left, right, comparator) {
  if (right === null) return left;
  if (left  === null) return right;

  right = splay(left.key, right, comparator);
  right.left = left;
  return right;
}


/**
 * Prints level of the tree
 * @param  {Node}                        root
 * @param  {String}                      prefix
 * @param  {Boolean}                     isTail
 * @param  {Array<string>}               out
 * @param  {Function(node:Node):String}  printNode
 */
function printRow (root, prefix, isTail, out, printNode) {
  if (root) {
    out(`${ prefix }${ isTail ? '└── ' : '├── ' }${ printNode(root) }\n`);
    const indent = prefix + (isTail ? '    ' : '│   ');
    if (root.left)  printRow(root.left,  indent, false, out, printNode);
    if (root.right) printRow(root.right, indent, true,  out, printNode);
  }
}


class Tree {

  constructor (comparator = DEFAULT_COMPARE) {
    this._comparator = comparator;
    this._root = null;
    this._size = 0;
  }


  /**
   * Inserts a key, allows duplicates
   * @param  {Key}    key
   * @param  {Value=} data
   * @return {Node|null}
   */
  insert (key, data) {
    return this._root = insert(key, data, this._root, this._comparator, this);
  }


  /**
   * Adds a key, if it is not present in the tree
   * @param  {Key}    key
   * @param  {Value=} data
   * @return {Node|null}
   */
  add (key, data) {
    return this._root = add(key, data, this._root, this._comparator, this);
  }


  /**
   * @param  {Key} key
   * @return {Node|null}
   */
  remove (key) {
    this._root = remove(key, this._root, this._comparator, this);
  }


  /**
   * Removes and returns the node with smallest key
   * @return {?Node}
   */
  pop () {
    let node = this._root;
    if (node) {
      while (node.left) node = node.left;
      this._root = splay(node.key,  this._root, this._comparator);
      this._root = remove(node.key, this._root, this._comparator, this);
      return { key: node.key, data: node.data };
    }
    return null;
  }


  /**
   * @param  {Key} key
   * @return {Node|null}
   */
  findStatic (key) {
    let current   = this._root;
    const compare = this._comparator;
    while (current) {
      const cmp = compare(key, current.key);
      if (cmp === 0)    return current;
      else if (cmp < 0) current = current.left;
      else              current = current.right;
    }
    return null;
  }


  /**
   * @param  {Key} key
   * @return {Node|null}
   */
  find (key) {
    if (this._root) {
      this._root = splay(key, this._root, this._comparator);
      if (this._comparator(key, this._root.key) !== 0) return null;
    }
    return this._root;
  }


  /**
   * @param  {Key} key
   * @return {Boolean}
   */
  contains (key) {
    let current   = this._root;
    const compare = this._comparator;
    while (current) {
      const cmp = compare(key, current.key);
      if (cmp === 0)    return true;
      else if (cmp < 0) current = current.left;
      else              current = current.right;
    }
    return false;
  }


  /**
   * @param  {Visitor} visitor
   * @param  {*=}      ctx
   * @return {SplayTree}
   */
  forEach (visitor, ctx) {
    let current = this._root;
    const Q = [];  /* Initialize stack s */
    let done = false;

    while (!done) {
      if (current !==  null) {
        Q.push(current);
        current = current.left;
      } else {
        if (Q.length !== 0) {
          current = Q.pop();
          visitor.call(ctx, current);

          current = current.right;
        } else done = true;
      }
    }
    return this;
  }


  /**
   * Walk key range from `low` to `high`. Stops if `fn` returns a value.
   * @param  {Key}      low
   * @param  {Key}      high
   * @param  {Function} fn
   * @param  {*?}       ctx
   * @return {SplayTree}
   */
  range (low, high, fn, ctx) {
    const Q = [];
    const compare = this._comparator;
    let node = this._root, cmp;

    while (Q.length !== 0 || node) {
      if (node) {
        Q.push(node);
        node = node.left;
      } else {
        node = Q.pop();
        cmp = compare(node.key, high);
        if (cmp > 0) {
          break;
        } else if (compare(node.key, low) >= 0) {
          if (fn.call(ctx, node)) return this; // stop if smth is returned
        }
        node = node.right;
      }
    }
    return this;
  }


  /**
   * Returns array of keys
   * @return {Array<Key>}
   */
  keys () {
    const keys = [];
    this.forEach(({ key }) => keys.push(key));
    return keys;
  }


  /**
   * Returns array of all the data in the nodes
   * @return {Array<Value>}
   */
  values () {
    const values = [];
    this.forEach(({ data }) => values.push(data));
    return values;
  }


  /**
   * @return {Key|null}
   */
  min() {
    if (this._root) return this.minNode(this._root).key;
    return null;
  }


  /**
   * @return {Key|null}
   */
  max() {
    if (this._root) return this.maxNode(this._root).key;
    return null;
  }


  /**
   * @return {Node|null}
   */
  minNode(t = this._root) {
    if (t) while (t.left) t = t.left;
    return t;
  }


  /**
   * @return {Node|null}
   */
  maxNode(t = this._root) {
    if (t) while (t.right) t = t.right;
    return t;
  }


  /**
   * Returns node at given index
   * @param  {number} index
   * @return {?Node}
   */
  at (index) {
    let current = this._root, done = false, i = 0;
    const Q = [];

    while (!done) {
      if (current) {
        Q.push(current);
        current = current.left;
      } else {
        if (Q.length > 0) {
          current = Q.pop();
          if (i === index) return current;
          i++;
          current = current.right;
        } else done = true;
      }
    }
    return null;
  }


  /**
   * @param  {Node}   d
   * @return {Node|null}
   */
  next (d) {
    let root = this._root;
    let successor = null;

    if (d.right) {
      successor = d.right;
      while (successor.left) successor = successor.left;
      return successor;
    }

    const comparator = this._comparator;
    while (root) {
      const cmp = comparator(d.key, root.key);
      if (cmp === 0) break;
      else if (cmp < 0) {
        successor = root;
        root = root.left;
      } else root = root.right;
    }

    return successor;
  }


  /**
   * @param  {Node} d
   * @return {Node|null}
   */
  prev (d) {
    let root = this._root;
    let predecessor = null;

    if (d.left !== null) {
      predecessor = d.left;
      while (predecessor.right) predecessor = predecessor.right;
      return predecessor;
    }

    const comparator = this._comparator;
    while (root) {
      const cmp = comparator(d.key, root.key);
      if (cmp === 0) break;
      else if (cmp < 0) root = root.left;
      else {
        predecessor = root;
        root = root.right;
      }
    }
    return predecessor;
  }


  /**
   * @return {SplayTree}
   */
  clear() {
    this._root = null;
    this._size = 0;
    return this;
  }


  /**
   * @return {NodeList}
   */
  toList() {
    return toList(this._root);
  }


  /**
   * Bulk-load items. Both array have to be same size
   * @param  {Array<Key>}    keys
   * @param  {Array<Value>}  [values]
   * @param  {Boolean}       [presort=false] Pre-sort keys and values, using
   *                                         tree's comparator. Sorting is done
   *                                         in-place
   * @return {AVLTree}
   */
  load (keys = [], values = [], presort = false) {
    let size = keys.length;
    const comparator = this._comparator;

    // sort if needed
    if (presort) sort$1(keys, values, 0, size - 1, comparator);

    if (this._root === null) { // empty tree
      this._root = loadRecursive(this._root, keys, values, 0, size);
      this._size = size;
    } else { // that re-builds the whole tree from two in-order traversals
      const mergedList = mergeLists(this.toList(), createList(keys, values), comparator);
      size = this._size + size;
      this._root = sortedListToBST({ head: mergedList }, 0, size);
    }
    return this;
  }


  /**
   * @return {Boolean}
   */
  isEmpty() { return this._root === null; }

  get size () { return this._size; }


  /**
   * @param  {NodePrinter=} printNode
   * @return {String}
   */
  toString (printNode = (n) => n.key) {
    const out = [];
    printRow(this._root, '', true, (v) => out.push(v), printNode);
    return out.join('');
  }


  update (key, newKey, newData) {
    const comparator = this._comparator;
    let { left, right } = split(key, this._root, comparator);
    this._size--;
    if (comparator(key, newKey) < 0) {
      right = insert(newKey, newData, right, comparator, this);
    } else {
      left = insert(newKey, newData, left, comparator, this);
    }
    this._root = merge(left, right, comparator);
  }


  split(key) {
    return split(key, this._root, this._comparator);
  }
}


function loadRecursive (parent, keys, values, start, end) {
  const size = end - start;
  if (size > 0) {
    const middle = start + Math.floor(size / 2);
    const key    = keys[middle];
    const data   = values[middle];
    const node   = { key, data, parent };
    node.left    = loadRecursive(node, keys, values, start, middle);
    node.right   = loadRecursive(node, keys, values, middle + 1, end);
    return node;
  }
  return null;
}


function createList(keys, values) {
  const head = { next: null };
  let p = head;
  for (let i = 0; i < keys.length; i++) {
    p = p.next = { key: keys[i], data: values[i] };
  }
  p.next = null;
  return head.next;
}


function toList (root) {
  var current = root;
  var Q = [], done = false;

  const head = { next: null };
  let p = head;

  while (!done) {
    if (current) {
      Q.push(current);
      current = current.left;
    } else {
      if (Q.length > 0) {
        current = p = p.next = Q.pop();
        current = current.right;
      } else done = true;
    }
  }
  p.next = null; // that'll work even if the tree was empty
  return head.next;
}


function sortedListToBST(list, start, end) {
  const size = end - start;
  if (size > 0) {
    const middle = start + Math.floor(size / 2);
    const left = sortedListToBST(list, start, middle);

    const root = list.head;
    root.left = left;

    list.head = list.head.next;

    root.right = sortedListToBST(list, middle + 1, end);
    return root;
  }
  return null;
}


function mergeLists (l1, l2, compare = (a, b) => a - b) {
  const head = {}; // dummy
  let p = head;

  let p1 = l1;
  let p2 = l2;

  while (p1 !== null && p2 !== null) {
    if (compare(p1.key, p2.key) < 0) {
      p.next = p1;
      p1 = p1.next;
    } else {
      p.next = p2;
      p2 = p2.next;
    }
    p = p.next;
  }

  if (p1 !== null)      p.next = p1;
  else if (p2 !== null) p.next = p2;

  return head.next;
}


function sort$1(keys, values, left, right, compare) {
  if (left >= right) return;

  const pivot = keys[(left + right) >> 1];
  let i = left - 1;
  let j = right + 1;

  while (true) {
    do i++; while (compare(keys[i], pivot) < 0);
    do j--; while (compare(keys[j], pivot) > 0);
    if (i >= j) break;

    let tmp = keys[i];
    keys[i] = keys[j];
    keys[j] = tmp;

    tmp = values[i];
    values[i] = values[j];
    values[j] = tmp;
  }

  sort$1(keys, values,  left,     j, compare);
  sort$1(keys, values, j + 1, right, compare);
}

function createEventQueue(byY) {
  const q = new Tree(byY);

  return {
    isEmpty: isEmpty,
    size: size,
    pop: pop,
    find: find,
    insert: insert
  }

  function find(p) {
    return q.find(p);
  }

  function size() {
    return q.size;
  }

  function isEmpty() {
    return q.isEmpty();
  }

  function insert(event) {
    // debugger;
    q.add(event.point, event);
  }

  function pop() {
    var node = q.pop();
    return node && node.data;
  }
}

/**
 * Just a collection of geometry related utilities
 */

// This is used for precision checking (e.g. two numbers are equal
// if their difference is smaller than this number). The value is 
// chosen empirically. We still may run into precision related issues.
// TODO: we should allow consumers to configure this.
const EPS = 1e-9;//10;

function getIntersectionXPoint(segment, xPos, yPos) {
  var dy1 = segment.from.y - yPos;
  var dy2 = yPos - segment.to.y;
  var dy = segment.to.y - segment.from.y;
  if (Math.abs(dy1) < EPS) {
    // The segment starts on the sweep line
    if (Math.abs(dy) < EPS) {
      // the segment is horizontal. Intersection is at the point
      if (xPos <= segment.from.x) return segment.from.x;
      if (xPos > segment.to.x) return segment.to.x;
      return xPos;
    }
    return segment.from.x;
  }
  
  var dx = (segment.to.x - segment.from.x); 
  var xOffset; 
  if (dy1 >= dy2) {
    xOffset = dy1 * (dx / dy); 
    return (segment.from.x - xOffset);
  } 
  xOffset = dy2 * (dx / dy);
  return (segment.to.x + xOffset);
}

function angle(dx, dy) {
  // https://stackoverflow.com/questions/16542042/fastest-way-to-sort-vectors-by-angle-without-actually-computing-that-angle
  var p = dx/(Math.abs(dx) + Math.abs(dy)); // -1 .. 1 increasing with x

  if (dy < 0) return p - 1;  // -2 .. 0 increasing with x
  return 1 - p               //  0 .. 2 decreasing with x
}

function intersectSegments$1(a, b) {
  //  https://stackoverflow.com/a/1968345/125351
  var aStart = a.from, bStart = b.from;
  var p0_x = aStart.x, p0_y = aStart.y,
      p2_x = bStart.x, p2_y = bStart.y;

  var s1_x = a.dx, s1_y = a.dy, s2_x = b.dx, s2_y = b.dy;
  var div = s1_x * s2_y - s2_x * s1_y;

  var s = (s1_y * (p0_x - p2_x) - s1_x * (p0_y - p2_y)) / div;
  if (s < 0 || s > 1) return;

  var t = (s2_x * (p2_y - p0_y) + s2_y * (p0_x - p2_x)) / div;

  if (t >= 0 && t <= 1) {
    return {
      x: p0_x - (t * s1_x),
      y: p0_y - (t * s1_y)
    }
  }
}

function samePoint(a, b) {
  return Math.abs(a.x - b.x) < EPS && Math.abs(a.y - b.y) < EPS;
}

/**
 * Creates a new sweep status data structure.
 */
function createSweepStatus(onError, EPS) {
  var lastPointY, prevY;
  var lastPointX, prevX;
  var useBelow = false;
  var status = new Tree(compareSegments);

  // To save on GC we return mutable object.
  var currentBoundary = {
    beforeLeft: null,
    left: null,
    right: null,
    afterRight: null,
  };

  var currentLeftRight = {left: null, right: null};

  return {
    /**
     * Add new segments into the status tree.
     */
    insertSegments,

    /**
     * Remove segments from the status tree.
     */
    deleteSegments,

    /**
     * Returns segments that are to the left and right from a given point.
     */
    getLeftRightPoint,

    /**
     * For a given collections of segments finds the most left and the most right
     * segments. Also returns segments immediately before left, and after right segments.
     */
    getBoundarySegments,

    findSegmentsWithPoint,

    /**
     * Current binary search tree with segments
     */
    status,

    /**
     * Introspection method that verifies if there are duplicates in the segment tree.
     * If there are - `onError()` is called.
     */
    checkDuplicate,

    /**
     * Prints current segments in order of their intersection with sweep line. Introspection method.
     */
    printStatus,

    /**
     * Returns current position of the sweep line.
     */
    getLastPoint() {
      return {x: lastPointX, y: lastPointY};
    }
  }

  function compareSegments(a, b) {
    if (a === b) return 0;

    var ak = getIntersectionXPoint(a, lastPointX, lastPointY);
    var bk = getIntersectionXPoint(b, lastPointX, lastPointY);

    var res = ak - bk;
    if (Math.abs(res) >= EPS) {
      // We are okay fine. Intersection distance between two segments
      // is good to give conclusive answer
      return res;
    }

    var aIsHorizontal = Math.abs(a.dy) < EPS;
    var bIsHorizontal = Math.abs(b.dy) < EPS;
    if (aIsHorizontal && bIsHorizontal) {
      return b.to.x - a.to.x;
    }
    // TODO: What if both a and b is horizontal?
    // move horizontal to end
    if (aIsHorizontal) { 
      return useBelow ? -1 : 1;
    }

    if (bIsHorizontal) {
      if (useBelow) {
        return (b.from.x >= lastPointX) ? -1 : 1
      }
      return -1;
      // return useBelow ? 1 : -1;
    }
    var pa = a.angle;
    var pb = b.angle;
    if (Math.abs(pa - pb) >= EPS) {
      return useBelow ? pa - pb : pb - pa;
    }

    var segDist = a.from.y - b.from.y;
    if (Math.abs(segDist) >= EPS) {
      return -segDist;
    }
    segDist = a.to.y - b.to.y;
    if (Math.abs(segDist) >= EPS) {
      // TODO: Is this accurate?
      return -segDist;
    }

    return 0;
    // Could also use:
    // var aAngle = Math.atan2(a.from.y - a.to.y, a.from.x - a.to.x);
    // var bAngle = Math.atan2(b.from.y - b.to.y, b.from.x - b.to.x);
    // return useBelow ? bAngle - aAngle : aAngle - bAngle;
  }

  function getBoundarySegments(upper, interior) {
    var leftMost, rightMost, i;
    var uLength = upper.length;

    if (uLength > 0) {
      leftMost = rightMost = upper[0];
    } else {
      leftMost = rightMost = interior[0];
    }

    for (i = 1; i < uLength; ++i) {
      var s = upper[i];
      var cmp = compareSegments(leftMost, s);
      if (cmp > 0) leftMost = s;

      cmp = compareSegments(rightMost, s);
      if (cmp < 0) rightMost = s;
    }

    var startFrom = uLength > 0 ? 0 : 1;
    for (i = startFrom; i < interior.length; ++i) {
      s = interior[i];
      cmp = compareSegments(leftMost, s);
      if (cmp > 0) leftMost = s;

      cmp = compareSegments(rightMost, s);
      if (cmp < 0) rightMost = s;
    }

    // at this point we have our left/right segments in the status.
    // Let's find their prev/next elements and report them back:
    var left = status.find(leftMost);
    if (!left) {
      onError('Left is missing. Precision error?');
    }

    var right = status.find(rightMost);
    if (!right) {
      onError('Right is missing. Precision error?');
    }

    var beforeLeft = left && status.prev(left);
    var afterRight = right && status.next(right);

    while (afterRight && right.key.dy === 0 && afterRight.key.dy === 0) {
      // horizontal segments are special :(
      afterRight = status.next(afterRight);
    }

    currentBoundary.beforeLeft = beforeLeft && beforeLeft.key;
    currentBoundary.left = left && left.key;
    currentBoundary.right = right && right.key;
    currentBoundary.afterRight = afterRight && afterRight.key;

    return currentBoundary;
  }

  function getLeftRightPoint(p) {
    // We are trying to find left and right segments that are nearest to the
    // point p. For this we traverse the binary search tree, and remember
    // node with the shortest distance to p.
    var lastLeft;
    var current = status._root;
    var minX = Number.POSITIVE_INFINITY;
    while (current) {
      var x = getIntersectionXPoint(current.key, p.x, p.y);
      var dx = p.x - x;
      if (dx >= 0) {
        if (dx < minX) {
          minX = dx;
          lastLeft = current;
          current = current.left;
        } else {
          break;
        }
      } else {
        if (-dx < minX) {
          minX = -dx;
          lastLeft = current;
          current = current.right;
        } else {
          break;
        }
      }
    }

    currentLeftRight.left = lastLeft && lastLeft.key;
    var next = lastLeft && status.next(lastLeft);
    currentLeftRight.right = next && next.key;
    return currentLeftRight;

    // Conceptually, the code above should be equivalent to the code below;
    // The code below is easier to understand, but intuitively, the code above
    // should have better performance (as we do not traverse the entire status
    // tree)

    // var right, left,  x;
    // var all = status.keys()
    // for (var i = 0; i < all.length; ++i) {
    //   var segment = all[i];
    //   x = getIntersectionXPoint(segment, p.x, p.y);
    //   if (x > p.x && !right) {
    //     right = segment;
    //     break;
    //   } else if (x < p.x) {
    //     left = segment;
    //   }
    // }

    // currentLeftRight.left = left;
    // currentLeftRight.right = right;

    // return currentLeftRight;
  }

  function findSegmentsWithPoint(p, onFound) {
    // Option 1.
    // var arrResults = [];
    // status.forEach(current => {
    //   var x = getIntersectionXPoint(current.key, p.x, p.y);
    //   var dx = p.x - x;
    //   if (Math.abs(dx) < EPS) {
    //     onFound(current.key);
    //    // arrResults.push(current.key)
    //   }
    // });
    // return arrResults;

    // Option 2.

    // let current = status._root;
    // const Q = [];  /* Initialize stack s */
    // let done = false;
    // var res = [];
    // var breakEarly = false;

    // while (!done) {
    //   if (current !==  null) {
    //     Q.push(current);
    //     current = current.left;
    //   } else {
    //     if (Q.length !== 0) {
    //       current = Q.pop();

    //       var x = getIntersectionXPoint(current.key, p.x, p.y);
    //       var dx = p.x - x;
    //       if (Math.abs(dx) < EPS) {
    //         res.push(current.key)
    //         breakEarly = true;
    //       } else if (breakEarly) {
    //         done = true;
    //       }

    //       current = current.right;
    //     } else done = true;
    //   }
    // }

    // return res;

    // option 3.
    var current = status._root;

    while (current) {
      var x = getIntersectionXPoint(current.key, p.x, p.y);
      var dx = p.x - x;
      if (Math.abs(dx) < EPS) {
        collectAdjacentNodes(current, p, onFound);
        break;
      } else if (dx < 0) {
        current = current.left;
      } else {
        current = current.right;
      }
    }
  }

  function collectAdjacentNodes(root, p, onFound) {
    onFound(root.key);
    goOverPredecessors(root.left, p, onFound);
    goOverSuccessors(root.right, p, onFound);
  }

  function goOverPredecessors(root, p, res) {
    if (!root) return;
    var x = getIntersectionXPoint(root.key, p.x, p.y);
    var dx = p.x - x;
    if (Math.abs(dx) < EPS) {
      collectAdjacentNodes(root, p, res);
    } else {
      goOverPredecessors(root.right, p, res);
    }
  }

  function goOverSuccessors(root, p, res) {
    if (!root) return;
    var x = getIntersectionXPoint(root.key, p.x, p.y);
    var dx = p.x - x;
    if (Math.abs(dx) < EPS) {
      collectAdjacentNodes(root, p, res);
    } else {
      goOverSuccessors(root.left, p, res);
    }
  }

  function checkDuplicate() {
    var prev;
    status.forEach(node => {
      var current = node.key;

      if (prev) {
        if (samePoint(prev.from, current.from) && samePoint(prev.to, current.to)) {
          // Likely you have received error before during segment removal.
          onError('Duplicate key in the status! This may be caused by Floating Point rounding error');
        }
      }
      prev = current;
    });
  }

  function printStatus(prefix = '') {
    // eslint-disable-next-line
    console.log(prefix, 'status line: ', lastPointX, lastPointY);
    status.forEach(node => {
      var x = getIntersectionXPoint(node.key, lastPointX, lastPointY);
      // eslint-disable-next-line
      console.log(x + ' ' + node.key.name);
    });
  }

  function insertSegments(interior, upper, sweepLinePos) {
    lastPointY = sweepLinePos.y;
    lastPointX = sweepLinePos.x;
    var key;

    for (var i = 0; i < interior.length; ++i) {
      key = interior[i];
      status.add(key);
    }
    for (i = 0; i < upper.length; ++i) {
      key = upper[i];
      status.add(key);
    }
  }

  function deleteSegments(lower, interior, sweepLinePos) {
    // I spent most of the time debugging this method. Depending on the
    // algorithm state we can run into situation when dynamic keys of the
    // `status` tree predict wrong branch, and thus we are not able to find
    // the segment that needs to be deleted. If that happens I'm trying to
    // use previous point and repeat the process. This may result in 
    // incorrect state. In that case I report an error. 
    var i;
    var prevCount = status._size;
    prevX = lastPointX;
    prevY = lastPointY;
    lastPointY = sweepLinePos.y;
    lastPointX = sweepLinePos.x;

    useBelow = true;
    for(i = 0; i < lower.length; ++i) {
      removeSegment(lower[i], sweepLinePos);
    }
    for(i = 0; i < interior.length; ++i) {
      removeSegment(interior[i], sweepLinePos);
    }
    useBelow = false;

    if (status._size !== prevCount - interior.length - lower.length) {
      // This can happen when rounding error occurs. You can try scaling your input
      onError('Segments were not removed from a tree properly. Precision error?');
    }
  }

  function removeSegment(key, sweepLinePos) {
    if (status.find(key)) {
      status.remove(key);
    } else {
      lastPointX = prevX;
      lastPointY = prevY;
      if (status.find(key)) {
        status.remove(key);
      }
      lastPointY = sweepLinePos.y;
      lastPointX = sweepLinePos.x;
    }
  }
}

/**
 * Represents a single event in the sweep-line algorithm
 */
class SweepEvent {
  /**
   * Creates new sweep event of a given kind.
   */
  constructor(point, segment) {
    this.point = point;
    if (segment) this.from = [segment];
  }
}

/**
 * A point on a line
 * 
 * @typedef {Object} Point
 * @property {number} x coordinate
 * @property {number} y coordinate
 */


/**
 * @typedef {Object} Segment 
 * @property {Point} from start of the segment
 * @property {Point} to end of the segment
 */

/**
 * @typedef {function(point : Point, interior : Segment[], lower : Segment[], upper : Segment[])} ReportIntersectionCallback
 */

/**
 * @typedef {Object} ISectOptions 
 * @property {ReportIntersectionCallback} onFound 
 */

 /**
  * @typedef {Object} ISectResult
  */

// We use EMPTY array to avoid pressure on garbage collector. Need to be
// very cautious to not mutate this array.
var EMPTY = [];

/**
 * Finds all intersections among given segments.
 * 
 * The algorithm follows "Computation Geometry, Algorithms and Applications" book
 * by Mark de Berg, Otfried Cheong, Marc van Kreveld, and Mark Overmars.
 * 
 * Line is swept top-down
 * 
 * @param {Segment[]} segments
 * @param {ISectOptions=} options
 * @returns {ISectResult}
 */
function isect(segments, options) {
  var results = [];
  var reportIntersection = (options && options.onFound) || defaultIntersectionReporter;

  var onError = (options && options.onError) || defaultErrorReporter;

  var eventQueue = createEventQueue(byY);
  var sweepStatus = createSweepStatus(onError, EPS);
  var lower, interior, lastPoint;

  segments.forEach(addSegment);

  return {
    /**
     * Find all intersections synchronously.
     * 
     * @returns array of found intersections.
     */
    run,

    /**
     * Performs a single step in the sweep line algorithm
     * 
     * @returns true if there was something to process; False if no more work to do
     */
    step,

    // Methods below are low level API for fine-grained control.
    // Don't use it unless you understand this code thoroughly

    /**
     * Add segment into the 
     */
    addSegment,

    /**
     * Direct access to event queue. Queue contains segment endpoints and
     * pending detected intersections.
     */
    eventQueue, 

    /**
     * Direct access to sweep line status. "Status" holds information about
     * all intersected segments.
     */
    sweepStatus,

    /**
     * Access to results array. Works only when you use default onFound() handler
     */
    results
  }

  function run() {
    while (!eventQueue.isEmpty()) {
      var eventPoint = eventQueue.pop();
      if (handleEventPoint(eventPoint)) {
        // they decided to stop.
        return;
      }    }

    return results;
  }

  function step() {
    if (!eventQueue.isEmpty()) {
      var eventPoint = eventQueue.pop();
      handleEventPoint(eventPoint);
      // Note: we don't check results of `handleEventPoint()`
      // assumption is that client controls `step()` and thus they 
      // know better if they want to stop.
      return true;
    }
    return false;
  }

  function handleEventPoint(p) {
    lastPoint = p.point;
    var upper = p.from || EMPTY;

    lower = interior = undefined;
    // TODO: move lower/interior into sweep status method?

    sweepStatus.findSegmentsWithPoint(lastPoint, addLowerOrInterior);
    // if (segmentsWithPoint) {
    //   segmentsWithPoint.forEach()
    // } 

    if (!lower) lower = EMPTY;
    if (!interior) interior = EMPTY;

    var uLength = upper.length;
    var iLength = interior.length;
    var lLength = lower.length;
    var hasIntersection = uLength + iLength + lLength > 1;
    var hasPointIntersection = !hasIntersection && (uLength === 0 && lLength === 0 && iLength > 0);

    if (hasIntersection || hasPointIntersection) {
      p.isReported = true;
      if (reportIntersection(lastPoint, union(interior, union(lower, upper)))) {
        return true;
      }
    }

    sweepStatus.deleteSegments(lower, interior, lastPoint);
    sweepStatus.insertSegments(interior, upper, lastPoint);

    var sLeft, sRight;

    var hasNoCrossing = (uLength + iLength === 0);

    if (hasNoCrossing) {
      var leftRight = sweepStatus.getLeftRightPoint(lastPoint);
      sLeft = leftRight.left;
      if (!sLeft) return;

      sRight = leftRight.right;
      if (!sRight) return;

      findNewEvent(sLeft, sRight, p);
    } else {
      var boundarySegments = sweepStatus.getBoundarySegments(upper, interior);

      findNewEvent(boundarySegments.beforeLeft, boundarySegments.left, p);
      findNewEvent(boundarySegments.right, boundarySegments.afterRight, p);
    }

    return false;
  }

  function addLowerOrInterior(s) {
    if (samePoint(s.to, lastPoint)) {
      if (!lower) lower = [s];
      else lower.push(s);
    } else if (!samePoint(s.from, lastPoint)) {
      if (!interior) interior = [s];
      else interior.push(s);
    }
  }

  function findNewEvent(left, right, p) {
    if (!left || !right) return;

    var intersection = intersectSegments$1(left, right);
    if (!intersection) {
        return;
    }

    var dy = p.point.y - intersection.y;
    // TODO: should I add dy to intersection.y?
    if (dy < -EPS) {
      // this means intersection happened after the sweep line. 
      // We already processed it.
      return;
    }
    if (Math.abs(dy) < EPS && intersection.x <= p.point.x) {
      return;
    }

    // Need to adjust floating point for this special case,
    // since otherwise it gives rounding errors:
    roundNearZero(intersection);

    var current = eventQueue.find(intersection);

    if (current && current.isReported) {
      // We already reported this event. No need to add it one more time
      // TODO: Is this case even possible?
      onError('We already reported this event.');
      return;
    }

    if (!current) {
      var event = new SweepEvent(intersection);
      eventQueue.insert(event);
    }
  }

  function defaultIntersectionReporter(p, segments) {
    results.push({
      point: p, 
      segments: segments
    });
  }

  function addSegment(segment) {
    var from = segment.from;
    var to = segment.to;

    // Small numbers give more precision errors. Rounding them to 0.
    roundNearZero(from);
    roundNearZero(to);

    var dy = from.y - to.y;

    // Note: dy is much smaller then EPS on purpose. I found that higher
    // precision here does less good - getting way more rounding errors.
    if (Math.abs(dy) < 1e-5) {
      from.y = to.y;
      segment.dy = 0;
    }
    if ((from.y < to.y) || (
        (from.y === to.y) && (from.x > to.x))
      ) {
      var temp = from;
      from = segment.from = to; 
      to = segment.to = temp;
    }

    // We pre-compute some immutable properties of the segment
    // They are used quite often in the tree traversal, and pre-computation
    // gives significant boost:
    segment.dy = from.y - to.y;
    segment.dx = from.x - to.x;
    segment.angle = angle(segment.dy, segment.dx);

    var isPoint = segment.dy === segment.dx && segment.dy === 0;
    var prev = eventQueue.find(from);
    if (prev && !isPoint) {
      // this detects identical segments early. Without this check
      // the algorithm would break since sweep line has no means to
      // detect identical segments.
      var prevFrom = prev.data.from;
      if (prevFrom) {
        for (var i = 0; i < prevFrom.length; ++i) {
          var s = prevFrom[i];
          if (samePoint(s.to, to)) {
            reportIntersection(s.from, [s.from, s.to]);
            reportIntersection(s.to, [s.from, s.to]);
            return;
          }
        }
      }
    }

    if (!isPoint) {
      if (prev) {
        if (prev.data.from) prev.data.from.push(segment);
        else prev.data.from = [segment];
      } else {
        var e = new SweepEvent(from, segment);
        eventQueue.insert(e);
      }
      var event = new SweepEvent(to);
      eventQueue.insert(event);
    } else {
      var event = new SweepEvent(to);
      eventQueue.insert(event);
    }
  } 
}

function roundNearZero(point) {
  if (Math.abs(point.x) < EPS) point.x = 0;
  if (Math.abs(point.y) < EPS) point.y = 0;
}

function defaultErrorReporter(errorMessage) {
  throw new Error(errorMessage);
}

function union(a, b) {
  if (!a) return b;
  if (!b) return a;

  return a.concat(b);
}

function byY(a, b) {
  // decreasing Y 
  var res = b.y - a.y;
  // TODO: This might mess up the status tree.
  if (Math.abs(res) < EPS) {
    // increasing x.
    res = a.x - b.x;
    if (Math.abs(res) < EPS) res = 0;
  }

  return res;
}

function intersectSegments(a, b) {
  // Note: this is almost the same as geom.intersectSegments()
  // The main difference is that we don't have a pre-computed
  // value for dx/dy on the segments.
  //  https://stackoverflow.com/a/1968345/125351
  var aStart = a.from, bStart = b.from;
  var p0_x = aStart.x, p0_y = aStart.y,
      p2_x = bStart.x, p2_y = bStart.y;

  var s1_x = a.from.x - a.to.x, s1_y = a.from.y - a.to.y, s2_x = b.from.x - b.to.x, s2_y = b.from.y - b.to.y;
  var div = s1_x * s2_y - s2_x * s1_y;

  var s = (s1_y * (p0_x - p2_x) - s1_x * (p0_y - p2_y)) / div;
  if (s < 0 || s > 1) return;

  var t = (s2_x * (p2_y - p0_y) + s2_y * (p0_x - p2_x)) / div;

  if (t >= 0 && t <= 1) {
    return {
      x: p0_x - (t * s1_x),
      y: p0_y - (t * s1_y)
    }
  }
}

/**
 * This is a brute force solution with O(n^2) performance.
 * (`n` is number of segments).
 * 
 * Use this when number of lines is low, and number of intersections
 * is high.
 */
function brute(lines, options) {
  var results = [];
  var reportIntersection = (options && options.onFound) || 
                            defaultIntersectionReporter;
  var asyncState;

  return {
    /**
     * Execute brute force of the segment intersection search
     */
    run,
    /**
     * Access to results array. Works only when you use default onFound() handler
     */
    results,

    /**
     * Performs a single step in the brute force algorithm ()
     */
    step
  }

  function step() {
    if (!asyncState) {
      asyncState = {
        i: 0
      };
    }
    var test = lines[asyncState.i];
    for (var j = asyncState.i + 1; j < lines.length; ++j) {
      var other = lines[j];
      var pt = intersectSegments(test, other);
      if (pt) {
        if (reportIntersection(pt, [test, other])) {
          return;
        }
      }
    }
    asyncState.i += 1;
    return asyncState.i < lines.length;
  }

  function run() {
    for(var i = 0; i < lines.length; ++i) {
      var test = lines[i];
      for (var j = i + 1; j < lines.length; ++j) {
        var other = lines[j];
        var pt = intersectSegments(test, other);
        if (pt) {
          if (reportIntersection(pt, [test, other])) {
            return;
          }
        }
      }
    }
    return results;
  }

  function defaultIntersectionReporter(p, interior) {
    results.push({
      point: p, 
      segments: interior
    });
  }
}

class FlatQueue {

    constructor() {
        this.ids = [];
        this.values = [];
        this.length = 0;
    }

    clear() {
        this.length = 0;
    }

    push(id, value) {
        let pos = this.length++;
        this.ids[pos] = id;
        this.values[pos] = value;

        while (pos > 0) {
            const parent = (pos - 1) >> 1;
            const parentValue = this.values[parent];
            if (value >= parentValue) break;
            this.ids[pos] = this.ids[parent];
            this.values[pos] = parentValue;
            pos = parent;
        }

        this.ids[pos] = id;
        this.values[pos] = value;
    }

    pop() {
        if (this.length === 0) return undefined;

        const top = this.ids[0];
        this.length--;

        if (this.length > 0) {
            const id = this.ids[0] = this.ids[this.length];
            const value = this.values[0] = this.values[this.length];
            const halfLength = this.length >> 1;
            let pos = 0;

            while (pos < halfLength) {
                let left = (pos << 1) + 1;
                const right = left + 1;
                let bestIndex = this.ids[left];
                let bestValue = this.values[left];
                const rightValue = this.values[right];

                if (right < this.length && rightValue < bestValue) {
                    left = right;
                    bestIndex = this.ids[right];
                    bestValue = rightValue;
                }
                if (bestValue >= value) break;

                this.ids[pos] = bestIndex;
                this.values[pos] = bestValue;
                pos = left;
            }

            this.ids[pos] = id;
            this.values[pos] = value;
        }

        return top;
    }

    peek() {
        if (this.length === 0) return undefined;
        return this.ids[0];
    }

    peekValue() {
        if (this.length === 0) return undefined;
        return this.values[0];
    }
}

const ARRAY_TYPES = [
    Int8Array, Uint8Array, Uint8ClampedArray, Int16Array, Uint16Array,
    Int32Array, Uint32Array, Float32Array, Float64Array
];

const VERSION = 3; // serialized format version

class Flatbush {

    static from(data) {
        if (!(data instanceof ArrayBuffer)) {
            throw new Error('Data must be an instance of ArrayBuffer.');
        }
        const [magic, versionAndType] = new Uint8Array(data, 0, 2);
        if (magic !== 0xfb) {
            throw new Error('Data does not appear to be in a Flatbush format.');
        }
        if (versionAndType >> 4 !== VERSION) {
            throw new Error(`Got v${versionAndType >> 4} data when expected v${VERSION}.`);
        }
        const [nodeSize] = new Uint16Array(data, 2, 1);
        const [numItems] = new Uint32Array(data, 4, 1);

        return new Flatbush(numItems, nodeSize, ARRAY_TYPES[versionAndType & 0x0f], data);
    }

    constructor(numItems, nodeSize = 16, ArrayType = Float64Array, data) {
        if (numItems === undefined) throw new Error('Missing required argument: numItems.');
        if (isNaN(numItems) || numItems <= 0) throw new Error(`Unpexpected numItems value: ${numItems}.`);

        this.numItems = +numItems;
        this.nodeSize = Math.min(Math.max(+nodeSize, 2), 65535);

        // calculate the total number of nodes in the R-tree to allocate space for
        // and the index of each tree level (used in search later)
        let n = numItems;
        let numNodes = n;
        this._levelBounds = [n * 4];
        do {
            n = Math.ceil(n / this.nodeSize);
            numNodes += n;
            this._levelBounds.push(numNodes * 4);
        } while (n !== 1);

        this.ArrayType = ArrayType || Float64Array;
        this.IndexArrayType = numNodes < 16384 ? Uint16Array : Uint32Array;

        const arrayTypeIndex = ARRAY_TYPES.indexOf(this.ArrayType);
        const nodesByteSize = numNodes * 4 * this.ArrayType.BYTES_PER_ELEMENT;

        if (arrayTypeIndex < 0) {
            throw new Error(`Unexpected typed array class: ${ArrayType}.`);
        }

        if (data && (data instanceof ArrayBuffer)) {
            this.data = data;
            this._boxes = new this.ArrayType(this.data, 8, numNodes * 4);
            this._indices = new this.IndexArrayType(this.data, 8 + nodesByteSize, numNodes);

            this._pos = numNodes * 4;
            this.minX = this._boxes[this._pos - 4];
            this.minY = this._boxes[this._pos - 3];
            this.maxX = this._boxes[this._pos - 2];
            this.maxY = this._boxes[this._pos - 1];

        } else {
            this.data = new ArrayBuffer(8 + nodesByteSize + numNodes * this.IndexArrayType.BYTES_PER_ELEMENT);
            this._boxes = new this.ArrayType(this.data, 8, numNodes * 4);
            this._indices = new this.IndexArrayType(this.data, 8 + nodesByteSize, numNodes);
            this._pos = 0;
            this.minX = Infinity;
            this.minY = Infinity;
            this.maxX = -Infinity;
            this.maxY = -Infinity;

            new Uint8Array(this.data, 0, 2).set([0xfb, (VERSION << 4) + arrayTypeIndex]);
            new Uint16Array(this.data, 2, 1)[0] = nodeSize;
            new Uint32Array(this.data, 4, 1)[0] = numItems;
        }

        // a priority queue for k-nearest-neighbors queries
        this._queue = new FlatQueue();
    }

    add(minX, minY, maxX, maxY) {
        const index = this._pos >> 2;
        this._indices[index] = index;
        this._boxes[this._pos++] = minX;
        this._boxes[this._pos++] = minY;
        this._boxes[this._pos++] = maxX;
        this._boxes[this._pos++] = maxY;

        if (minX < this.minX) this.minX = minX;
        if (minY < this.minY) this.minY = minY;
        if (maxX > this.maxX) this.maxX = maxX;
        if (maxY > this.maxY) this.maxY = maxY;

        return index;
    }

    finish() {
        if (this._pos >> 2 !== this.numItems) {
            throw new Error(`Added ${this._pos >> 2} items when expected ${this.numItems}.`);
        }

        if (this.numItems <= this.nodeSize) {
            // only one node, skip sorting and just fill the root box
            this._boxes[this._pos++] = this.minX;
            this._boxes[this._pos++] = this.minY;
            this._boxes[this._pos++] = this.maxX;
            this._boxes[this._pos++] = this.maxY;
            return;
        }

        const width = (this.maxX - this.minX) || 1;
        const height = (this.maxY - this.minY) || 1;
        const hilbertValues = new Uint32Array(this.numItems);
        const hilbertMax = (1 << 16) - 1;

        // map item centers into Hilbert coordinate space and calculate Hilbert values
        for (let i = 0; i < this.numItems; i++) {
            let pos = 4 * i;
            const minX = this._boxes[pos++];
            const minY = this._boxes[pos++];
            const maxX = this._boxes[pos++];
            const maxY = this._boxes[pos++];
            const x = Math.floor(hilbertMax * ((minX + maxX) / 2 - this.minX) / width);
            const y = Math.floor(hilbertMax * ((minY + maxY) / 2 - this.minY) / height);
            hilbertValues[i] = hilbert(x, y);
        }

        // sort items by their Hilbert value (for packing later)
        sort(hilbertValues, this._boxes, this._indices, 0, this.numItems - 1, this.nodeSize);

        // generate nodes at each tree level, bottom-up
        for (let i = 0, pos = 0; i < this._levelBounds.length - 1; i++) {
            const end = this._levelBounds[i];

            // generate a parent node for each block of consecutive <nodeSize> nodes
            while (pos < end) {
                const nodeIndex = pos;

                // calculate bbox for the new node
                let nodeMinX = Infinity;
                let nodeMinY = Infinity;
                let nodeMaxX = -Infinity;
                let nodeMaxY = -Infinity;
                for (let i = 0; i < this.nodeSize && pos < end; i++) {
                    nodeMinX = Math.min(nodeMinX, this._boxes[pos++]);
                    nodeMinY = Math.min(nodeMinY, this._boxes[pos++]);
                    nodeMaxX = Math.max(nodeMaxX, this._boxes[pos++]);
                    nodeMaxY = Math.max(nodeMaxY, this._boxes[pos++]);
                }

                // add the new node to the tree data
                this._indices[this._pos >> 2] = nodeIndex;
                this._boxes[this._pos++] = nodeMinX;
                this._boxes[this._pos++] = nodeMinY;
                this._boxes[this._pos++] = nodeMaxX;
                this._boxes[this._pos++] = nodeMaxY;
            }
        }
    }

    search(minX, minY, maxX, maxY, filterFn) {
        if (this._pos !== this._boxes.length) {
            throw new Error('Data not yet indexed - call index.finish().');
        }

        let nodeIndex = this._boxes.length - 4;
        const queue = [];
        const results = [];

        while (nodeIndex !== undefined) {
            // find the end index of the node
            const end = Math.min(nodeIndex + this.nodeSize * 4, upperBound(nodeIndex, this._levelBounds));

            // search through child nodes
            for (let pos = nodeIndex; pos < end; pos += 4) {
                const index = this._indices[pos >> 2] | 0;

                // check if node bbox intersects with query bbox
                if (maxX < this._boxes[pos]) continue; // maxX < nodeMinX
                if (maxY < this._boxes[pos + 1]) continue; // maxY < nodeMinY
                if (minX > this._boxes[pos + 2]) continue; // minX > nodeMaxX
                if (minY > this._boxes[pos + 3]) continue; // minY > nodeMaxY

                if (nodeIndex < this.numItems * 4) {
                    if (filterFn === undefined || filterFn(index)) {
                        results.push(index); // leaf item
                    }

                } else {
                    queue.push(index); // node; add it to the search queue
                }
            }

            nodeIndex = queue.pop();
        }

        return results;
    }

    neighbors(x, y, maxResults = Infinity, maxDistance = Infinity, filterFn) {
        if (this._pos !== this._boxes.length) {
            throw new Error('Data not yet indexed - call index.finish().');
        }

        let nodeIndex = this._boxes.length - 4;
        const q = this._queue;
        const results = [];
        const maxDistSquared = maxDistance * maxDistance;

        while (nodeIndex !== undefined) {
            // find the end index of the node
            const end = Math.min(nodeIndex + this.nodeSize * 4, upperBound(nodeIndex, this._levelBounds));

            // add child nodes to the queue
            for (let pos = nodeIndex; pos < end; pos += 4) {
                const index = this._indices[pos >> 2] | 0;

                const dx = axisDist(x, this._boxes[pos], this._boxes[pos + 2]);
                const dy = axisDist(y, this._boxes[pos + 1], this._boxes[pos + 3]);
                const dist = dx * dx + dy * dy;

                if (nodeIndex < this.numItems * 4) { // leaf node
                    if (filterFn === undefined || filterFn(index)) {
                        // put an odd index if it's an item rather than a node, to recognize later
                        q.push((index << 1) + 1, dist);
                    }
                } else {
                    q.push(index << 1, dist);
                }
            }

            // pop items from the queue
            while (q.length && (q.peek() & 1)) {
                const dist = q.peekValue();
                if (dist > maxDistSquared) {
                    q.clear();
                    return results;
                }
                results.push(q.pop() >> 1);

                if (results.length === maxResults) {
                    q.clear();
                    return results;
                }
            }

            nodeIndex = q.pop() >> 1;
        }

        q.clear();
        return results;
    }
}

function axisDist(k, min, max) {
    return k < min ? min - k : k <= max ? 0 : k - max;
}

// binary search for the first value in the array bigger than the given
function upperBound(value, arr) {
    let i = 0;
    let j = arr.length - 1;
    while (i < j) {
        const m = (i + j) >> 1;
        if (arr[m] > value) {
            j = m;
        } else {
            i = m + 1;
        }
    }
    return arr[i];
}

// custom quicksort that partially sorts bbox data alongside the hilbert values
function sort(values, boxes, indices, left, right, nodeSize) {
    if (Math.floor(left / nodeSize) >= Math.floor(right / nodeSize)) return;

    const pivot = values[(left + right) >> 1];
    let i = left - 1;
    let j = right + 1;

    while (true) {
        do i++; while (values[i] < pivot);
        do j--; while (values[j] > pivot);
        if (i >= j) break;
        swap(values, boxes, indices, i, j);
    }

    sort(values, boxes, indices, left, j, nodeSize);
    sort(values, boxes, indices, j + 1, right, nodeSize);
}

// swap two values and two corresponding boxes
function swap(values, boxes, indices, i, j) {
    const temp = values[i];
    values[i] = values[j];
    values[j] = temp;

    const k = 4 * i;
    const m = 4 * j;

    const a = boxes[k];
    const b = boxes[k + 1];
    const c = boxes[k + 2];
    const d = boxes[k + 3];
    boxes[k] = boxes[m];
    boxes[k + 1] = boxes[m + 1];
    boxes[k + 2] = boxes[m + 2];
    boxes[k + 3] = boxes[m + 3];
    boxes[m] = a;
    boxes[m + 1] = b;
    boxes[m + 2] = c;
    boxes[m + 3] = d;

    const e = indices[i];
    indices[i] = indices[j];
    indices[j] = e;
}

// Fast Hilbert curve algorithm by http://threadlocalmutex.com/
// Ported from C++ https://github.com/rawrunprotected/hilbert_curves (public domain)
function hilbert(x, y) {
    let a = x ^ y;
    let b = 0xFFFF ^ a;
    let c = 0xFFFF ^ (x | y);
    let d = x & (y ^ 0xFFFF);

    let A = a | (b >> 1);
    let B = (a >> 1) ^ a;
    let C = ((c >> 1) ^ (b & (d >> 1))) ^ c;
    let D = ((a & (c >> 1)) ^ (d >> 1)) ^ d;

    a = A; b = B; c = C; d = D;
    A = ((a & (a >> 2)) ^ (b & (b >> 2)));
    B = ((a & (b >> 2)) ^ (b & ((a ^ b) >> 2)));
    C ^= ((a & (c >> 2)) ^ (b & (d >> 2)));
    D ^= ((b & (c >> 2)) ^ ((a ^ b) & (d >> 2)));

    a = A; b = B; c = C; d = D;
    A = ((a & (a >> 4)) ^ (b & (b >> 4)));
    B = ((a & (b >> 4)) ^ (b & ((a ^ b) >> 4)));
    C ^= ((a & (c >> 4)) ^ (b & (d >> 4)));
    D ^= ((b & (c >> 4)) ^ ((a ^ b) & (d >> 4)));

    a = A; b = B; c = C; d = D;
    C ^= ((a & (c >> 8)) ^ (b & (d >> 8)));
    D ^= ((b & (c >> 8)) ^ ((a ^ b) & (d >> 8)));

    a = C ^ (C >> 1);
    b = D ^ (D >> 1);

    let i0 = x ^ y;
    let i1 = b | (0xFFFF ^ (i0 | a));

    i0 = (i0 | (i0 << 8)) & 0x00FF00FF;
    i0 = (i0 | (i0 << 4)) & 0x0F0F0F0F;
    i0 = (i0 | (i0 << 2)) & 0x33333333;
    i0 = (i0 | (i0 << 1)) & 0x55555555;

    i1 = (i1 | (i1 << 8)) & 0x00FF00FF;
    i1 = (i1 | (i1 << 4)) & 0x0F0F0F0F;
    i1 = (i1 | (i1 << 2)) & 0x33333333;
    i1 = (i1 | (i1 << 1)) & 0x55555555;

    return ((i1 << 1) | i0) >>> 0;
}

/**
 * This implementation is inspired by discussion here 
 * https://twitter.com/mourner/status/1049325199617921024 and 
 * here https://github.com/anvaka/isect/issues/1
 * 
 * It builds an index of all segments using static spatial index
 * and then for each segment it queries overlapping rectangles.
 */
function bush(lines, options) {
  var results = [];
  var reportIntersection = (options && options.onFound) || 
                            defaultIntersectionReporter;
  var asyncState;

  var index = new Flatbush(lines.length);
  lines.forEach(addToIndex);
  index.finish();

  return {
    run: run,
    step: step,
    results: results,

    // undocumented, don't use unless you know what you are doing:
    checkIntersection: checkIntersection
  }

  function run() {
    for (var i = 0; i < lines.length; ++i) {
      if (checkIntersection(lines[i], i)) {
        return; // stop early
      }
    }
    return results;
  }

  function checkIntersection(currentSegment, currentId) {
    // sorry about code duplication.
    var minX = currentSegment.from.x; var maxX = currentSegment.to.x;
    var minY = currentSegment.from.y; var maxY = currentSegment.to.y;
    var t;
    if (minX > maxX) { t = minX; minX = maxX; maxX = t; }
    if (minY > maxY) { t = minY; minY = maxY; maxY = t; }

    var ids = index.search(minX, minY, maxX, maxY);

    for (var i = 0; i < ids.length; ++i) {
      var segmentIndex = ids[i];
      if (segmentIndex <= currentId) continue; // we have either reported it, or it is current.

      var otherSegment = lines[segmentIndex];
      var point = intersectSegments(otherSegment, currentSegment);

      if (point) {
        if (reportIntersection(point, [currentSegment, otherSegment])) {
          // stop early
          return true;
        }
      }
    }
  }

  function step() {
    if (!asyncState) {
      asyncState = {i: 0};
    }
    var test = lines[asyncState.i];
    checkIntersection(test, asyncState.i);
    asyncState.i += 1;
    return asyncState.i < lines.length;
  }


  function addToIndex(line) {
    var minX = line.from.x; var maxX = line.to.x;
    var minY = line.from.y; var maxY = line.to.y;
    var t;
    if (minX > maxX) { t = minX; minX = maxX; maxX = t; }
    if (minY > maxY) { t = minY; minY = maxY; maxY = t; }
    index.add(minX, minY, maxX, maxY);
  }

  function defaultIntersectionReporter(p, interior) {
    results.push({
      point: p, 
      segments: interior
    });
  }
}

export { brute, bush, isect as sweep };
