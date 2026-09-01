export type ImageOperation="compress"|"resize"|"convert"|"crop";
type ProcessImageOptions={file:File;mode:ImageOperation;width:number;height:number;quality:number;outputType:string;ratio:string;position:number};
type ProcessedImage={blob:Blob;width:number;height:number};

async function canvasBlob(canvas:HTMLCanvasElement,type:string,quality:number){return await new Promise<Blob|null>(resolve=>canvas.toBlob(resolve,type,quality))}

export async function processImage({file,mode,width,height,quality,outputType,ratio,position}:ProcessImageOptions):Promise<ProcessedImage>{
  const bitmap=await createImageBitmap(file);
  try{
    let sx=0,sy=0,sw=bitmap.width,sh=bitmap.height,dw=width||sw,dh=height||sh;
    if(mode==="compress"||mode==="convert"){dw=sw;dh=sh}
    if(mode==="crop"){
      const [rw,rh]=ratio.split(":").map(Number),target=rw/rh;
      if(sw/sh>target){const cropWidth=sh*target;sx=(sw-cropWidth)*(position/100);sw=cropWidth}
      else{const cropHeight=sw/target;sy=(sh-cropHeight)*(position/100);sh=cropHeight}
      dw=Math.round(sw);dh=Math.round(sh);
    }
    const outputWidth=Math.max(1,Math.round(dw)),outputHeight=Math.max(1,Math.round(dh));
    if(typeof OffscreenCanvas!=="undefined"){
      const canvas=new OffscreenCanvas(outputWidth,outputHeight),context=canvas.getContext("2d");
      if(!context)throw new Error("Canvas is unavailable.");
      if(outputType==="image/jpeg"){context.fillStyle="#fff";context.fillRect(0,0,outputWidth,outputHeight)}
      context.drawImage(bitmap,sx,sy,sw,sh,0,0,outputWidth,outputHeight);
      return {blob:await canvas.convertToBlob({type:outputType,quality}),width:outputWidth,height:outputHeight};
    }
    const canvas=document.createElement("canvas");canvas.width=outputWidth;canvas.height=outputHeight;
    const context=canvas.getContext("2d");if(!context)throw new Error("Canvas is unavailable.");
    if(outputType==="image/jpeg"){context.fillStyle="#fff";context.fillRect(0,0,outputWidth,outputHeight)}
    context.drawImage(bitmap,sx,sy,sw,sh,0,0,outputWidth,outputHeight);
    const blob=await canvasBlob(canvas,outputType,quality);if(!blob)throw new Error("This browser could not create the selected format.");
    return {blob,width:outputWidth,height:outputHeight};
  }finally{bitmap.close()}
}
