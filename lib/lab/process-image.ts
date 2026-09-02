export type ImageOperation="compress"|"resize"|"convert"|"crop";
type ProcessImageOptions={file:File;mode:ImageOperation;width:number;height:number;quality:number;outputType:string;ratio:string;position:number;cropX?:number;cropY?:number;cropWidth?:number;cropHeight?:number;cropZoom?:number;cropRotation?:number};
type ProcessedImage={blob:Blob;width:number;height:number};
export type ImageFormatCandidate={type:string;blob:Blob;width:number;height:number};
type DecodedImage={source:ImageBitmap|HTMLImageElement;width:number;height:number;close:()=>void};

async function canvasBlob(canvas:HTMLCanvasElement,type:string,quality:number){return await new Promise<Blob|null>(resolve=>canvas.toBlob(resolve,type,quality))}

async function decodeOrientedImage(file:File):Promise<DecodedImage>{
  if(typeof createImageBitmap==="function"){
    try{
      const bitmap=await createImageBitmap(file,{imageOrientation:"from-image"});
      return {source:bitmap,width:bitmap.width,height:bitmap.height,close:()=>bitmap.close()};
    }catch{/* Fall through to the browser image decoder for formats it can display. */}
  }
  const url=URL.createObjectURL(file),image=new Image();
  image.decoding="async";image.src=url;
  try{
    await image.decode();
    return {source:image,width:image.naturalWidth,height:image.naturalHeight,close:()=>{image.src="";URL.revokeObjectURL(url)}};
  }catch(error){URL.revokeObjectURL(url);throw error}
}

export async function compareImageFormats(file:File,quality:number,outputTypes:string[]):Promise<ImageFormatCandidate[]>{
  const decoded=await decodeOrientedImage(file);
  const canvases:HTMLCanvasElement[]=[];
  try{
    const canvas=document.createElement("canvas");canvases.push(canvas);canvas.width=decoded.width;canvas.height=decoded.height;
    const context=canvas.getContext("2d");if(!context)throw new Error("Canvas is unavailable.");
    context.drawImage(decoded.source,0,0);
    const candidates=await Promise.all(outputTypes.map(async type=>{
      let encodingCanvas=canvas;
      if(type==="image/jpeg"){
        encodingCanvas=document.createElement("canvas");canvases.push(encodingCanvas);encodingCanvas.width=canvas.width;encodingCanvas.height=canvas.height;
        const jpegContext=encodingCanvas.getContext("2d");if(!jpegContext)return null;
        jpegContext.fillStyle="#fff";jpegContext.fillRect(0,0,canvas.width,canvas.height);jpegContext.drawImage(canvas,0,0);
      }
      const blob=await canvasBlob(encodingCanvas,type,quality);
      return blob&&blob.size>0&&blob.type===type?{type,blob,width:canvas.width,height:canvas.height}:null;
    }));
    return candidates.filter((candidate):candidate is ImageFormatCandidate=>candidate!==null);
  }finally{for(const canvas of canvases){canvas.width=0;canvas.height=0}decoded.close()}
}

export async function processImage({file,mode,width,height,quality,outputType,cropX=0,cropY=0,cropWidth=100,cropHeight=100,cropZoom=1,cropRotation=0}:ProcessImageOptions):Promise<ProcessedImage>{
  const decoded=await decodeOrientedImage(file);
  const htmlCanvases:HTMLCanvasElement[]=[],offscreenCanvases:OffscreenCanvas[]=[];
  try{
    if(mode==="crop"){
      const quarterTurn=cropRotation%180!==0,workingWidth=quarterTurn?decoded.height:decoded.width,workingHeight=quarterTurn?decoded.width:decoded.height;
      const working=document.createElement("canvas");htmlCanvases.push(working);working.width=workingWidth;working.height=workingHeight;
      const workingContext=working.getContext("2d");if(!workingContext)throw new Error("Canvas is unavailable.");
      workingContext.translate(workingWidth/2,workingHeight/2);workingContext.scale(cropZoom,cropZoom);workingContext.rotate(cropRotation*Math.PI/180);workingContext.drawImage(decoded.source,-decoded.width/2,-decoded.height/2);
      const sx=Math.round(cropX/100*workingWidth),sy=Math.round(cropY/100*workingHeight),sw=Math.max(1,Math.round(cropWidth/100*workingWidth)),sh=Math.max(1,Math.round(cropHeight/100*workingHeight));
      const output=document.createElement("canvas");htmlCanvases.push(output);output.width=sw;output.height=sh;
      const outputContext=output.getContext("2d");if(!outputContext)throw new Error("Canvas is unavailable.");
      outputContext.drawImage(working,sx,sy,sw,sh,0,0,sw,sh);
      const blob=await canvasBlob(output,outputType,quality);if(!blob)throw new Error("This browser could not create the cropped image.");
      return {blob,width:sw,height:sh};
    }
    const sx=0,sy=0,sw=decoded.width,sh=decoded.height;
    let dw=width||sw,dh=height||sh;
    if(mode==="compress"||mode==="convert"){dw=sw;dh=sh}
    const outputWidth=Math.max(1,Math.round(dw)),outputHeight=Math.max(1,Math.round(dh));
    if(typeof OffscreenCanvas!=="undefined"){
      const canvas=new OffscreenCanvas(outputWidth,outputHeight);offscreenCanvases.push(canvas);const context=canvas.getContext("2d");
      if(!context)throw new Error("Canvas is unavailable.");
      if(outputType==="image/jpeg"){context.fillStyle="#fff";context.fillRect(0,0,outputWidth,outputHeight)}
      context.drawImage(decoded.source,sx,sy,sw,sh,0,0,outputWidth,outputHeight);
      return {blob:await canvas.convertToBlob({type:outputType,quality}),width:outputWidth,height:outputHeight};
    }
    const canvas=document.createElement("canvas");htmlCanvases.push(canvas);canvas.width=outputWidth;canvas.height=outputHeight;
    const context=canvas.getContext("2d");if(!context)throw new Error("Canvas is unavailable.");
    if(outputType==="image/jpeg"){context.fillStyle="#fff";context.fillRect(0,0,outputWidth,outputHeight)}
    context.drawImage(decoded.source,sx,sy,sw,sh,0,0,outputWidth,outputHeight);
    const blob=await canvasBlob(canvas,outputType,quality);if(!blob)throw new Error("This browser could not create the selected format.");
    return {blob,width:outputWidth,height:outputHeight};
  }finally{for(const canvas of htmlCanvases){canvas.width=0;canvas.height=0}for(const canvas of offscreenCanvases){canvas.width=1;canvas.height=1}decoded.close()}
}
