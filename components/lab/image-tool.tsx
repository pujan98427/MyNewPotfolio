"use client";

import {useEffect,useRef,useState,type CSSProperties} from "react";
import Image from "next/image";
import {useRouter} from "next/navigation";
import styles from "./simple-tools.module.css";
import {saveImageHandoff,takeImageHandoff} from "@/lib/lab/image-handoff";
import {useMobileResultScroll} from "@/lib/lab/use-mobile-result-scroll";
import {FileDropZone} from "@/components/lab/file-drop-zone";
import {validateImageFile} from "@/lib/lab/file-validation";
import {imageResizePresets} from "@/data/image-resize-presets";

export type ImageMode="compress"|"resize"|"convert"|"crop";
type ResizeMode="pixels"|"percentage";
type ConvertIntent="website"|"smaller"|"transparency"|"manual";
type CompressionPreset="smaller"|"balanced"|"quality"|"custom";
type CompressionOutcome="smaller"|"tiny"|"original"|"processed";
type Result={url:string;blob:Blob;width:number;height:number;outcome:CompressionOutcome};
type FormatComparison={type:string;size:number};
const labels:Record<ImageMode,string>={compress:"Compress image",resize:"Resize image",convert:"Convert image",crop:"Crop image"};
const routes:Record<ImageMode,string>={compress:"/lab/image-compressor",resize:"/lab/image-resizer",convert:"/lab/image-format-converter",crop:"/lab/image-cropper"};
const extensions:Record<string,string>={"image/jpeg":"jpg","image/png":"png","image/webp":"webp","image/avif":"avif"};
const prettyBytes=(bytes:number)=>bytes<1024?`${bytes} B`:bytes<1048576?`${(bytes/1024).toFixed(1)} KB`:`${(bytes/1048576).toFixed(1)} MB`;

export function ImageTool({mode}:{mode:ImageMode}){
  const resultRef=useRef<HTMLElement>(null);
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
  const [convertIntent,setConvertIntent]=useState<ConvertIntent>("website");
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
  const imageRef=useRef<HTMLImageElement|null>(null);
  const cropCanvasRef=useRef<HTMLDivElement|null>(null);
  const cropDraggingRef=useRef(false);

  useEffect(()=>()=>{if(source)URL.revokeObjectURL(source)},[source]);
  useEffect(()=>()=>{if(result)URL.revokeObjectURL(result.url)},[result]);
  useEffect(()=>{let active=true;void takeImageHandoff().then(next=>{if(!active||!next)return;setFile(next);setSource(URL.createObjectURL(next));setResult(null);setError("")}).catch(()=>{});return()=>{active=false}},[]);
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
    if(source)URL.revokeObjectURL(source);
    if(result)URL.revokeObjectURL(result.url);
    setFile(next);setSource(URL.createObjectURL(next));setResult(null);setFormatComparisons([]);setConvertIntent("website");setFormat("image/webp");setError("");
  };
  useEffect(()=>{
    if(mode!=="compress")return;
    const handlePaste=(event:ClipboardEvent)=>{
      const pasted=Array.from(event.clipboardData?.items??[]).find(item=>item.kind==="file"&&item.type.startsWith("image/"))?.getAsFile();
      if(!pasted)return;
      event.preventDefault();
      void validateImageFile(pasted).then(validationError=>{if(validationError){setError(validationError);return}if(source)URL.revokeObjectURL(source);if(result)URL.revokeObjectURL(result.url);setFile(pasted);setSource(URL.createObjectURL(pasted));setResult(null);setError("")});
    };
    window.addEventListener("paste",handlePaste);
    return()=>window.removeEventListener("paste",handlePaste);
  },[mode,result,source]);
  const onLoad=(event:React.SyntheticEvent<HTMLImageElement>)=>{
    const image=event.currentTarget;imageRef.current=image;setSourceWidth(image.naturalWidth);setSourceHeight(image.naturalHeight);setWidth(image.naturalWidth);setHeight(image.naturalHeight);
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
  const chooseConvertIntent=(intent:ConvertIntent)=>{
    setConvertIntent(intent);
    if(intent==="website"||intent==="smaller")setFormat("image/webp");
    if(intent==="transparency")setFormat("image/png");
  };
  const formatRecommendation=convertIntent==="transparency"?{name:"PNG",reason:"Keeps transparent areas and is widely supported."}:{name:"WebP",reason:convertIntent==="smaller"?"Often creates a smaller file than PNG or JPEG while keeping useful visual quality.":"Good for websites and usually smaller than PNG or JPEG."};
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
  const cropCanvasStyle={aspectRatio:`${rotatedWidth||1}/${rotatedHeight||1}`} satisfies CSSProperties;
  const cropImageStyle={position:"absolute",left:"50%",top:"50%",width:`${sourceWidth&&rotatedWidth?sourceWidth/rotatedWidth*100:100}%`,height:`${sourceHeight&&rotatedHeight?sourceHeight/rotatedHeight*100:100}%`,transform:`translate(-50%, -50%) rotate(${cropRotation}deg) scale(${cropZoom})`} satisfies CSSProperties;
  const moveCrop=(event:React.PointerEvent<HTMLDivElement>)=>{
    const canvas=cropCanvasRef.current;if(!canvas)return;
    const rect=canvas.getBoundingClientRect();
    const availableX=rect.width*(1-cropWidthPercent/100),availableY=rect.height*(1-cropHeightPercent/100);
    const frameWidth=rect.width*cropWidthPercent/100,frameHeight=rect.height*cropHeightPercent/100;
    if(availableX>0)setCropX(Math.max(0,Math.min(100,(event.clientX-rect.left-frameWidth/2)/availableX*100)));
    if(availableY>0)setCropY(Math.max(0,Math.min(100,(event.clientY-rect.top-frameHeight/2)/availableY*100)));
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
      const blob=outcome==="original"?file:candidate;
      if(result)URL.revokeObjectURL(result.url);
      setResult({url:URL.createObjectURL(blob),blob,width:processed.width,height:processed.height,outcome});
    }catch(caught){setError(caught instanceof Error?caught.message:"The image could not be processed.")}finally{setBusy(false)}
  };
  const resetCrop=()=>{setRatio("free");setCropX(50);setCropY(50);setCropScale(85);setFreeCropWidth(75);setFreeCropHeight(75);setCropZoom(1);setCropRotation(0)};
  const clear=()=>{if(source)URL.revokeObjectURL(source);if(result)URL.revokeObjectURL(result.url);setFile(null);setSource(null);setResult(null);setFormatComparisons([]);setSourceWidth(0);setSourceHeight(0);setKeepProportions(true);setResizeMode("pixels");setResizePercentage(50);setPreventUpscaling(true);setConvertIntent("website");setFormat("image/webp");resetCrop();setQuality(82);setCompressionPreset("balanced");setError("")};
  const choosePreset=(preset:Exclude<CompressionPreset,"custom">)=>{setCompressionPreset(preset);setQuality(preset==="smaller"?60:preset==="balanced"?82:94)};
  const outputName=result&&file?result.outcome==="original"?file.name:`${file.name.replace(/\.[^.]+$/,"")}-${mode}.${extensions[result.blob.type]??"png"}`:"";
  const savedPercent=result&&file?Math.max(0,Math.round((1-result.blob.size/file.size)*100)):0;
  useMobileResultScroll(Boolean(result),resultRef);
  const download=()=>{if(!result||!file)return;const anchor=document.createElement("a");anchor.href=result.url;anchor.download=outputName;anchor.click()};
  const continueWith=async(nextMode:ImageMode)=>{if(!result)return;setHandoffBusy(nextMode);setError("");try{await saveImageHandoff(result.blob,outputName);router.push(routes[nextMode])}catch{setError("This browser could not pass the image to the next tool. Download it instead.");setHandoffBusy(null)}};

  return <div className={styles.workspace}>
    <p className={styles.privacy}>Your image is processed locally in this browser and is not uploaded.</p>
    <p className={styles.metadataNote}>Processed exports are newly encoded and may not keep camera, location or other embedded metadata. This can also reduce unintended personal information in the downloaded file.</p>
    <div className={styles.grid}>
      <section className={styles.panel}><h2>Choose an image</h2>
        <FileDropZone accept="image/png,image/jpeg,image/webp,image/gif,image/bmp,image/avif" title="Drop an image" restrictions="PNG, JPEG, WebP, GIF, BMP or AVIF · maximum 25 MB" onFiles={files=>void choose(files[0])}/>
        {mode==="compress"&&!source&&<p className={styles.inputHint}>You can also paste an image from your clipboard.</p>}
        {source&&<><div className={styles.preview}><Image unoptimized src={source} alt="Selected image preview" width={width||1} height={height||1} onLoad={onLoad}/></div><p>{file?.name}</p>{mode==="compress"&&file&&<><dl className={styles.originalSummary}><div><dt>Original</dt><dd>{prettyBytes(file.size)}</dd></div><div><dt>Dimensions</dt><dd>{width} × {height}</dd></div><div><dt>Type</dt><dd>{(extensions[file.type]??file.type.replace("image/","")).toUpperCase()}</dd></div></dl><fieldset className={styles.presets}><legend>Choose the result you prefer</legend><label><input type="radio" name="compression-preset" checked={compressionPreset==="smaller"} onChange={()=>choosePreset("smaller")}/><span>Smaller file</span></label><label><input type="radio" name="compression-preset" checked={compressionPreset==="balanced"} onChange={()=>choosePreset("balanced")}/><span>Balanced <small>Recommended</small></span></label><label><input type="radio" name="compression-preset" checked={compressionPreset==="quality"} onChange={()=>choosePreset("quality")}/><span>Keep quality</span></label></fieldset></>}
          {mode==="resize"&&<section className={styles.resizeControls} aria-labelledby="custom-image-size"><div className={styles.currentDimensions}><span>Current size</span><strong>{sourceWidth} × {sourceHeight}</strong></div><fieldset className={styles.modeSwitch}><legend>Resize by</legend><label><input type="radio" name="resize-mode" checked={resizeMode==="pixels"} onChange={()=>setResizeMode("pixels")}/> Pixels</label><label><input type="radio" name="resize-mode" checked={resizeMode==="percentage"} onChange={()=>applyPercentage(resizePercentage)}/> Percentage</label></fieldset>{resizeMode==="percentage"?<div className={styles.field}><label htmlFor="resize-percentage">New size · {resizePercentage}%</label><input id="resize-percentage" type="range" min="10" max="200" step="5" value={resizePercentage} onChange={event=>applyPercentage(Number(event.target.value))}/><small>{width} × {height} px</small></div>:<><h3 id="custom-image-size">Custom size</h3><div className={styles.row}><div className={styles.field}><label htmlFor="image-width">Width</label><input id="image-width" type="number" min="1" max="12000" value={width||""} onChange={event=>{const next=Number(event.target.value);setWidth(next);if(keepProportions&&sourceWidth)setHeight(Math.round(next*sourceHeight/sourceWidth))}}/></div><div className={styles.field}><label htmlFor="image-height">Height</label><input id="image-height" type="number" min="1" max="12000" value={keepProportions?"":height||""} placeholder={keepProportions?`Auto (${height}px)`:"Height"} readOnly={keepProportions} onChange={event=>setHeight(Number(event.target.value))}/></div></div><label className={styles.check}><input type="checkbox" checked={keepProportions} onChange={event=>{const checked=event.target.checked;setKeepProportions(checked);if(checked&&sourceWidth)setHeight(Math.round(width*sourceHeight/sourceWidth))}}/> Keep proportions</label></>}<div className={styles.quickSizes} aria-label="Quick resize choices"><button type="button" onClick={()=>applyPercentage(50)}>50% smaller</button><button type="button" onClick={()=>applyPercentage(75)}>25% smaller</button>{imageResizePresets.map(preset=><button type="button" key={preset.id} onClick={()=>applyResizePreset(preset)}>{preset.label}<small>{preset.width} × {preset.height}</small></button>)}</div><p className={styles.inputHint}>Percentage choices keep the original proportions. Fixed dimension presets are general-purpose sizes, not official platform requirements, and may change the image shape. Use the Crop tool when exact framing matters.</p></section>}
          {mode==="crop"&&<section className={styles.cropWorkspace} aria-labelledby="visual-crop-heading"><h3 id="visual-crop-heading">Position the crop</h3><p>Drag the outlined area over the part of the image you want to keep.</p><div className={styles.cropCanvas} ref={cropCanvasRef} style={cropCanvasStyle}><Image unoptimized src={source} alt="Image with adjustable crop area" width={sourceWidth||1} height={sourceHeight||1} style={cropImageStyle}/><div className={styles.cropFrame} style={cropStyle} role="slider" tabIndex={0} aria-label="Crop area position" aria-valuemin={0} aria-valuemax={100} aria-valuetext={`Horizontal ${Math.round(cropX)}%, vertical ${Math.round(cropY)}%`} aria-valuenow={Math.round((cropX+cropY)/2)} onPointerDown={event=>{cropDraggingRef.current=true;event.currentTarget.setPointerCapture(event.pointerId);moveCrop(event)}} onPointerMove={event=>{if(cropDraggingRef.current)moveCrop(event)}} onPointerUp={event=>{cropDraggingRef.current=false;if(event.currentTarget.hasPointerCapture(event.pointerId))event.currentTarget.releasePointerCapture(event.pointerId)}} onPointerCancel={()=>{cropDraggingRef.current=false}} onKeyDown={event=>{const amount=2;if(event.key==="ArrowLeft")setCropX(current=>Math.max(0,current-amount));else if(event.key==="ArrowRight")setCropX(current=>Math.min(100,current+amount));else if(event.key==="ArrowUp")setCropY(current=>Math.max(0,current-amount));else if(event.key==="ArrowDown")setCropY(current=>Math.min(100,current+amount));else return;event.preventDefault()}}><span>Drag to position</span></div></div></section>}
          {mode==="convert"&&file&&<section className={styles.convertIntent} aria-labelledby="convert-intent-heading"><dl className={styles.originalSummary}><div><dt>File</dt><dd>{file.name}</dd></div><div><dt>Format</dt><dd>{(extensions[file.type]??file.type.replace("image/","")).toUpperCase()}</dd></div><div><dt>Size</dt><dd>{prettyBytes(file.size)}</dd></div></dl><h3 id="convert-intent-heading">What do you need it for?</h3><div className={styles.intentChoices}>{([['website','Website'],['smaller','Smaller file'],['transparency','Keep transparency'],['manual','Choose format myself']] as const).map(([value,label])=><button type="button" key={value} aria-pressed={convertIntent===value} onClick={()=>chooseConvertIntent(value)}>{label}</button>)}</div>{convertIntent!=="manual"&&<div className={styles.recommendation} role="status"><span>Recommended</span><strong>{formatRecommendation.name}</strong><p>{formatRecommendation.reason}</p><small>The image is not converted until you select {labels[mode]}.</small></div>}</section>}
          {mode==="resize"&&<div className={styles.upscaleControl}><label className={styles.check}><input type="checkbox" checked={preventUpscaling} onChange={event=>setPreventUpscaling(event.target.checked)}/> Do not enlarge smaller images</label>{enlargementRequested&&<p className={styles.upscaleWarning} role="status">{preventUpscaling?"The requested size is larger than the original. The output will be limited to the available image size.":substantialEnlargement?"This will make the image larger, but it cannot create missing detail. The result may look softer.":"Enlarging may make the result look softer because resizing cannot create missing detail."}</p>}</div>}
          {mode==="crop"&&<section className={styles.cropControls} aria-label="Crop controls"><fieldset className={styles.cropPresets}><legend>Crop shape</legend>{([['free','Free'],['1:1','Square 1:1'],['16:9','Landscape 16:9'],['4:5','Portrait 4:5'],['9:16','Story 9:16']] as const).map(([value,label])=><label key={value}><input type="radio" name="crop-shape" checked={ratio===value} onChange={()=>{setRatio(value);setCropX(50);setCropY(50)}}/> {label}</label>)}</fieldset>{ratio==="free"?<div className={styles.row}><div className={styles.field}><label htmlFor="crop-width">Selection width · {freeCropWidth}%</label><input id="crop-width" type="range" min="20" max="100" value={freeCropWidth} onChange={event=>setFreeCropWidth(Number(event.target.value))}/></div><div className={styles.field}><label htmlFor="crop-height">Selection height · {freeCropHeight}%</label><input id="crop-height" type="range" min="20" max="100" value={freeCropHeight} onChange={event=>setFreeCropHeight(Number(event.target.value))}/></div></div>:<div className={styles.field}><label htmlFor="crop-size">Selection size · {cropScale}%</label><input id="crop-size" type="range" min="25" max="100" value={cropScale} onChange={event=>setCropScale(Number(event.target.value))}/></div>}<div className={styles.field}><label htmlFor="crop-zoom">Zoom · {cropZoom.toFixed(1)}×</label><input id="crop-zoom" type="range" min="1" max="3" step="0.1" value={cropZoom} onChange={event=>setCropZoom(Number(event.target.value))}/></div><div className={styles.actions}><button type="button" className={styles.button} data-quiet onClick={()=>setCropRotation(current=>(current+90)%360)}>Rotate 90°</button><button type="button" className={styles.button} data-quiet onClick={resetCrop}>Reset crop</button></div><p className={styles.inputHint}>These are general crop shapes, not official social-platform requirements.</p></section>}
          {mode!=="resize"&&<details className={styles.advanced} open={mode==="convert"&&convertIntent==="manual"||undefined}><summary>{mode==="convert"?"Choose output format":"More options"}</summary><div><div className={styles.field}><label htmlFor="image-format">Output format</label><select id="image-format" value={format} onChange={event=>setFormat(event.target.value)}><option value="image/webp">WebP</option><option value="image/jpeg">JPEG</option><option value="image/png">PNG</option>{avifOutputSupported&&<option value="image/avif">AVIF</option>}</select>{mode==="convert"&&<small>JPEG, PNG and WebP are available in supported modern browsers. AVIF appears only when this browser can create it.</small>}</div>{format!=="image/png"&&<div className={styles.field}><label htmlFor="image-quality">Quality · {quality}%</label><input id="image-quality" type="range" min="30" max="100" value={quality} onChange={event=>{setQuality(Number(event.target.value));setCompressionPreset("custom")}}/></div>}</div></details>}
          {mode==="convert"&&convertIntent==="manual"&&<dl className={styles.formatGuide}><div><dt>JPEG</dt><dd>Good for photographs.<br/>No transparent background.</dd></div><div><dt>PNG</dt><dd>Good for graphics and transparency.<br/>Often larger.</dd></div><div><dt>WebP</dt><dd>Good general web format.<br/>Supports transparency and is often smaller.</dd></div>{avifOutputSupported&&<div><dt>AVIF</dt><dd>Can create small modern image files.<br/>Availability depends on browser support.</dd></div>}</dl>}
          <div className={styles.actions}><button type="button" className={styles.button} onClick={process} disabled={busy}>{busy?"Working…":labels[mode]}</button><button type="button" className={styles.button} data-quiet onClick={clear}>Clear</button></div></>}
      </section>
      <section ref={resultRef} className={styles.panel} id={`${mode}-image-result`}><h2>Result</h2>{result&&file?<>
        <div className={styles.resultHero} role="status"><span className={styles.resultLabel}>{result.outcome==="original"?"Original kept":result.outcome==="tiny"?"Small saving":"Done"}</span><strong className={styles.resultName}>{result.outcome==="original"?"The original is already more efficient.":result.outcome==="tiny"?"This image is already quite small.":outputName}</strong>{mode!=="resize"&&<><div className={styles.sizeChange}><span>{prettyBytes(file.size)}</span><b aria-hidden="true">↓</b><strong>{prettyBytes(result.blob.size)}</strong></div><p>{result.outcome==="original"?"No smaller version was created.":result.outcome==="tiny"?`The new version only saves ${savedPercent}%. Keeping the original may be better.`:`${savedPercent}% smaller`}</p></>}</div>
        <div className={styles.preview}><Image unoptimized src={result.url} alt="Processed image preview" width={result.width} height={result.height}/></div>
        {mode==="resize"?<dl className={styles.resizeResult}><div><dt>Before</dt><dd>{sourceWidth} × {sourceHeight}</dd></div><div><dt>After</dt><dd>{result.width} × {result.height}</dd></div><div><dt>File size</dt><dd>{prettyBytes(file.size)} <span aria-hidden="true">→</span> {prettyBytes(result.blob.size)}</dd></div></dl>:mode==="crop"?<dl className={styles.cropResult}><div><dt>Original</dt><dd>{sourceWidth} × {sourceHeight}</dd></div><div><dt>Crop</dt><dd>{result.width} × {result.height}</dd></div></dl>:<dl className={styles.stats}><div><dt>Filename</dt><dd>{outputName}</dd></div><div><dt>Format</dt><dd>{(extensions[result.blob.type]??"image").toUpperCase()}</dd></div><div><dt>Dimensions</dt><dd>{result.width} × {result.height}</dd></div><div><dt>Size</dt><dd>{prettyBytes(result.blob.size)}</dd></div><div><dt>Saved</dt><dd>{savedPercent}%</dd></div></dl>}
        {mode==="convert"&&formatComparisons.length>0&&<section className={styles.formatComparison} aria-labelledby="format-comparison-heading"><h3 id="format-comparison-heading">Real file-size comparison</h3><p>Generated in this browser from the current image and quality setting.</p><dl>{formatComparisons.map(candidate=>{const smallest=Math.min(...formatComparisons.map(item=>item.size))===candidate.size;return <div key={candidate.type}><dt>{(extensions[candidate.type]??candidate.type).toUpperCase()}</dt><dd>{prettyBytes(candidate.size)} {smallest&&<strong>Smallest</strong>}</dd></div>})}</dl></section>}
        <div className={styles.actions}><button type="button" className={styles.button} onClick={download} aria-label={result.outcome==="original"?"Download original image":mode==="compress"?"Download compressed image":mode==="resize"?"Download resized image":mode==="crop"?"Download cropped image":`Download ${outputName}`}>{result.outcome==="original"?"Keep original":"Download"}</button></div>
        <nav className={styles.resultLinks} aria-label="Use this image in another tool"><span>Use this result without uploading again</span>{(["compress","resize","crop","convert"] as const).filter(next=>next!==mode).map(next=><button type="button" key={next} disabled={handoffBusy!==null} onClick={()=>void continueWith(next)}>{handoffBusy===next?"Opening…":mode==="crop"?`${next[0].toUpperCase()}${next.slice(1)} →`:`${next[0].toUpperCase()}${next.slice(1)} this image`}</button>)}</nav>
      </>:<p>Your processed image and its real file size will appear here.</p>}<p className={styles.status} data-error={Boolean(error)} role="status">{error}</p></section>
    </div>
    {mode==="compress"&&source&&result&&result.outcome!=="original"&&<section className={styles.comparison} aria-labelledby="compression-comparison"><h2 id="compression-comparison">Before and after</h2><p>Compare the complete images at the same fitted size. Neither preview is enlarged.</p><div><figure><figcaption>Original</figcaption><Image unoptimized src={source} alt="Original image before compression" width={width||result.width} height={height||result.height}/></figure><figure><figcaption>Compressed</figcaption><Image unoptimized src={result.url} alt="Image after compression" width={result.width} height={result.height}/></figure></div></section>}
  </div>;
}
