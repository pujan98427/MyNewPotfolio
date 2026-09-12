import {cropPixelRect,cropTransform} from "./crop-geometry";
import type {ImageFormatCandidate,ImageWorkerRequest,ImageWorkerResponse,ProcessImageOptions,ProcessedImage} from "./image-worker-types";

type WorkerScope={onmessage:((event:MessageEvent<ImageWorkerRequest>)=>void)|null;postMessage:(message:ImageWorkerResponse)=>void};
const workerScope=self as unknown as WorkerScope;

async function decode(file:File){
  if(typeof createImageBitmap!=="function")throw new Error("This browser cannot decode images away from the main screen.");
  return createImageBitmap(file,{imageOrientation:"from-image"});
}

async function encode(canvas:OffscreenCanvas,type:string,quality:number){
  const blob=await canvas.convertToBlob({type,quality});
  if(!blob.size||blob.type!==type)throw new Error("This browser could not create the selected image format.");
  return blob;
}

async function processInWorker({file,mode,width,height,quality,outputType,cropX=0,cropY=0,cropWidth=100,cropHeight=100,cropZoom=1,cropRotation=0}:ProcessImageOptions):Promise<ProcessedImage>{
  const decoded=await decode(file),canvases:OffscreenCanvas[]=[];
  try{
    if(mode==="crop"){
      const {workingWidth,workingHeight,sx,sy,sw,sh}=cropPixelRect(decoded.width,decoded.height,cropRotation,cropX,cropY,cropWidth,cropHeight);
      const working=new OffscreenCanvas(workingWidth,workingHeight);canvases.push(working);
      const workingContext=working.getContext("2d");if(!workingContext)throw new Error("Canvas is unavailable.");
      workingContext.setTransform(...cropTransform(decoded.width,decoded.height,cropRotation,cropZoom));workingContext.drawImage(decoded,0,0);
      const output=new OffscreenCanvas(sw,sh);canvases.push(output);const outputContext=output.getContext("2d");if(!outputContext)throw new Error("Canvas is unavailable.");
      outputContext.drawImage(working,sx,sy,sw,sh,0,0,sw,sh);
      return {blob:await encode(output,outputType,quality),width:sw,height:sh};
    }
    const outputWidth=Math.max(1,Math.round(mode==="compress"||mode==="convert"?decoded.width:width||decoded.width));
    const outputHeight=Math.max(1,Math.round(mode==="compress"||mode==="convert"?decoded.height:height||decoded.height));
    const output=new OffscreenCanvas(outputWidth,outputHeight);canvases.push(output);const context=output.getContext("2d");if(!context)throw new Error("Canvas is unavailable.");
    if(outputType==="image/jpeg"){context.fillStyle="#fff";context.fillRect(0,0,outputWidth,outputHeight)}
    context.drawImage(decoded,0,0,decoded.width,decoded.height,0,0,outputWidth,outputHeight);
    return {blob:await encode(output,outputType,quality),width:outputWidth,height:outputHeight};
  }finally{for(const canvas of canvases){canvas.width=1;canvas.height=1}decoded.close()}
}

async function compareInWorker(file:File,quality:number,outputTypes:string[]):Promise<ImageFormatCandidate[]>{
  const decoded=await decode(file),canvases:OffscreenCanvas[]=[];
  try{
    const source=new OffscreenCanvas(decoded.width,decoded.height);canvases.push(source);const context=source.getContext("2d");if(!context)throw new Error("Canvas is unavailable.");context.drawImage(decoded,0,0);
    const candidates:ImageFormatCandidate[]=[];
    for(const type of outputTypes){
      const output=new OffscreenCanvas(decoded.width,decoded.height);canvases.push(output);const outputContext=output.getContext("2d");if(!outputContext)continue;
      if(type==="image/jpeg"){outputContext.fillStyle="#fff";outputContext.fillRect(0,0,output.width,output.height)}outputContext.drawImage(source,0,0);
      try{candidates.push({type,blob:await encode(output,type,quality),width:decoded.width,height:decoded.height})}catch{/* Feature detection can still differ inside a worker; omit unsupported formats. */}
    }
    return candidates;
  }finally{for(const canvas of canvases){canvas.width=1;canvas.height=1}decoded.close()}
}

workerScope.onmessage=event=>{
  const request=event.data;
  void (request.kind==="process"?processInWorker(request.options):compareInWorker(request.file,request.quality,request.outputTypes))
    .then(result=>workerScope.postMessage(request.kind==="process"?{id:request.id,ok:true,kind:"process",result:result as ProcessedImage}:{id:request.id,ok:true,kind:"compare",result:result as ImageFormatCandidate[]}))
    .catch((failure:unknown)=>workerScope.postMessage({id:request.id,ok:false,message:failure instanceof Error?failure.message:"The image could not be processed."}));
};
