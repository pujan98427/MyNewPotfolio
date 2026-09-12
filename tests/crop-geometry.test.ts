import assert from "node:assert/strict";
import {lockedCropScale} from "../lib/lab/crop-geometry.ts";

assert.equal(lockedCropScale(60,80,100,100,400,400,100,100),.7,"horizontal inward movement shrinks");
assert.equal(lockedCropScale(80,60,100,100,400,400,100,100),.7,"vertical inward movement shrinks");
assert.equal(lockedCropScale(40,80,50,100,800,400,100,100),.8,"portrait ratio uses screen coordinates");
assert.equal(lockedCropScale(200,200,100,100,400,400,60,70),.6,"opposite corner bounds are respected");
assert.equal(lockedCropScale(-20,-20,100,100,400,400,100,100),.25,"crossing the anchor respects minimum size");
assert.equal(lockedCropScale(80,80,100,100,0,0,100,100),0,"zero-sized canvas is safe");
console.log("Crop geometry checks passed.");
