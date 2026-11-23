import test from "node:test";
import assert from "node:assert/strict";
import { detectCapabilities, rasterGeometry, selectRenderer } from "../src/optics.js";

const capable = { syntax: { svg: true, frosted: true }, svgEligible: true };

test("renderer policy distinguishes capabilities, fallback and system preferences", () => {
  assert.deepEqual(detectCapabilities({}), { syntax: { svg: false, frosted: false }, svgEligible: false });
  assert.equal(selectRenderer(capable), "svg-backdrop");
  assert.equal(selectRenderer({ ...capable, svgEligible: false }), "frosted-css");
  assert.equal(selectRenderer(capable, { forceFallback: true, fallback: "opaque" }), "opaque");
  assert.equal(selectRenderer(capable, { renderer: "svg-backdrop", reduceTransparency: true }), "opaque");
  assert.equal(selectRenderer(capable, { renderer: "frosted-css", increaseContrast: true }), "opaque");
  assert.equal(selectRenderer({ syntax: { svg: false, frosted: false }, svgEligible: false }), "opaque");
});

test("raster math bounds pixel allocation and preserves fractional CSS sizing", () => {
  assert.deepEqual(rasterGeometry(200.25, 60.25, 99, 1.25), {
    width: 250, height: 75, radius: 38, density: 1.25,
  });
  assert.equal(rasterGeometry(4096, 512, 12, 3).width, 1024);
  assert.equal(rasterGeometry(4096, 32, 9, 3), null);
  assert.equal(rasterGeometry(23.9, 60, 9), null);
  assert.equal(rasterGeometry(Infinity, 60, 9), null);
});
