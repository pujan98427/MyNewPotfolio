import assert from "node:assert/strict";
import {clampCropExtent,lockedCropScale} from "../lib/lab/crop-geometry.ts";

assert.equal(lockedCropScale(60,80,100,100,400,400,100,100),.7,"horizontal inward movement shrinks");
assert.equal(lockedCropScale(80,60,100,100,400,400,100,100),.7,"vertical inward movement shrinks");
assert.equal(lockedCropScale(40,80,50,100,800,400,100,100),.8,"portrait ratio uses screen coordinates");
assert.equal(lockedCropScale(200,200,100,100,400,400,60,70),.6,"opposite corner bounds are respected");
assert.equal(lockedCropScale(-20,-20,100,100,400,400,100,100),.08,"crossing the anchor respects 32px minimum");
assert.equal(lockedCropScale(0,0,50,100,800,400,100,100),.08,"paired ratio dimensions both reach 32px");
assert.equal(clampCropExtent(-50,100,400),8,"free crop minimum is 32px");
assert.equal(clampCropExtent(200,60,400),60,"cannot escape the opposite anchor");
assert.equal(clampCropExtent(0,5,400),5,"bounds win when fewer than 32px are available");
assert.equal(clampCropExtent(0,100,16),100,"tiny editor remains bounded");
assert.equal(lockedCropScale(80,80,100,100,0,0,100,100),0,"zero-sized canvas is safe");
console.log("Crop geometry checks passed.");
