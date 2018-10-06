/*!
 * isect v1.0.0
 * (c) 2018 Andrei Kashcha.
 * Released under the MIT License.
 */
(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports) :
  typeof define === 'function' && define.amd ? define(['exports'], factory) :
  (factory((global.isect = {})));
}(this, (function (exports) { 'use strict';

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

  var Node = function Node (key, data) {
    this.key  = key;
    this.data = data;
    this.left = null;
    this.right= null;
  };

  function DEFAULT_COMPARE (a, b) { return a > b ? 1 : a < b ? -1 : 0; }


  /**
   * Simple top down splay, not requiring i to be in the tree t.
   * @param {Key} i
   * @param {Node?} t
   * @param {Comparator} comparator
   */
  function splay (i, t, comparator) {
    if (t === null) { return t; }
    var l, r, y;
    var N = new Node();
    l = r = N;

    while (true) {
      var cmp = comparator(i, t.key);
      //if (i < t.key) {
      if (cmp < 0) {
        if (t.left === null) { break; }
        //if (i < t.left.key) {
        if (comparator(i, t.left.key) < 0) {
          y = t.left;                           /* rotate right */
          t.left = y.right;
          y.right = t;
          t = y;
          if (t.left === null) { break; }
        }
        r.left = t;                               /* link right */
        r = t;
        t = t.left;
      //} else if (i > t.key) {
      } else if (cmp > 0) {
        if (t.right === null) { break; }
        //if (i > t.right.key) {
        if (comparator(i, t.right.key) > 0) {
          y = t.right;                          /* rotate left */
          t.right = y.left;
          y.left = t;
          t = y;
          if (t.right === null) { break; }
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
    var node = new Node(i, data);

    tree._size++;

    if (t === null) {
      node.left = node.right = null;
      return node;
    }

    t = splay(i, t, comparator);
    var cmp = comparator(i, t.key);
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
    var node = new Node(i, data);

    if (t === null) {
      node.left = node.right = null;
      tree._size++;
      return node;
    }

    t = splay(i, t, comparator);
    var cmp = comparator(i, t.key);
    if (cmp === 0) { return t; }
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
    var x;
    if (t === null) { return null; }
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
    var left, right;
    if (v === null) {
      left = right = null;
    } else {
      v = splay(key, v, comparator);

      var cmp = comparator(v.key, key);
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
    return { left: left, right: right };
  }


  function merge (left, right, comparator) {
    if (right === null) { return left; }
    if (left  === null) { return right; }

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
      out(("" + prefix + (isTail ? '└── ' : '├── ') + (printNode(root)) + "\n"));
      var indent = prefix + (isTail ? '    ' : '│   ');
      if (root.left)  { printRow(root.left,  indent, false, out, printNode); }
      if (root.right) { printRow(root.right, indent, true,  out, printNode); }
    }
  }


  var Tree = function Tree (comparator) {
    if ( comparator === void 0 ) comparator = DEFAULT_COMPARE;

    this._comparator = comparator;
    this._root = null;
    this._size = 0;
  };

  var prototypeAccessors = { size: { configurable: true } };


  /**
   * Inserts a key, allows duplicates
   * @param{Key}  key
   * @param{Value=} data
   * @return {Node|null}
   */
  Tree.prototype.insert = function insert$1 (key, data) {
    return this._root = insert(key, data, this._root, this._comparator, this);
  };


  /**
   * Adds a key, if it is not present in the tree
   * @param{Key}  key
   * @param{Value=} data
   * @return {Node|null}
   */
  Tree.prototype.add = function add$1 (key, data) {
    return this._root = add(key, data, this._root, this._comparator, this);
  };


  /**
   * @param{Key} key
   * @return {Node|null}
   */
  Tree.prototype.remove = function remove$1 (key) {
    this._root = remove(key, this._root, this._comparator, this);
  };


  /**
   * Removes and returns the node with smallest key
   * @return {?Node}
   */
  Tree.prototype.pop = function pop () {
    var node = this._root;
    if (node) {
      while (node.left) { node = node.left; }
      this._root = splay(node.key,this._root, this._comparator);
      this._root = remove(node.key, this._root, this._comparator, this);
      return { key: node.key, data: node.data };
    }
    return null;
  };


  /**
   * @param{Key} key
   * @return {Node|null}
   */
  Tree.prototype.findStatic = function findStatic (key) {
    var current = this._root;
    var compare = this._comparator;
    while (current) {
      var cmp = compare(key, current.key);
      if (cmp === 0)  { return current; }
      else if (cmp < 0) { current = current.left; }
      else            { current = current.right; }
    }
    return null;
  };


  /**
   * @param{Key} key
   * @return {Node|null}
   */
  Tree.prototype.find = function find (key) {
    if (this._root) {
      this._root = splay(key, this._root, this._comparator);
      if (this._comparator(key, this._root.key) !== 0) { return null; }
    }
    return this._root;
  };


  /**
   * @param{Key} key
   * @return {Boolean}
   */
  Tree.prototype.contains = function contains (key) {
    var current = this._root;
    var compare = this._comparator;
    while (current) {
      var cmp = compare(key, current.key);
      if (cmp === 0)  { return true; }
      else if (cmp < 0) { current = current.left; }
      else            { current = current.right; }
    }
    return false;
  };


  /**
   * @param{Visitor} visitor
   * @param{*=}    ctx
   * @return {SplayTree}
   */
  Tree.prototype.forEach = function forEach (visitor, ctx) {
    var current = this._root;
    var Q = [];/* Initialize stack s */
    var done = false;

    while (!done) {
      if (current !==null) {
        Q.push(current);
        current = current.left;
      } else {
        if (Q.length !== 0) {
          current = Q.pop();
          visitor.call(ctx, current);

          current = current.right;
        } else { done = true; }
      }
    }
    return this;
  };


  /**
   * Walk key range from `low` to `high`. Stops if `fn` returns a value.
   * @param{Key}    low
   * @param{Key}    high
   * @param{Function} fn
   * @param{*?}     ctx
   * @return {SplayTree}
   */
  Tree.prototype.range = function range (low, high, fn, ctx) {
      var this$1 = this;

    var Q = [];
    var compare = this._comparator;
    var node = this._root, cmp;

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
          if (fn.call(ctx, node)) { return this$1; } // stop if smth is returned
        }
        node = node.right;
      }
    }
    return this;
  };


  /**
   * Returns array of keys
   * @return {Array<Key>}
   */
  Tree.prototype.keys = function keys () {
    var keys = [];
    this.forEach(function (ref) {
        var key = ref.key;

        return keys.push(key);
      });
    return keys;
  };


  /**
   * Returns array of all the data in the nodes
   * @return {Array<Value>}
   */
  Tree.prototype.values = function values () {
    var values = [];
    this.forEach(function (ref) {
        var data = ref.data;

        return values.push(data);
      });
    return values;
  };


  /**
   * @return {Key|null}
   */
  Tree.prototype.min = function min () {
    if (this._root) { return this.minNode(this._root).key; }
    return null;
  };


  /**
   * @return {Key|null}
   */
  Tree.prototype.max = function max () {
    if (this._root) { return this.maxNode(this._root).key; }
    return null;
  };


  /**
   * @return {Node|null}
   */
  Tree.prototype.minNode = function minNode (t) {
      if ( t === void 0 ) t = this._root;

    if (t) { while (t.left) { t = t.left; } }
    return t;
  };


  /**
   * @return {Node|null}
   */
  Tree.prototype.maxNode = function maxNode (t) {
      if ( t === void 0 ) t = this._root;

    if (t) { while (t.right) { t = t.right; } }
    return t;
  };


  /**
   * Returns node at given index
   * @param{number} index
   * @return {?Node}
   */
  Tree.prototype.at = function at (index) {
    var current = this._root, done = false, i = 0;
    var Q = [];

    while (!done) {
      if (current) {
        Q.push(current);
        current = current.left;
      } else {
        if (Q.length > 0) {
          current = Q.pop();
          if (i === index) { return current; }
          i++;
          current = current.right;
        } else { done = true; }
      }
    }
    return null;
  };


  /**
   * @param{Node} d
   * @return {Node|null}
   */
  Tree.prototype.next = function next (d) {
    var root = this._root;
    var successor = null;

    if (d.right) {
      successor = d.right;
      while (successor.left) { successor = successor.left; }
      return successor;
    }

    var comparator = this._comparator;
    while (root) {
      var cmp = comparator(d.key, root.key);
      if (cmp === 0) { break; }
      else if (cmp < 0) {
        successor = root;
        root = root.left;
      } else { root = root.right; }
    }

    return successor;
  };


  /**
   * @param{Node} d
   * @return {Node|null}
   */
  Tree.prototype.prev = function prev (d) {
    var root = this._root;
    var predecessor = null;

    if (d.left !== null) {
      predecessor = d.left;
      while (predecessor.right) { predecessor = predecessor.right; }
      return predecessor;
    }

    var comparator = this._comparator;
    while (root) {
      var cmp = comparator(d.key, root.key);
      if (cmp === 0) { break; }
      else if (cmp < 0) { root = root.left; }
      else {
        predecessor = root;
        root = root.right;
      }
    }
    return predecessor;
  };


  /**
   * @return {SplayTree}
   */
  Tree.prototype.clear = function clear () {
    this._root = null;
    this._size = 0;
    return this;
  };


  /**
   * @return {NodeList}
   */
  Tree.prototype.toList = function toList$1 () {
    return toList(this._root);
  };


  /**
   * Bulk-load items. Both array have to be same size
   * @param{Array<Key>}  keys
   * @param{Array<Value>}[values]
   * @param{Boolean}     [presort=false] Pre-sort keys and values, using
   *                                       tree's comparator. Sorting is done
   *                                       in-place
   * @return {AVLTree}
   */
  Tree.prototype.load = function load (keys, values, presort) {
      if ( keys === void 0 ) keys = [];
      if ( values === void 0 ) values = [];
      if ( presort === void 0 ) presort = false;

    var size = keys.length;
    var comparator = this._comparator;

    // sort if needed
    if (presort) { sort(keys, values, 0, size - 1, comparator); }

    if (this._root === null) { // empty tree
      this._root = loadRecursive(this._root, keys, values, 0, size);
      this._size = size;
    } else { // that re-builds the whole tree from two in-order traversals
      var mergedList = mergeLists(this.toList(), createList(keys, values), comparator);
      size = this._size + size;
      this._root = sortedListToBST({ head: mergedList }, 0, size);
    }
    return this;
  };


  /**
   * @return {Boolean}
   */
  Tree.prototype.isEmpty = function isEmpty () { return this._root === null; };

  prototypeAccessors.size.get = function () { return this._size; };


  /**
   * @param{NodePrinter=} printNode
   * @return {String}
   */
  Tree.prototype.toString = function toString (printNode) {
      if ( printNode === void 0 ) printNode = function (n) { return n.key; };

    var out = [];
    printRow(this._root, '', true, function (v) { return out.push(v); }, printNode);
    return out.join('');
  };


  Tree.prototype.update = function update (key, newKey, newData) {
    var comparator = this._comparator;
    var ref = split(key, this._root, comparator);
      var left = ref.left;
      var right = ref.right;
    this._size--;
    if (comparator(key, newKey) < 0) {
      right = insert(newKey, newData, right, comparator, this);
    } else {
      left = insert(newKey, newData, left, comparator, this);
    }
    this._root = merge(left, right, comparator);
  };


  Tree.prototype.split = function split$1 (key) {
    return split(key, this._root, this._comparator);
  };

  Object.defineProperties( Tree.prototype, prototypeAccessors );


  function loadRecursive (parent, keys, values, start, end) {
    var size = end - start;
    if (size > 0) {
      var middle = start + Math.floor(size / 2);
      var key    = keys[middle];
      var data   = values[middle];
      var node   = { key: key, data: data, parent: parent };
      node.left    = loadRecursive(node, keys, values, start, middle);
      node.right   = loadRecursive(node, keys, values, middle + 1, end);
      return node;
    }
    return null;
  }


  function createList(keys, values) {
    var head = { next: null };
    var p = head;
    for (var i = 0; i < keys.length; i++) {
      p = p.next = { key: keys[i], data: values[i] };
    }
    p.next = null;
    return head.next;
  }


  function toList (root) {
    var current = root;
    var Q = [], done = false;

    var head = { next: null };
    var p = head;

    while (!done) {
      if (current) {
        Q.push(current);
        current = current.left;
      } else {
        if (Q.length > 0) {
          current = p = p.next = Q.pop();
          current = current.right;
        } else { done = true; }
      }
    }
    p.next = null; // that'll work even if the tree was empty
    return head.next;
  }


  function sortedListToBST(list, start, end) {
    var size = end - start;
    if (size > 0) {
      var middle = start + Math.floor(size / 2);
      var left = sortedListToBST(list, start, middle);

      var root = list.head;
      root.left = left;

      list.head = list.head.next;

      root.right = sortedListToBST(list, middle + 1, end);
      return root;
    }
    return null;
  }


  function mergeLists (l1, l2, compare) {
    if ( compare === void 0 ) compare = function (a, b) { return a - b; };

    var head = {}; // dummy
    var p = head;

    var p1 = l1;
    var p2 = l2;

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

    if (p1 !== null)      { p.next = p1; }
    else if (p2 !== null) { p.next = p2; }

    return head.next;
  }


  function sort(keys, values, left, right, compare) {
    if (left >= right) { return; }

    var pivot = keys[(left + right) >> 1];
    var i = left - 1;
    var j = right + 1;

    while (true) {
      do { i++; } while (compare(keys[i], pivot) < 0);
      do { j--; } while (compare(keys[j], pivot) > 0);
      if (i >= j) { break; }

      var tmp = keys[i];
      keys[i] = keys[j];
      keys[j] = tmp;

      tmp = values[i];
      values[i] = values[j];
      values[j] = tmp;
    }

    sort(keys, values,  left,     j, compare);
    sort(keys, values, j + 1, right, compare);
  }

  function createEventQueue(byY) {
    var q = new Tree(byY);

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
  var EPS = 1e-9;//10;

  function getIntersectionXPoint(segment, xPos, yPos) {
    var dy1 = segment.from.y - yPos;
    var dy2 = yPos - segment.to.y;
    var dy = segment.to.y - segment.from.y;
    if (Math.abs(dy1) < EPS) {
      // The segment starts on the sweep line
      if (Math.abs(dy) < EPS) {
        // the segment is horizontal. Intersection is at the point
        if (xPos <= segment.from.x) { return segment.from.x; }
        if (xPos > segment.to.x) { return segment.to.x; }
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

    if (dy < 0) { return p - 1; }  // -2 .. 0 increasing with x
    return 1 - p               //  0 .. 2 decreasing with x
  }

  function intersectSegments(a, b) {
    //  https://stackoverflow.com/a/1968345/125351
    var aStart = a.from, bStart = b.from;
    var p0_x = aStart.x, p0_y = aStart.y,
        p2_x = bStart.x, p2_y = bStart.y;

    var s1_x = a.dx, s1_y = a.dy, s2_x = b.dx, s2_y = b.dy;
    var div = s1_x * s2_y - s2_x * s1_y;

    var s = (s1_y * (p0_x - p2_x) - s1_x * (p0_y - p2_y)) / div;
    if (s < 0 || s > 1) { return; }

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
  function createSweepStatus(onError, EPS$$1) {
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
      insertSegments: insertSegments,

      /**
       * Remove segments from the status tree.
       */
      deleteSegments: deleteSegments,

      /**
       * Returns segments that are to the left and right from a given point.
       */
      getLeftRightPoint: getLeftRightPoint,

      /**
       * For a given collections of segments finds the most left and the most right
       * segments. Also returns segments immediately before left, and after right segments.
       */
      getBoundarySegments: getBoundarySegments,

      findSegmentsWithPoint: findSegmentsWithPoint,

      /**
       * Current binary search tree with segments
       */
      status: status,

      /**
       * Introspection method that verifies if there are duplicates in the segment tree.
       * If there are - `onError()` is called.
       */
      checkDuplicate: checkDuplicate,

      /**
       * Prints current segments in order of their intersection with sweep line. Introspection method.
       */
      printStatus: printStatus,

      /**
       * Returns current position of the sweep line.
       */
      getLastPoint: function getLastPoint() {
        return {x: lastPointX, y: lastPointY};
      }
    }

    function compareSegments(a, b) {
      if (a === b) { return 0; }

      var ak = getIntersectionXPoint(a, lastPointX, lastPointY);
      var bk = getIntersectionXPoint(b, lastPointX, lastPointY);

      var res = ak - bk;
      if (Math.abs(res) >= EPS$$1) {
        // We are okay fine. Intersection distance between two segments
        // is good to give conclusive answer
        return res;
      }

      var aIsHorizontal = Math.abs(a.dy) < EPS$$1;
      var bIsHorizontal = Math.abs(b.dy) < EPS$$1;
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
      if (Math.abs(pa - pb) >= EPS$$1) {
        return useBelow ? pa - pb : pb - pa;
      }

      var segDist = a.from.y - b.from.y;
      if (Math.abs(segDist) >= EPS$$1) {
        return -segDist;
      }
      segDist = a.to.y - b.to.y;
      if (Math.abs(segDist) >= EPS$$1) {
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
        if (cmp > 0) { leftMost = s; }

        cmp = compareSegments(rightMost, s);
        if (cmp < 0) { rightMost = s; }
      }

      var startFrom = uLength > 0 ? 0 : 1;
      for (i = startFrom; i < interior.length; ++i) {
        s = interior[i];
        cmp = compareSegments(leftMost, s);
        if (cmp > 0) { leftMost = s; }

        cmp = compareSegments(rightMost, s);
        if (cmp < 0) { rightMost = s; }
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
        if (Math.abs(dx) < EPS$$1) {
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
      if (!root) { return; }
      var x = getIntersectionXPoint(root.key, p.x, p.y);
      var dx = p.x - x;
      if (Math.abs(dx) < EPS$$1) {
        collectAdjacentNodes(root, p, res);
      } else {
        goOverPredecessors(root.right, p, res);
      }
    }

    function goOverSuccessors(root, p, res) {
      if (!root) { return; }
      var x = getIntersectionXPoint(root.key, p.x, p.y);
      var dx = p.x - x;
      if (Math.abs(dx) < EPS$$1) {
        collectAdjacentNodes(root, p, res);
      } else {
        goOverSuccessors(root.left, p, res);
      }
    }

    function checkDuplicate() {
      var prev;
      status.forEach(function (node) {
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

    function printStatus(prefix) {
      if ( prefix === void 0 ) prefix = '';

      // eslint-disable-next-line
      console.log(prefix, 'status line: ', lastPointX, lastPointY);
      status.forEach(function (node) {
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
  var SweepEvent = function SweepEvent(point, segment) {
    this.point = point;
    if (segment) { this.from = [segment]; }
  };

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
      run: run,

      /**
       * Performs a single step in the sweep line algorithm
       * 
       * @returns true if there was something to process; False if no more work to do
       */
      step: step,

      // Methods below are low level API for fine-grained control.
      // Don't use it unless you understand this code thoroughly

      /**
       * Add segment into the 
       */
      addSegment: addSegment,

      /**
       * Direct access to event queue. Queue contains segment endpoints and
       * pending detected intersections.
       */
      eventQueue: eventQueue, 

      /**
       * Direct access to sweep line status. "Status" holds information about
       * all intersected segments.
       */
      sweepStatus: sweepStatus,

      /**
       * Access to results array. Works only when you use default onFound() handler
       */
      results: results
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

      if (!lower) { lower = EMPTY; }
      if (!interior) { interior = EMPTY; }

      var uLength = upper.length;
      var iLength = interior.length;
      var lLength = lower.length;
      var hasIntersection = uLength + iLength + lLength > 1;
      var hasPointIntersection = !hasIntersection && (uLength === 0 && lLength === 0 && iLength > 0);

      if (hasIntersection || hasPointIntersection) {
        p.isReported = true;
        if (reportIntersection(lastPoint, interior, lower, upper)) {
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
        if (!sLeft) { return; }

        sRight = leftRight.right;
        if (!sRight) { return; }

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
        if (!lower) { lower = [s]; }
        else { lower.push(s); }
      } else if (!samePoint(s.from, lastPoint)) {
        if (!interior) { interior = [s]; }
        else { interior.push(s); }
      }
    }

    function findNewEvent(left, right, p) {
      if (!left || !right) { return; }

      var intersection = intersectSegments(left, right);
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

    function defaultIntersectionReporter(p, interior, lower, upper) {
      results.push({
        point: p, 
        segments: union(union(interior, lower), upper)
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
              reportIntersection(s.from, [], s.from, s.to);
              reportIntersection(s.to, [], s.from, s.to);
              return;
            }
          }
        }
      }

      if (!isPoint) {
        if (prev) {
          if (prev.data.from) { prev.data.from.push(segment); }
          else { prev.data.from = [segment]; }
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
    if (Math.abs(point.x) < EPS) { point.x = 0; }
    if (Math.abs(point.y) < EPS) { point.y = 0; }
  }

  function defaultErrorReporter(errorMessage) {
    throw new Error(errorMessage);
  }

  function union(a, b) {
    if (!a) { return b; }
    if (!b) { return a; }

    return a.concat(b);
  }

  function byY(a, b) {
    // decreasing Y 
    var res = b.y - a.y;
    // TODO: This might mess up the status tree.
    if (Math.abs(res) < EPS) {
      // increasing x.
      res = a.x - b.x;
      if (Math.abs(res) < EPS) { res = 0; }
    }

    return res;
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
      run: run,
      /**
       * Access to results array. Works only when you use default onFound() handler
       */
      results: results,

      /**
       * Performs a single step in the brute force algorithm ()
       */
      step: step
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
        var pt = intersectSegments$1(test, other);
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
          var pt = intersectSegments$1(test, other);
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

  function intersectSegments$1(a, b) {
    //  https://stackoverflow.com/a/1968345/125351
    var aStart = a.from, bStart = b.from;
    var p0_x = aStart.x, p0_y = aStart.y,
        p2_x = bStart.x, p2_y = bStart.y;

    var s1_x = a.from.x - a.to.x, s1_y = a.from.y - a.to.y, s2_x = b.from.x - b.to.x, s2_y = b.from.y - b.to.y;
    var div = s1_x * s2_y - s2_x * s1_y;

    var s = (s1_y * (p0_x - p2_x) - s1_x * (p0_y - p2_y)) / div;
    if (s < 0 || s > 1) { return; }

    var t = (s2_x * (p2_y - p0_y) + s2_y * (p0_x - p2_x)) / div;

    if (t >= 0 && t <= 1) {
      return {
        x: p0_x - (t * s1_x),
        y: p0_y - (t * s1_y)
      }
    }
  }

  exports.sweep = isect;
  exports.brute = brute;

  Object.defineProperty(exports, '__esModule', { value: true });

})));
//# sourceMappingURL=isect.js.map
