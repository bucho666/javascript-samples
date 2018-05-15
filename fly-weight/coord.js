"use strict";
const assert = require('assert');

class Coord {
  constructor(x, y) {
    const name = `${x}:${y}`;
    if (Coord._cache.has(name)){ 
      return Coord._cache.get(name);
    }
    [this._x, this._y] = [x, y];
    Coord._cache.set(name, this);
  }
}
Coord._cache = new Map();

const a = new Coord(1, 2);
const b = new Coord(1, 2);
const c = new Coord(2, 3);
assert(a === b);
assert(a !== c);

const set = new Set();
set.add(a);
set.add(b);
assert(set.size === 1);
