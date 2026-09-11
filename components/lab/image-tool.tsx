"use client";

import {useEffect,useRef,useState,type CSSProperties} from "react";
import {useRouter} from "next/navigation";
import styles from "./simple-tools.module.css";
import {clearImageHandoff,saveImageHandoff,takeImageHandoff} from "@/lib/lab/image-handoff";
import {revealResultIfNeeded,useMobileResultScroll} from "@/lib/lab/use-mobile-result-scroll";
import {FileDropZone} from "@/components/lab/file-drop-zone";
import {validateImageFile} from "@/lib/lab/file-validation";
import {imageResizePresets} from "@/data/image-resize-presets";
import {compressionBucket,trackProductEvent,type AnalyticsFileFormat} from "@/lib/analytics/product-events";
import {imageToolError} from "@/lib/lab/tool-errors";

export type ImageMode="compress"|"resize"|"convert"|"crop";
type ImageToolName="image-compressor"|"image-resizer"|"image-format-converter"|"image-cropper";
type ResizeMode="pixels"|"percentage";
type CompressionPreset="smaller"|"balanced"|"quality"|"custom";
type CompressionOutcome="smaller"|"tiny"|"original"|"processed";
type Result={url:string;blob:Blob;width:number;height:number;outcome:CompressionOutcome};
type FormatComparison={type:string;size:number};
type BatchResult={file:File;status:"queued"|"processing"|"done"|"error";blob?:Blob;url?:string;name?:string;message?:string};
type ImageLoadState="idle"|"loading"|"ready"|"error";
const labels:Record<ImageMode,string>={compress:"Compress",resize:"Resize",convert:"Convert",crop:"Crop image"};
const routes:Record<ImageMode,string>={compress:"/lab/image-compressor",resize:"/lab/image-resizer",convert:"/lab/image-format-converter",crop:"/lab/image-cropper"};
const analyticsToolNames:Record<ImageMode,ImageToolName>={compress:"image-compressor",resize:"image-resizer",convert:"image-format-converter",crop:"image-cropper"};
const extensions:Record<string,string>={"image/jpeg":"jpg","image/png":"png","image/webp":"webp","image/avif":"avif"};
const prettyBytes=(bytes:number)=>bytes<1024?`${bytes} B`:bytes<1048576?`${(bytes/1024).toFixed(1)} KB`:`${(bytes/1048576).toFixed(1)} MB`;
const analyticsFormat=(mime:string):AnalyticsFileFormat=>mime==="image/jpeg"?"jpeg":mime==="image/png"?"png":mime==="image/webp"?"webp":mime==="image/avif"?"avif":mime==="image/gif"?"gif":mime==="image/bmp"?"bmp":"unknown";
const safeImageBase=(name:string)=>name.replace(/\.[^.]+$/," ").trim().replace(/[\\/:*?"<>|\u0000-\u001f]/g,"-").replace(/\s+/g,"-").slice(0,90)||"image";
const decodeImageFile=async(file:File)=>{const url=URL.createObjectURL(file),image=new window.Image();try{await new Promise<void>((resolve,reject)=>{image.onload=()=>resolve();image.onerror=()=>reject(new Error("IMAGE_LOAD_FAILED"));image.src=url});await image.decode?.();return{url,width:image.naturalWidth,height:image.naturalHeight}}catch{URL.revokeObjectURL(url);throw new Error("IMAGE_LOAD_FAILED")}};

export function ImageTool({mode}:{mode:ImageMode}){
  const resultRef=useRef<HTMLElement>(null);
  const recoveryInputRef=useRef<HTMLInputElement>(null);
  const router=useRouter();
  const [file,setFile]=useState<File|null>(null);
  const [source,setSource]=useState<string|null>(null);
  const [result,setResult]=useState<Result|null>(null);
  const [error,setError]=useState("");
  const [width,setWidth]=useState(0);
  const [height,setHeight]=useState(0);
  const [sourceWidth,setSourceWidth]=useState(0);
  const [sourceHeight,setSourceHeight]=useState(0);
  const [keepProportions,setKeepProportions]=useState(true);
  const [resizeMode,setResizeMode]=useState<ResizeMode>("pixels");
  const [resizePercentage,setResizePercentage]=useState(50);
  const [preventUpscaling,setPreventUpscaling]=useState(true);
  const [quality,setQuality]=useState(82);
  const [compressionPreset,setCompressionPreset]=useState<CompressionPreset>("balanced");
  const [format,setFormat]=useState("image/webp");
  const [avifOutputSupported,setAvifOutputSupported]=useState(false);
  const [formatComparisons,setFormatComparisons]=useState<FormatComparison[]>([]);
  const [ratio,setRatio]=useState("free");
  const [cropX,setCropX]=useState(50);
  const [cropY,setCropY]=useState(50);
  const [cropScale,setCropScale]=useState(85);
  const [freeCropWidth,setFreeCropWidth]=useState(75);
  const [freeCropHeight,setFreeCropHeight]=useState(75);
  const [cropZoom,setCropZoom]=useState(1);
  const [cropRotation,setCropRotation]=useState(0);
  const [busy,setBusy]=useState(false);
  const [handoffBusy,setHandoffBusy]=useState<ImageMode|null>(null);
  const [batch,setBatch]=useState<BatchResult[]>([]);
  const [imageState,setImageState]=useState<ImageLoadState>("idle");
  const batchRef=useRef<BatchResult[]>([]);
  const imageRef=useRef<HTMLImageElement|null>(null);
  const cropCanvasRef=useRef<HTMLDivElement|null>(null);
  const cropDraggingRef=useRef<{pointerId:number;clientX:number;clientY:number;left:number;top:number}|null>(null);
  const cropResizeRef=useRef<{corner:string;anchorX:number;anchorY:number}|null>(null);
  const cropEdgeRef=useRef<{edge:string;left:number;top:number;width:number;height:number}|null>(null);

  useEffect(()=>()=>{if(source)URL.revokeObjectURL(source)},[source]);
  useEffect(()=>()=>{if(result)URL.revokeObjectURL(result.url)},[result]);
  useEffect(()=>{batchRef.current=batch},[batch]);
  useEffect(()=>()=>{for(const item of batchRef.current)if(item.url)URL.revokeObjectURL(item.url)},[]);
  const setSelectedImage=async(next:File)=>{setImageState("loading");setError("");if(source)URL.revokeObjectURL(source);if(result)URL.revokeObjectURL(result.url);setSource(null);setFile(null);setResult(null);try{const decoded=await decodeImageFile(next);setFile(next);setSource(decoded.url);setSourceWidth(decoded.width);setSourceHeight(decoded.height);setWidth(decoded.width);setHeight(decoded.height);setFormatComparisons([]);setFormat("image/webp");setImageState("ready")}catch{setImageState("error");setError("I couldn’t prepare this image. Try JPG, PNG or WebP instead.")}};
  useEffect(()=>{let active=true;void takeImageHandoff().then(next=>{if(active&&next)void setSelectedImage(next)}).catch(()=>{});return()=>{active=false}},[]);
  useEffect(()=>{
    if(mode!=="convert")return;
    const canvas=document.createElement("canvas");canvas.width=1;canvas.height=1;
    const supported=canvas.toDataURL("image/avif").startsWith("data:image/avif");
    const frame=requestAnimationFrame(()=>setAvifOutputSupported(supported));
    return()=>cancelAnimationFrame(frame);
  },[mode]);
  const choose=async(next?:File)=>{
    if(!next)return;
    const validationError=await validateImageFile(next);if(validationError){setError(validationError);return}
    await setSelectedImage(next);
  };
  const chooseFiles=async(files:File[])=>{
    if(mode!=="compress"||files.length===1){setBatch([]);await choose(files[0]);return}
    const selected=files.slice(0,10),accepted:BatchResult[]=[];let rejected=0;
    for(const candidate of selected){const validationError=await validateImageFile(candidate);if(validationError)rejected++;else accepted.push({file:candidate,status:"queued"})}
    if(source)URL.revokeObjectURL(source);if(result)URL.revokeObjectURL(result.url);for(const item of batch)if(item.url)URL.revokeObjectURL(item.url);
    setFile(null);setSource(null);setResult(null);setBatch(accepted);setError(rejected?`${rejected} ${rejected===1?"file was":"files were"} skipped because the format, content or size was not supported.`:files.length>10?"The first 10 images were added. Process another batch when these are finished.":"");
  };
  useEffect(()=>{
    if(mode!=="compress")return;
    const handlePaste=(event:ClipboardEvent)=>{
      const pasted=Array.from(event.clipboardData?.items??[]).find(item=>item.kind==="file"&&item.type.startsWith("image/"))?.getAsFile();
      if(!pasted)return;
      event.preventDefault();
      void validateImageFile(pasted).then(validationError=>{if(validationError){setError(validationError);return}void setSelectedImage(pasted)});
    };
    window.addEventListener("paste",handlePaste);
    return()=>window.removeEventListener("paste",handlePaste);
  },[mode,result,source]);
  // Inspect a small decoded preview, avoiding a full-resolution pixel allocation.
  const markTransparency=(event:React.SyntheticEvent<HTMLImageElement>)=>{
    const image=event.currentTarget;
    delete image.dataset.transparency;
    try{
      const canvas=document.createElement("canvas");
      const scale=Math.min(1,256/Math.max(image.naturalWidth,image.naturalHeight));
      canvas.width=Math.max(1,Math.round(image.naturalWidth*scale));
      canvas.height=Math.max(1,Math.round(image.naturalHeight*scale));
      const context=canvas.getContext("2d",{willReadFrequently:true});
      if(!context)return;
      context.drawImage(image,0,0,canvas.width,canvas.height);
      const pixels=context.getImageData(0,0,canvas.width,canvas.height).data;
      for(let index=3;index<pixels.length;index+=4){
        if(pixels[index]<255){image.dataset.transparency="true";break}
      }
    }catch{/* A preview background must never prevent editing or downloading. */}
  };
  const onLoad=(event:React.SyntheticEvent<HTMLImageElement>)=>{
    markTransparency(event);
    const image=event.currentTarget;imageRef.current=image;setSourceWidth(image.naturalWidth);setSourceHeight(image.naturalHeight);
  };
  const onSourcePreviewError=()=>{
    imageRef.current=null;
    setSource(null);
    setFile(null);
    setSourceWidth(0);
    setSourceHeight(0);
    setWidth(0);
    setHeight(0);
    setImageState("error");
    setError("I couldn’t preview this image. Try JPG, PNG or WebP.");
  };
  const applyPercentage=(percentage:number)=>{
    if(!sourceWidth||!sourceHeight)return;
    setResizeMode("percentage");setResizePercentage(percentage);setKeepProportions(true);
    setWidth(Math.max(1,Math.round(sourceWidth*percentage/100)));
    setHeight(Math.max(1,Math.round(sourceHeight*percentage/100)));
  };
  const applyResizePreset=(preset:(typeof imageResizePresets)[number])=>{
    setResizeMode("pixels");setKeepProportions(false);setWidth(preset.width);setHeight(preset.height);
  };
  const quarterTurn=cropRotation%180!==0;
  const rotatedWidth=quarterTurn?sourceHeight:sourceWidth,rotatedHeight=quarterTurn?sourceWidth:sourceHeight;
  const rotatedSourceRatio=rotatedWidth&&rotatedHeight?rotatedWidth/rotatedHeight:1;
  const [cropRatioWidth,cropRatioHeight]=ratio==="free"?[1,1]:ratio.split(":").map(Number);
  const cropTargetRatio=cropRatioWidth/cropRatioHeight;
  const fittedCropWidth=rotatedSourceRatio>cropTargetRatio?cropTargetRatio/rotatedSourceRatio*100:100;
  const fittedCropHeight=rotatedSourceRatio>cropTargetRatio?100:rotatedSourceRatio/cropTargetRatio*100;
  const cropWidthPercent=ratio==="free"?freeCropWidth:fittedCropWidth*cropScale/100;
  const cropHeightPercent=ratio==="free"?freeCropHeight:fittedCropHeight*cropScale/100;
  const cropLeft=(100-cropWidthPercent)*cropX/100,cropTop=(100-cropHeightPercent)*cropY/100;
  const cropStyle={left:`${cropLeft}%`,top:`${cropTop}%`,width:`${cropWidthPercent}%`,height:`${cropHeightPercent}%`} satisfies CSSProperties;
  const cropCanvasStyle={"--crop-image-ratio":rotatedSourceRatio,aspectRatio:`${rotatedWidth||1}/${rotatedHeight||1}`} satisfies CSSProperties & {"--crop-image-ratio":number};
  const cropImageStyle={position:"absolute",left:"50%",top:"50%",width:`${sourceWidth&&rotatedWidth?sourceWidth/rotatedWidth*100:100}%`,height:`${sourceHeight&&rotatedHeight?sourceHeight/rotatedHeight*100:100}%`,transform:`translate(-50%, -50%) rotate(${cropRotation}deg) scale(${cropZoom})`} satisfies CSSProperties;
  const moveCrop=(event:React.PointerEvent<HTMLDivElement>)=>{
    const canvas=cropCanvasRef.current,drag=cropDraggingRef.current;if(!canvas||!drag||drag.pointerId!==event.pointerId)return;
    const rect=canvas.getBoundingClientRect();
    const availableX=rect.width*(1-cropWidthPercent/100),availableY=rect.height*(1-cropHeightPercent/100);
    if(availableX>0)setCropX(Math.max(0,Math.min(100,(drag.left/100*rect.width+event.clientX-drag.clientX)/availableX*100)));
    if(availableY>0)setCropY(Math.max(0,Math.min(100,(drag.top/100*rect.height+event.clientY-drag.clientY)/availableY*100)));
  };
  const resizeCrop=(clientX:number,clientY:number)=>{
    const drag=cropResizeRef.current,canvas=cropCanvasRef.current;
    if(!drag||!canvas)return;
    const bounds=canvas.getBoundingClientRect();
    if(!bounds.width||!bounds.height)return;
    const west=drag.corner.includes("w"),north=drag.corner.includes("n");
    const maxWidth=west?drag.anchorX:100-drag.anchorX,maxHeight=north?drag.anchorY:100-drag.anchorY;
    const pointerX=(clientX-bounds.left)/bounds.width*100,pointerY=(clientY-bounds.top)/bounds.height*100;
    let nextWidth=Math.max(20,Math.min(maxWidth,west?drag.anchorX-pointerX:pointerX-drag.anchorX));
    let nextHeight=Math.max(20,Math.min(maxHeight,north?drag.anchorY-pointerY:pointerY-drag.anchorY));
    if(ratio!=="free"){
      const scale=Math.min(maxWidth/fittedCropWidth,maxHeight/fittedCropHeight,Math.max(.25,nextWidth/fittedCropWidth,nextHeight/fittedCropHeight));
      nextWidth=fittedCropWidth*scale;nextHeight=fittedCropHeight*scale;setCropScale(scale*100);
    }else{nextWidth=Math.min(maxWidth,nextWidth);nextHeight=Math.min(maxHeight,nextHeight);setFreeCropWidth(nextWidth);setFreeCropHeight(nextHeight)}
    const left=west?drag.anchorX-nextWidth:drag.anchorX,top=north?drag.anchorY-nextHeight:drag.anchorY;
    setCropX(nextWidth>=100?0:left/(100-nextWidth)*100);
    setCropY(nextHeight>=100?0:top/(100-nextHeight)*100);
  };
  const resizeEdge=(clientX:number,clientY:number)=>{
    const drag=cropEdgeRef.current,bounds=cropCanvasRef.current?.getBoundingClientRect();
    if(!drag||!bounds?.width||!bounds.height)return;
    const x=(clientX-bounds.left)/bounds.width*100,y=(clientY-bounds.top)/bounds.height*100;
    let {left,top,width:nextWidth,height:nextHeight}=drag;
    if(drag.edge==="left"){left=Math.max(0,Math.min(drag.left+drag.width-20,x));nextWidth=drag.left+drag.width-left}
    if(drag.edge==="right")nextWidth=Math.max(20,Math.min(100-left,x-left));
    if(drag.edge==="top"){top=Math.max(0,Math.min(drag.top+drag.height-20,y));nextHeight=drag.top+drag.height-top}
    if(drag.edge==="bottom")nextHeight=Math.max(20,Math.min(100-top,y-top));
    setFreeCropWidth(nextWidth);setFreeCropHeight(nextHeight);
    setCropX(nextWidth>=100?0:left/(100-nextWidth)*100);setCropY(nextHeight>=100?0:top/(100-nextHeight)*100);
  };
  const enlargementRequested=mode==="resize"&&Boolean(sourceWidth&&sourceHeight)&&(width>sourceWidth||height>sourceHeight);
  const substantialEnlargement=enlargementRequested&&Math.max(width/sourceWidth,height/sourceHeight)>=1.25;
  const process=async()=>{
    const image=imageRef.current;if(!image||!file)return;
    setBusy(true);setError("");
    try{
      const outputType=mode==="resize"&&file.type in extensions?file.type:mode==="resize"?"image/png":format;
      const resizeScale=mode==="resize"&&preventUpscaling&&enlargementRequested?Math.min(1,sourceWidth/width,sourceHeight/height):1;
      const processWidth=mode==="resize"?Math.max(1,Math.round(width*resizeScale)):width;
      const processHeight=mode==="resize"?Math.max(1,Math.round(height*resizeScale)):height;
      const {processImage,compareImageFormats}=await import("@/lib/lab/process-image");
      let processed:{blob:Blob;width:number;height:number};
      if(mode==="convert"){
        const outputTypes=["image/png","image/jpeg","image/webp",...(avifOutputSupported?["image/avif"]:[])];
        const candidates=await compareImageFormats(file,quality/100,outputTypes);
        setFormatComparisons(candidates.map(candidate=>({type:candidate.type,size:candidate.blob.size})));
        const selected=candidates.find(candidate=>candidate.type===outputType);
        if(!selected)throw new Error("This browser could not create the selected format.");
        processed=selected;
      }else processed=await processImage({file,mode,width:processWidth,height:processHeight,quality:quality/100,outputType,ratio,position:50,cropX:cropLeft,cropY:cropTop,cropWidth:cropWidthPercent,cropHeight:cropHeightPercent,cropZoom,cropRotation});
      const candidate=processed.blob;
      const improvement=mode==="compress"?Math.round((1-candidate.size/file.size)*100):0;
      const outcome:CompressionOutcome=mode!=="compress"?"processed":candidate.size>=file.size?"original":improvement<=3?"tiny":"smaller";
      const blob=outcome==="original"?file.slice(0,file.size,file.type):candidate;
      if(result)URL.revokeObjectURL(result.url);
      setResult({url:URL.createObjectURL(blob),blob,width:processed.width,height:processed.height,outcome});
      const formats={input_format:analyticsFormat(file.type),output_format:analyticsFormat(blob.type)};
      if(mode==="compress")trackProductEvent("image_compressed",{...formats,compression_bucket:compressionBucket(Math.max(0,improvement))});
      else if(mode==="resize")trackProductEvent("image_resized",formats);
      else if(mode==="convert")trackProductEvent("image_converted",formats);
      else trackProductEvent("image_cropped",formats);
    }catch(caught){setError(imageToolError(caught))}finally{setBusy(false)}
  };
  const processBatch=async()=>{
    if(!batch.length)return;setBusy(true);setError("");
    try{
      const {processImage}=await import("@/lib/lab/process-image");
      for(let index=0;index<batch.length;index++){
        setBatch(current=>current.map((item,itemIndex)=>itemIndex===index?{...item,status:"processing"}:item));const current=batch[index];
        try{const processed=await processImage({file:current.file,mode:"compress",width:0,height:0,quality:quality/100,outputType:"image/webp",ratio:"free",position:50}),keepOriginal=processed.blob.size>=current.file.size,blob=keepOriginal?current.file.slice(0,current.file.size,current.file.type):processed.blob,name=keepOriginal?current.file.name:`${safeImageBase(current.file.name)}-compressed.${extensions[blob.type]??"webp"}`,url=URL.createObjectURL(blob);setBatch(items=>items.map((item,itemIndex)=>itemIndex===index?{...item,status:"done",blob,url,name}:item))}
        catch(failure){setBatch(items=>items.map((item,itemIndex)=>itemIndex===index?{...item,status:"error",message:imageToolError(failure)}:item))}
      }
    }catch(failure){setError(imageToolError(failure))}finally{setBusy(false)}
  };
  const resetCrop=()=>{setRatio("free");setCropX(50);setCropY(50);setCropScale(85);setFreeCropWidth(75);setFreeCropHeight(75);setCropZoom(1);setCropRotation(0)};
  const resetEdits=()=>{
    if(busy||!file)return;
    if(result)URL.revokeObjectURL(result.url);
    setResult(null);setFormatComparisons([]);setError("");
    setWidth(sourceWidth);setHeight(sourceHeight);
    setKeepProportions(true);setResizeMode("pixels");setResizePercentage(50);setPreventUpscaling(true);
    setFormat("image/webp");setQuality(82);setCompressionPreset("balanced");
    resetCrop();setFreeCropWidth(100);setFreeCropHeight(100);
    cropDraggingRef.current=null;cropResizeRef.current=null;cropEdgeRef.current=null;
  };
  const clear=()=>{if(source)URL.revokeObjectURL(source);if(result)URL.revokeObjectURL(result.url);for(const item of batch)if(item.url)URL.revokeObjectURL(item.url);void clearImageHandoff().catch(()=>{});setBatch([]);setFile(null);setSource(null);setResult(null);setFormatComparisons([]);setSourceWidth(0);setSourceHeight(0);setWidth(0);setHeight(0);imageRef.current=null;cropDraggingRef.current=null;cropResizeRef.current=null;cropEdgeRef.current=null;setHandoffBusy(null);setKeepProportions(true);setResizeMode("pixels");setResizePercentage(50);setPreventUpscaling(true);setFormat("image/webp");resetCrop();setQuality(82);setCompressionPreset("balanced");setImageState("idle");setError("")};
  const choosePreset=(preset:Exclude<CompressionPreset,"custom">)=>{setCompressionPreset(preset);setQuality(preset==="smaller"?60:preset==="balanced"?82:94)};
  const outputName=result&&file?result.outcome==="original"?file.name:`${safeImageBase(file.name)}-${mode==="resize"?`${result.width}x${result.height}`:mode==="compress"?"compressed":mode==="crop"?"cropped":"converted"}.${extensions[result.blob.type]??"png"}`:"";
  const savedPercent=result&&file?Math.max(0,Math.round((1-result.blob.size/file.size)*100)):0;
  useMobileResultScroll(mode!=="crop"&&Boolean(result),resultRef);
  useEffect(()=>{
    if(mode!=="crop"||!result)return;
    const frame=requestAnimationFrame(()=>{
      const region=resultRef.current;
      if(!region)return;
      region.focus({preventScroll:true});
      revealResultIfNeeded(region);
    });
    return()=>cancelAnimationFrame(frame);
  },[mode,result]);
  const download=()=>{if(!result||!file)return;trackProductEvent("image_downloaded",{tool_name:analyticsToolNames[mode],input_format:analyticsFormat(file.type),output_format:analyticsFormat(result.blob.type)});const anchor=document.createElement("a");anchor.href=result.url;anchor.download=outputName;anchor.click()};
  const continueWith=async(nextMode:ImageMode)=>{if(!result)return;trackProductEvent("image_handoff_clicked",{from_tool:analyticsToolNames[mode],to_tool:analyticsToolNames[nextMode],output_format:analyticsFormat(result.blob.type)});setHandoffBusy(nextMode);setError("");try{await saveImageHandoff(result.blob,outputName);router.push(routes[nextMode])}catch{setError("This browser could not pass the image to the next tool. Download it instead.");setHandoffBusy(null)}};

  const batchOriginalSize=batch.reduce((total,item)=>total+item.file.size,0),batchOutputSize=batch.reduce((total,item)=>total+(item.blob?.size??0),0),batchComplete=batch.length>0&&batch.every(item=>item.status==="done"||item.status==="error");
  const downloadBatchItem=(item:BatchResult)=>{if(!item.url||!item.name)return;const anchor=document.createElement("a");anchor.href=item.url;anchor.download=item.name;anchor.click()};
  const uploadTitle=imageState==="error"?"Choose another image":"Drop an image";

  return <div className={`${styles.workspace} ${mode==="crop"?styles.cropTool:mode==="compress"?styles.compressorTool:mode==="convert"?styles.converterTool:""}`} data-tool-processing={busy||undefined} aria-busy={busy}>
    <p className={styles.privacy}>Your image is processed locally in this browser and is not uploaded.</p>
    {mode!=="compress"&&<p className={styles.metadataNote}>Processed exports are newly encoded and may not keep camera, location or other embedded metadata. This can also reduce unintended personal information in the downloaded file.</p>}
    <div className={styles.grid}>
      <section className={styles.panel}>{mode!=="compress"&&<h2>Choose an image</h2>}
        {mode==="convert"&&source?<button type="button" className={`${styles.button} ${styles.startOver}`} data-quiet disabled={busy} onClick={clear}>Start over</button>:<><FileDropZone accept="image/png,image/jpeg,image/webp,image/gif,image/bmp,image/avif" title={uploadTitle} restrictions={`PNG, JPEG, WebP, GIF, BMP or AVIF · maximum 25 MB${mode==="compress"?" each · up to 10 images":""}`} multiple={mode==="compress"} disabled={busy} onFiles={files=>void chooseFiles(files)}/></>}
        {error&&<div className={styles.errorRecovery}><p className={styles.status} data-error role="alert">{error}</p><input ref={recoveryInputRef} type="file" accept="image/png,image/jpeg,image/webp,image/gif,image/bmp,image/avif" hidden onChange={event=>{const next=event.currentTarget.files?.[0];event.currentTarget.value="";if(next)void chooseFiles([next])}}/><button type="button" className={styles.button} disabled={busy} onClick={()=>recoveryInputRef.current?.click()}>Choose another image</button></div>}
        {mode==="compress"&&!source&&!batch.length&&<p className={styles.inputHint}>You can also paste an image or choose several files.</p>}
        {mode==="compress"&&batch.length>0&&<section className={styles.batchPanel} aria-labelledby="batch-images-heading"><h3 id="batch-images-heading">{batch.length} images ready</h3><p>Balanced WebP compression is applied locally. Each original is kept when it is already smaller.</p><ol>{batch.map((item,index)=><li key={`${item.file.name}-${item.file.lastModified}-${index}`}><div><strong>{item.file.name}</strong><small>{prettyBytes(item.file.size)}</small></div><span className={styles.batchStatus}>{item.status==="queued"?"Waiting":item.status==="processing"?"Processing…":item.status==="error"?item.message:"Done"}</span>{item.status==="done"&&<><small>{prettyBytes(item.blob?.size??0)}</small><button type="button" className={styles.button} data-quiet onClick={()=>downloadBatchItem(item)}>Download</button></>}</li>)}</ol><dl className={styles.batchTotals}><div><dt>Total original</dt><dd>{prettyBytes(batchOriginalSize)}</dd></div><div><dt>Total output</dt><dd>{batchComplete?prettyBytes(batchOutputSize):"—"}</dd></div></dl><div className={styles.actions}><button type="button" className={styles.button} onClick={()=>void processBatch()} disabled={busy||batchComplete}>{busy?"Processing…":batchComplete?"Batch complete":"Compress images"}</button><button type="button" className={`${styles.button} ${styles.startOver}`} data-quiet onClick={clear} disabled={busy}>Start over</button></div><p className={styles.status} role="status" aria-live="polite">{busy?`${batch.filter(item=>item.status==="done"||item.status==="error").length} of ${batch.length} finished.`:batchComplete?"Batch processing complete. Download each result below.":""}</p></section>}
        {source&&<>{mode!=="crop"&&mode!=="resize"&&<div className={styles.preview}><img src={source} alt="Selected image preview" width={sourceWidth||1} height={sourceHeight||1} onLoad={onLoad} onError={onSourcePreviewError}/></div>}{mode!=="resize"&&<p>{file?.name}</p>}{mode==="compress"&&file&&<><dl className={styles.originalSummary}><div><dt>Original</dt><dd>{prettyBytes(file.size)}</dd></div><div><dt>Dimensions</dt><dd>{width} × {height}</dd></div><div><dt>Type</dt><dd>{(extensions[file.type]??file.type.replace("image/","")).toUpperCase()}</dd></div></dl><fieldset className={styles.presets}><legend>Choose the result you prefer</legend><label><input type="radio" name="compression-preset" checked={compressionPreset==="smaller"} onChange={()=>choosePreset("smaller")}/><span>Smaller file</span></label><label><input type="radio" name="compression-preset" checked={compressionPreset==="balanced"} onChange={()=>choosePreset("balanced")}/><span>Balanced <small>Recommended</small></span></label><label><input type="radio" name="compression-preset" checked={compressionPreset==="quality"} onChange={()=>choosePreset("quality")}/><span>Keep quality</span></label></fieldset></>}
{mode==="resize"&&<section className={styles.resizeControls} aria-labelledby="custom-image-size"><figure className={styles.resizeSourcePreview}><img src={source} alt="Original image preview" width={sourceWidth||1} height={sourceHeight||1} onLoad={onLoad} onError={onSourcePreviewError}/><figcaption>{file?.name}</figcaption></figure><div className={styles.currentDimensions}><span>Current</span><strong>{sourceWidth} × {sourceHeight}</strong></div><h3 id="custom-image-size">New size</h3>{resizeMode==="percentage"?<div className={styles.field}><label htmlFor="resize-percentage">New size · {resizePercentage}%</label><input id="resize-percentage" type="range" min="10" max="200" step="5" value={resizePercentage} onChange={event=>applyPercentage(Number(event.target.value))}/><small>{width} × {height} px</small></div>:<><div className={styles.row}><div className={styles.field}><label htmlFor="image-width">Width</label><input id="image-width" type="number" min="1" max="12000" value={width||""} onChange={event=>{const next=Number(event.target.value);setWidth(next);if(keepProportions&&sourceWidth)setHeight(Math.round(next*sourceHeight/sourceWidth))}}/></div><div className={styles.field}><label htmlFor="image-height">Height</label><input id="image-height" type="number" min="1" max="12000" value={keepProportions?"":height||""} placeholder={keepProportions?`Auto (${height}px)`:"Height"} readOnly={keepProportions} onChange={event=>setHeight(Number(event.target.value))}/></div></div><label className={styles.check}><input type="checkbox" checked={keepProportions} onChange={event=>{const checked=event.target.checked;setKeepProportions(checked);if(checked&&sourceWidth)setHeight(Math.round(width*sourceHeight/sourceWidth))}}/> Keep proportions</label></>}<details className={styles.advanced}><summary>More options</summary><fieldset className={styles.modeSwitch}><legend>Resize by</legend><label><input type="radio" name="resize-mode" checked={resizeMode==="pixels"} onChange={()=>setResizeMode("pixels")}/> Pixels</label><label><input type="radio" name="resize-mode" checked={resizeMode==="percentage"} onChange={()=>applyPercentage(resizePercentage)}/> Percentage</label></fieldset><div className={styles.quickSizes} aria-label="Quick resize choices"><button type="button" onClick={()=>applyPercentage(50)}>50% smaller</button><button type="button" onClick={()=>applyPercentage(75)}>25% smaller</button>{imageResizePresets.map(preset=><button type="button" key={preset.id} onClick={()=>applyResizePreset(preset)}>{preset.label}<small>{preset.width} × {preset.height}</small></button>)}</div><p className={styles.inputHint}>Percentage choices keep the original proportions. Fixed dimension presets are general-purpose sizes, not official platform requirements, and may change the image shape. Use the Crop tool when exact framing matters.</p></details></section>}
{mode==="crop"&&<section className={styles.cropWorkspace} aria-labelledby="visual-crop-heading"><h3 id="visual-crop-heading">Adjust the crop</h3><p id="crop-keyboard-help">Drag inside to move. Drag a corner to resize. Free crops also have edge handles. Use arrow keys on the focused crop to move it, or on a handle to resize. Hold Shift for larger steps.</p><div className={styles.cropCanvas} ref={cropCanvasRef} style={cropCanvasStyle}><img src={source} alt="Image with adjustable crop area" width={sourceWidth||1} height={sourceHeight||1} style={cropImageStyle} onLoad={onLoad} onError={onSourcePreviewError}/><div className={styles.cropFrame} style={cropStyle} role="slider" tabIndex={0} aria-label="Crop area position" aria-describedby="crop-keyboard-help" aria-valuemin={0} aria-valuemax={100} aria-valuetext={`Horizontal ${Math.round(cropX)}%, vertical ${Math.round(cropY)}%`} aria-valuenow={Math.round((cropX+cropY)/2)} onPointerDown={event=>{if(event.button!==0)return;event.preventDefault();cropDraggingRef.current={pointerId:event.pointerId,clientX:event.clientX,clientY:event.clientY,left:cropLeft,top:cropTop};event.currentTarget.setPointerCapture(event.pointerId)}} onPointerMove={event=>{if(cropDraggingRef.current)moveCrop(event)}} onPointerUp={event=>{cropDraggingRef.current=null;if(event.currentTarget.hasPointerCapture(event.pointerId))event.currentTarget.releasePointerCapture(event.pointerId)}} onPointerCancel={()=>{cropDraggingRef.current=null}} onLostPointerCapture={()=>{cropDraggingRef.current=null}} onKeyDown={event=>{const amount=event.shiftKey?10:2;if(event.key==="ArrowLeft")setCropX(current=>Math.max(0,current-amount));else if(event.key==="ArrowRight")setCropX(current=>Math.min(100,current+amount));else if(event.key==="ArrowUp")setCropY(current=>Math.max(0,current-amount));else if(event.key==="ArrowDown")setCropY(current=>Math.min(100,current+amount));else return;event.preventDefault()}}><span>Drag to position</span></div>{(["nw","ne","sw","se"] as const).map(corner=><button key={corner} type="button" className={styles.cropHandle} data-corner={corner} style={{left:`${cropLeft+(corner.includes("w")?0:cropWidthPercent)}%`,top:`${cropTop+(corner.includes("n")?0:cropHeightPercent)}%`}} aria-label={`Resize crop from ${corner.includes("n")?"top":"bottom"} ${corner.includes("w")?"left":"right"} corner`} onPointerDown={event=>{event.preventDefault();cropResizeRef.current={corner,anchorX:cropLeft+(corner.includes("w")?cropWidthPercent:0),anchorY:cropTop+(corner.includes("n")?cropHeightPercent:0)};event.currentTarget.setPointerCapture(event.pointerId)}} onPointerMove={event=>{if(event.currentTarget.hasPointerCapture(event.pointerId))resizeCrop(event.clientX,event.clientY)}} onPointerUp={event=>{cropResizeRef.current=null;if(event.currentTarget.hasPointerCapture(event.pointerId))event.currentTarget.releasePointerCapture(event.pointerId)}} onPointerCancel={()=>{cropResizeRef.current=null}} onLostPointerCapture={()=>{cropResizeRef.current=null}} onKeyDown={event=>{if(!["ArrowLeft","ArrowRight","ArrowUp","ArrowDown"].includes(event.key))return;event.preventDefault();const bounds=cropCanvasRef.current?.getBoundingClientRect();if(!bounds)return;cropResizeRef.current={corner,anchorX:cropLeft+(corner.includes("w")?cropWidthPercent:0),anchorY:cropTop+(corner.includes("n")?cropHeightPercent:0)};const step=event.shiftKey?5:1;resizeCrop(bounds.left+(cropLeft+(corner.includes("w")?0:cropWidthPercent)+(event.key==="ArrowLeft"?-step:event.key==="ArrowRight"?step:0))/100*bounds.width,bounds.top+(cropTop+(corner.includes("n")?0:cropHeightPercent)+(event.key==="ArrowUp"?-step:event.key==="ArrowDown"?step:0))/100*bounds.height);cropResizeRef.current=null}}/>) }{ratio==="free"&&(["top","right","bottom","left"] as const).map(edge=><button key={edge} type="button" className={styles.cropHandle} data-edge={edge} style={{left:`${cropLeft+cropWidthPercent*(edge==="left"?0:edge==="right"?1:.5)}%`,top:`${cropTop+cropHeightPercent*(edge==="top"?0:edge==="bottom"?1:.5)}%`}} aria-label={`Resize crop ${edge} edge`} onPointerDown={event=>{event.preventDefault();cropEdgeRef.current={edge,left:cropLeft,top:cropTop,width:cropWidthPercent,height:cropHeightPercent};event.currentTarget.setPointerCapture(event.pointerId)}} onPointerMove={event=>{if(event.currentTarget.hasPointerCapture(event.pointerId))resizeEdge(event.clientX,event.clientY)}} onPointerUp={event=>{cropEdgeRef.current=null;if(event.currentTarget.hasPointerCapture(event.pointerId))event.currentTarget.releasePointerCapture(event.pointerId)}} onPointerCancel={()=>{cropEdgeRef.current=null}} onLostPointerCapture={()=>{cropEdgeRef.current=null}} onKeyDown={event=>{const horizontal=edge==="left"||edge==="right";if(!(horizontal?["ArrowLeft","ArrowRight"]:["ArrowUp","ArrowDown"]).includes(event.key))return;event.preventDefault();const bounds=cropCanvasRef.current?.getBoundingClientRect();if(!bounds)return;cropEdgeRef.current={edge,left:cropLeft,top:cropTop,width:cropWidthPercent,height:cropHeightPercent};const step=(event.shiftKey?5:1)*(event.key==="ArrowLeft"||event.key==="ArrowUp"?-1:1);resizeEdge(bounds.left+(cropLeft+(edge==="right"?cropWidthPercent:0)+(horizontal?step:0))/100*bounds.width,bounds.top+(cropTop+(edge==="bottom"?cropHeightPercent:0)+(horizontal?0:step))/100*bounds.height);cropEdgeRef.current=null}}/>)}</div></section>}
          {mode==="convert"&&file&&<section className={styles.convertIntent} aria-labelledby="convert-intent-heading"><p>{file.type.replace("image/","").toUpperCase()}<br/>{prettyBytes(file.size)}</p><h3 id="convert-intent-heading">Convert to</h3><div className={styles.intentChoices}>{([["image/webp","WebP"],["image/jpeg","JPEG"],["image/png","PNG"]] as const).map(([value,label])=><button type="button" key={value} aria-pressed={format===value} disabled={busy} onClick={()=>setFormat(value)}>{label}{format===value?" ✓":""}</button>)}</div><p className={styles.inputHint}>{format==="image/jpeg"?"JPEG suits photos. Transparent areas become a solid background.":format==="image/png"?"PNG keeps transparency without lossy compression. Files can be larger.":"Recommended: WebP for a smaller web image. Actual size depends on the image."}</p><div className={styles.actions}><button type="button" className={styles.button} onClick={process} disabled={busy}>{busy?"Processing…":"Convert"}</button><button type="button" className={styles.button} data-quiet onClick={resetEdits} disabled={busy}>Reset</button></div></section>}
          {mode==="resize"&&<div className={styles.upscaleControl}><label className={styles.check}><input type="checkbox" checked={preventUpscaling} onChange={event=>setPreventUpscaling(event.target.checked)}/> Do not enlarge smaller images</label>{enlargementRequested&&<p className={styles.upscaleWarning} role="status">{preventUpscaling?"The requested size is larger than the original. The output will be limited to the available image size.":substantialEnlargement?"This will make the image larger, but it cannot create missing detail. The result may look softer.":"Enlarging may make the result look softer because resizing cannot create missing detail."}</p>}</div>}
{mode==="crop"&&<section className={styles.cropControls} aria-label="Crop controls"><fieldset className={styles.cropPresets}><legend>Crop shape</legend>{([['free','Free'],['1:1','1:1'],['16:9','16:9'],['4:5','4:5'],['9:16','9:16']] as const).map(([value,label])=><label key={value}><input type="radio" name="crop-shape" checked={ratio===value} onChange={()=>{setRatio(value);setCropX(50);setCropY(50)}}/> {label}</label>)}</fieldset><div className={styles.field}><label htmlFor="crop-zoom">Zoom · {cropZoom.toFixed(1)}×</label><input id="crop-zoom" type="range" min="1" max="3" step="0.1" value={cropZoom} onChange={event=>setCropZoom(Number(event.target.value))}/></div><div className={styles.actions}><button type="button" className={styles.button} data-quiet onClick={()=>setCropRotation(current=>(current+90)%360)} aria-label="Rotate image 90 degrees">Rotate</button><button type="button" className={styles.button} data-quiet onClick={resetEdits} disabled={busy}>Reset</button></div><details className={styles.advanced}><summary>Fine tune</summary><div><fieldset className={styles.numericCrop}><legend>Crop position</legend><p>Use these fields instead of dragging, or move the focused crop area with the arrow keys. Hold Shift for larger moves.</p><div className={styles.row}><div className={styles.field}><label htmlFor="crop-position-x">Horizontal position (%)</label><input id="crop-position-x" type="number" min="0" max="100" step="1" value={Math.round(cropX)} onChange={event=>setCropX(Math.max(0,Math.min(100,Number(event.target.value)||0)))}/></div><div className={styles.field}><label htmlFor="crop-position-y">Vertical position (%)</label><input id="crop-position-y" type="number" min="0" max="100" step="1" value={Math.round(cropY)} onChange={event=>setCropY(Math.max(0,Math.min(100,Number(event.target.value)||0)))}/></div></div></fieldset>{ratio==="free"?<div className={styles.row}><div className={styles.field}><label htmlFor="crop-width">Selection width · {Math.round(freeCropWidth)}%</label><input id="crop-width" type="range" min="20" max="100" value={freeCropWidth} onChange={event=>setFreeCropWidth(Number(event.target.value))}/></div><div className={styles.field}><label htmlFor="crop-height">Selection height · {Math.round(freeCropHeight)}%</label><input id="crop-height" type="range" min="20" max="100" value={freeCropHeight} onChange={event=>setFreeCropHeight(Number(event.target.value))}/></div></div>:<div className={styles.field}><label htmlFor="crop-size">Selection size · {Math.round(cropScale)}%</label><input id="crop-size" type="range" min="25" max="100" value={cropScale} onChange={event=>setCropScale(Number(event.target.value))}/></div>}</div></details></section>}
          {mode!=="resize"&&<details className={styles.advanced} ><summary>More options</summary><div><div className={styles.field}><label htmlFor="image-format">Output format</label><select id="image-format" value={format} onChange={event=>setFormat(event.target.value)}><option value="image/webp">WebP</option><option value="image/jpeg">JPEG</option><option value="image/png">PNG</option>{avifOutputSupported&&<option value="image/avif">AVIF</option>}</select>{mode==="convert"&&<small>JPEG, PNG and WebP are available in supported modern browsers. AVIF appears only when this browser can create it.</small>}</div>{format!=="image/png"&&<div className={styles.field}><label htmlFor="image-quality">Quality · {quality}%</label><input id="image-quality" type="range" min="30" max="100" value={quality} onChange={event=>{setQuality(Number(event.target.value));setCompressionPreset("custom")}}/></div>}</div></details>}

          {mode!=="convert"&&<div className={styles.actions}><button type="button" className={styles.button} onClick={process} disabled={busy}>{busy?"Processing…":labels[mode]}</button>{mode!=="crop"&&<button type="button" className={styles.button} data-quiet onClick={resetEdits} disabled={busy}>Reset</button>}<button type="button" className={`${styles.button} ${styles.startOver}`} data-quiet onClick={clear} disabled={busy}>Start over</button></div>}<p className={styles.status} role="status" aria-live="polite">{busy?"Processing…":""}</p></>}
      </section>
<section ref={resultRef} className={styles.panel} tabIndex={-1} aria-labelledby={`${mode}-result-heading`} style={{scrollMarginTop:"var(--header-scroll-offset)"}} id={`${mode}-image-result`}><h2 id={`${mode}-result-heading`}>Result</h2>{result&&file?<>
<div className={styles.resultHero} role="status"><span className={styles.resultLabel}><span aria-hidden="true">✓ </span>{result.outcome==="original"?"Original kept":result.outcome==="tiny"?"Small saving":"Ready"}</span><strong className={styles.resultName}>{outputName}</strong>{mode==="convert"?<dl className={styles.conversionSummary}><div><dt>{file.type==="image/webp"?"WebP":file.type.replace("image/","").toUpperCase()}</dt><dd>{prettyBytes(file.size)}</dd></div><div><dt>{result.blob.type==="image/webp"?"WebP":result.blob.type.replace("image/","").toUpperCase()}</dt><dd>{prettyBytes(result.blob.size)}</dd></div></dl>:<p>{result.width} × {result.height}<br/>{prettyBytes(result.blob.size)}</p>}{mode==="compress"&&<p>{result.outcome==="original"?"No smaller version was created.":result.outcome==="tiny"?`The new version only saves ${savedPercent}%. Keeping the original may be better.`:`${savedPercent}% smaller`}</p>}</div>
        {mode!=="convert"&&<div className={styles.preview}><img src={result.url} onLoad={markTransparency} alt="Processed image preview" width={result.width} height={result.height}/></div>}
        <div className={`${styles.actions} ${styles.downloadAction}`}><button type="button" className={styles.button} onClick={download} aria-label={result.outcome==="original"?"Download original image":mode==="compress"?"Download compressed image":mode==="resize"?"Download resized image":mode==="crop"?"Download cropped image":`Download ${outputName}`}>{result.outcome==="original"?"Keep original":mode==="convert"?`Download ${result.blob.type==="image/webp"?"WebP":result.blob.type.replace("image/","").toUpperCase()}`:"Download"}</button></div>
        <nav className={`${styles.resultLinks} ${styles.imageContinue}`} aria-label="Use this image in another tool"><span>Continue with:</span>{(["compress","resize","crop","convert"] as const).filter(next=>next!==mode).map(next=><button type="button" key={next} aria-label={`${next[0].toUpperCase()}${next.slice(1)} this image`} disabled={handoffBusy!==null} onClick={()=>void continueWith(next)}>{handoffBusy===next?"Opening…":`${next[0].toUpperCase()}${next.slice(1)}`}</button>)}</nav>
        {mode==="convert"?<details className={styles.advanced}><summary>Preview converted image</summary><div className={styles.preview}><img src={result.url} onLoad={markTransparency} alt="Converted image preview" width={result.width} height={result.height}/></div><p>{result.width} × {result.height}</p></details>:mode==="resize"?<dl className={styles.resizeResult}><div><dt>Before</dt><dd>{sourceWidth} × {sourceHeight}</dd></div><div><dt>After</dt><dd>{result.width} × {result.height}</dd></div><div><dt>File size</dt><dd>{prettyBytes(file.size)} <span aria-hidden="true">→</span> {prettyBytes(result.blob.size)}</dd></div></dl>:mode==="crop"?<dl className={styles.cropResult}><div><dt>Original</dt><dd>{sourceWidth} × {sourceHeight}</dd></div><div><dt>Crop</dt><dd>{result.width} × {result.height}</dd></div></dl>:<dl className={styles.stats}><div><dt>Filename</dt><dd>{outputName}</dd></div><div><dt>Format</dt><dd>{(extensions[result.blob.type]??"image").toUpperCase()}</dd></div><div><dt>Dimensions</dt><dd>{result.width} × {result.height}</dd></div><div><dt>Size</dt><dd>{prettyBytes(result.blob.size)}</dd></div><div><dt>Saved</dt><dd>{savedPercent}%</dd></div></dl>}
        {mode==="convert"&&formatComparisons.length>0&&<details className={styles.formatComparison} aria-labelledby="format-comparison-heading"><summary id="format-comparison-heading">Compare other formats</summary><p>Generated in this browser from the current image and quality setting.</p><dl>{formatComparisons.map(candidate=>{const smallest=Math.min(...formatComparisons.map(item=>item.size))===candidate.size;return <div key={candidate.type}><dt>{(extensions[candidate.type]??candidate.type).toUpperCase()}</dt><dd>{prettyBytes(candidate.size)} {smallest&&<strong>Smallest</strong>}</dd></div>})}</dl></details>}
      </>:<p>Your processed image and its real file size will appear here.</p>}<p className={styles.status} data-error={Boolean(error)} role="status">{error}</p></section>
    </div>
    {mode==="compress"&&<p className={styles.metadataNote}>Exported images may not retain camera or location metadata.</p>}
    {mode==="compress"&&source&&result&&result.outcome!=="original"&&<section className={styles.comparison} aria-labelledby="compression-comparison"><h2 id="compression-comparison">Before and after</h2><p>Compare the complete images at the same fitted size. Neither preview is enlarged.</p><div><figure><figcaption>Original</figcaption><img src={source} onLoad={markTransparency} alt="Original image before compression" width={width||result.width} height={height||result.height}/></figure><figure><figcaption>Compressed</figcaption><img src={result.url} onLoad={markTransparency} alt="Image after compression" width={result.width} height={result.height}/></figure></div></section>}
  </div>;
}
