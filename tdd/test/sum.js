"use strict";
const assert = require("assert");
const sum = require("../sum");
it("adds 1 + 2 to equal 3", () => {
  assert(sum(1, 2), 3);
});

