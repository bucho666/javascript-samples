"use strict";
const assert = require("chai").assert;

describe("deepEqual", () => {
  it("配列の比較", () => {
    assert.deepEqual([1, 2, 3], [1, 2, 3]);
    assert.notDeepEqual([2, 3, 1], [1, 2, 3]);
  });

  it("Setの比較", () => {
    assert.deepEqual(new Set([1, 2, 3]), new Set([2, 1, 3]));
  });
});
