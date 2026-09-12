/** Project the dragged corner onto its ratio-locked diagonal in screen pixels. */
export function lockedCropScale(pointerWidth:number,pointerHeight:number,fittedWidth:number,fittedHeight:number,canvasWidth:number,canvasHeight:number,maxWidth:number,maxHeight:number){
  const dx=pointerWidth*canvasWidth/100,dy=pointerHeight*canvasHeight/100;
  const axisX=fittedWidth*canvasWidth/100,axisY=fittedHeight*canvasHeight/100;
  const lengthSquared=axisX*axisX+axisY*axisY;
  if(!lengthSquared||fittedWidth<=0||fittedHeight<=0)return 0;
  const projected=(dx*axisX+dy*axisY)/lengthSquared;
  return Math.max(0,Math.min(maxWidth/fittedWidth,maxHeight/fittedHeight,Math.max(.25,projected)));
}
