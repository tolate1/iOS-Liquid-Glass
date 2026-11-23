import assert from "node:assert/strict";
import test from "node:test";
import { boundSegment, interpolateSegment, stepSpring } from "../src/motion.js";

test("interpolates unequal segments and clamps the presented size and center", () => {
  const segments = [{ center: 25, width: 50 }, { center: 105, width: 110 }];
  assert.deepEqual(interpolateSegment(segments, 65), { center: 65, width: 80 });
  assert.deepEqual(interpolateSegment(segments, -10), segments[0]);
  assert.deepEqual(interpolateSegment(segments, 200), segments[1]);
  assert.deepEqual(boundSegment({ center: 145, width: 100 }, 160), { center: 110, width: 100 });
});

test("retargets a settling spring from its current position and signed velocity", () => {
  const first = stepSpring(40, 0, 140, .04);
  assert.ok(first.value > 40 && first.value < 140 && first.velocity > 0);
  assert.deepEqual(stepSpring(first.value, first.velocity, 40, 0), first);
  const reversed = stepSpring(first.value, first.velocity, 40, .2);
  assert.ok(reversed.velocity < 0 && reversed.value < first.value);
  assert.ok(Math.abs(stepSpring(first.value, first.velocity, 40, 1).value - 40) < .01);
});
