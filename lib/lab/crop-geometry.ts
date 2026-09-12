export const MIN_CROP_PIXELS=32;

/** Percentage extent with a displayed-pixel minimum; image bounds take priority. */
export function clampCropExtent(requested:number,available:number,displayedSize:number){
  if(displayedSize<=0)return 0;
  return Math.max(0,Math.min(available,Math.max(MIN_CROP_PIXELS/displayedSize*100,requested)));
}

/** Project the dragged corner onto its ratio-locked diagonal in screen pixels. */
export function lockedCropScale(pointerWidth:number,pointerHeight:number,fittedWidth:number,fittedHeight:number,canvasWidth:number,canvasHeight:number,maxWidth:number,maxHeight:number){
  const dx=pointerWidth*canvasWidth/100,dy=pointerHeight*canvasHeight/100;
  const axisX=fittedWidth*canvasWidth/100,axisY=fittedHeight*canvasHeight/100;
  const lengthSquared=axisX*axisX+axisY*axisY;
  if(!lengthSquared||fittedWidth<=0||fittedHeight<=0)return 0;
  const projected=(dx*axisX+dy*axisY)/lengthSquared;
  const minimumScale=Math.max(MIN_CROP_PIXELS/axisX,MIN_CROP_PIXELS/axisY);
  return Math.max(0,Math.min(maxWidth/fittedWidth,maxHeight/fittedHeight,Math.max(minimumScale,projected)));
}
