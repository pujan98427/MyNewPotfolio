import assert from "node:assert/strict";
import {clampCropExtent,lockedCropScale,cropPixelRect,cropTransform} from "../lib/lab/crop-geometry.ts";

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
const near=(actual:number,expected:number)=>assert.ok(Math.abs(actual-expected)<1e-8,`${actual} != ${expected}`);
assert.deepEqual(cropPixelRect(101,79,0,33.3,20,33.3,50),{workingWidth:101,workingHeight:79,sx:34,sy:16,sw:33,sh:39},"round opposite edges consistently");
assert.deepEqual(cropPixelRect(1200,800,90,25,10,50,70),{workingWidth:800,workingHeight:1200,sx:200,sy:120,sw:400,sh:840},"quarter turn swaps working aspect ratio");
const bounded=cropPixelRect(101,79,0,99.9,99.9,30,30);
assert.equal(bounded.sx+bounded.sw,101);
assert.equal(bounded.sy+bounded.sh,79);

let cases=0;
for(const [width,height] of [[1200,800],[800,1200],[101,79]]){
 for(const rotation of [0,90,180,270]){
  for(const zoom of [1,1.5,3]){
   const box=cropPixelRect(width,height,rotation,17.3,21.7,54.2,48.1);
   const [a,b,c,d,e,f]=cropTransform(width,height,rotation,zoom);
   // Independent CSS transform: centre the image, rotate, then zoom.
   for(const [sourceX,sourceY] of [[0,0],[width/2,height/2],[width*.3,height*.7],[width,height]]){
    const dx=sourceX-width/2,dy=sourceY-height/2;
    const [rx,ry]=rotation===0?[dx,dy]:rotation===90?[-dy,dx]:rotation===180?[-dx,-dy]:[dy,-dx];
    const expectedX=box.workingWidth/2+zoom*rx,expectedY=box.workingHeight/2+zoom*ry;
    near(a*sourceX+c*sourceY+e,expectedX);
    near(b*sourceX+d*sourceY+f,expectedY);
    // Editor position and size use CSS pixels. DPR must not multiply export pixels.
    for(const editorWidth of [240,640,1024])for(const dpr of [1,2,3]){
     const scale=editorWidth/box.workingWidth;
     const displayLeft=53,displayTop=87;
     const screenX=displayLeft+expectedX*scale,screenY=displayTop+expectedY*scale;
     const frameX=displayLeft+box.sx*scale,frameY=displayTop+box.sy*scale;
     near(((screenX-frameX)*dpr)/(scale*dpr),expectedX-box.sx);
     near(((screenY-frameY)*dpr)/(scale*dpr),expectedY-box.sy);
     near(box.sw*scale/scale,box.sw);
     near(box.sh*scale/scale,box.sh);
     cases++;
    }
   }
  }
 }
}
// Ratio resize helper coverage; this does not simulate DOM pointer events.
let ratioCases=0;
for(const [canvasWidth,canvasHeight] of [[640,480],[360,640]]){
 for(const targetRatio of [1,16/9,4/5,9/16]){
  const sourceRatio=canvasWidth/canvasHeight;
  const fittedWidth=sourceRatio>targetRatio?targetRatio/sourceRatio*100:100;
  const fittedHeight=sourceRatio>targetRatio?100:sourceRatio/targetRatio*100;
  for(const requestedScale of [0,.4,.8,2]){
   const scale=lockedCropScale(fittedWidth*requestedScale,fittedHeight*requestedScale,fittedWidth,fittedHeight,canvasWidth,canvasHeight,90,85);
   const width=fittedWidth*scale,height=fittedHeight*scale;
   near((width*canvasWidth)/(height*canvasHeight),targetRatio);
   assert.ok(width<=90+1e-8 && height<=85+1e-8,"fixed crop stays inside available bounds");
   assert.ok(width*canvasWidth/100>=32-1e-8 && height*canvasHeight/100>=32-1e-8,"both displayed dimensions meet minimum");
   ratioCases++;
  }
 }
}
console.log(`Crop geometry checks passed: ${cases} display/source/output mappings; ${ratioCases} fixed-ratio resize cases.`);
