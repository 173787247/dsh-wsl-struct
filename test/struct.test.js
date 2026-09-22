import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { assertReadonlySql } from "../lib/struct.js";

describe("sqlite guard", () => {
  it("allows select", () => {
    assert.equal(assertReadonlySql("SELECT 1"), "SELECT 1");
  });
  it("blocks mutate", () => {
    assert.throws(() => assertReadonlySql("DELETE FROM t"), /SELECT|refused|mutating/);
  });
  it("blocks multi", () => {
    assert.throws(() => assertReadonlySql("SELECT 1; SELECT 2"), /multiple/);
  });
});
