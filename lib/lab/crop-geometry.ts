export const MIN_CROP_PIXELS=32;

/** Coordinates are oriented source pixels, never device pixels. Round edges, not sizes. */
export function cropPixelRect(width:number,height:number,rotation:number,x:number,y:number,cropWidth:number,cropHeight:number){
  const quarterTurn=rotation%180!==0;
  const workingWidth=quarterTurn?height:width,workingHeight=quarterTurn?width:height;
  const sx=Math.max(0,Math.min(workingWidth-1,Math.round(x/100*workingWidth)));
  const sy=Math.max(0,Math.min(workingHeight-1,Math.round(y/100*workingHeight)));
  const right=Math.max(sx+1,Math.min(workingWidth,Math.round((x+cropWidth)/100*workingWidth)));
  const bottom=Math.max(sy+1,Math.min(workingHeight,Math.round((y+cropHeight)/100*workingHeight)));
  return {workingWidth,workingHeight,sx,sy,sw:right-sx,sh:bottom-sy};
}

/** Same centre/zoom/rotation transform as the CSS editor, in source-pixel units. */
export function cropTransform(width:number,height:number,rotation:number,zoom:number){
  const radians=rotation*Math.PI/180;
  const cos=Math.round(Math.cos(radians)),sin=Math.round(Math.sin(radians));
  const workingWidth=rotation%180!==0?height:width,workingHeight=rotation%180!==0?width:height;
  const a=zoom*cos,b=zoom*sin,c=-zoom*sin,d=zoom*cos;
  return [a,b,c,d,workingWidth/2-a*width/2-c*height/2,workingHeight/2-b*width/2-d*height/2] as const;
}

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
