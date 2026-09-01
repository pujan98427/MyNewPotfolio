"use client";

import {useEffect,useRef,useState} from "react";
import Image from "next/image";
import {useRouter} from "next/navigation";
import styles from "./simple-tools.module.css";
import {saveImageHandoff,takeImageHandoff} from "@/lib/lab/image-handoff";

export type ImageMode="compress"|"resize"|"convert"|"crop";
type CompressionPreset="smaller"|"balanced"|"quality"|"custom";
type CompressionOutcome="smaller"|"tiny"|"original"|"processed";
type Result={url:string;blob:Blob;width:number;height:number;outcome:CompressionOutcome};
const labels:Record<ImageMode,string>={compress:"Compress image",resize:"Resize image",convert:"Convert image",crop:"Crop image"};
const routes:Record<ImageMode,string>={compress:"/lab/image-compressor",resize:"/lab/image-resizer",convert:"/lab/image-format-converter",crop:"/lab/image-cropper"};
const extensions:Record<string,string>={"image/jpeg":"jpg","image/png":"png","image/webp":"webp"};
const prettyBytes=(bytes:number)=>bytes<1024?`${bytes} B`:bytes<1048576?`${(bytes/1024).toFixed(1)} KB`:`${(bytes/1048576).toFixed(1)} MB`;

export function ImageTool({mode}:{mode:ImageMode}){
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
  const [quality,setQuality]=useState(82);
  const [compressionPreset,setCompressionPreset]=useState<CompressionPreset>("balanced");
  const [format,setFormat]=useState("image/webp");
  const [ratio,setRatio]=useState("1:1");
  const [position,setPosition]=useState(50);
  const [busy,setBusy]=useState(false);
  const [handoffBusy,setHandoffBusy]=useState<ImageMode|null>(null);
  const imageRef=useRef<HTMLImageElement|null>(null);

  useEffect(()=>()=>{if(source)URL.revokeObjectURL(source)},[source]);
  useEffect(()=>()=>{if(result)URL.revokeObjectURL(result.url)},[result]);
  useEffect(()=>{let active=true;void takeImageHandoff().then(next=>{if(!active||!next)return;setFile(next);setSource(URL.createObjectURL(next));setResult(null);setError("")}).catch(()=>{});return()=>{active=false}},[]);
  const choose=(next?:File)=>{
    if(!next)return;
    if(!next.type.startsWith("image/")||next.type==="image/svg+xml"){setError("Choose a PNG, JPEG, WebP, GIF, BMP or AVIF image.");return}
    if(next.size>25*1024*1024){setError("Choose an image smaller than 25 MB.");return}
    if(source)URL.revokeObjectURL(source);
    if(result)URL.revokeObjectURL(result.url);
    setFile(next);setSource(URL.createObjectURL(next));setResult(null);setError("");
  };
  useEffect(()=>{
    if(mode!=="compress")return;
    const handlePaste=(event:ClipboardEvent)=>{
      const pasted=Array.from(event.clipboardData?.items??[]).find(item=>item.kind==="file"&&item.type.startsWith("image/"))?.getAsFile();
      if(!pasted)return;
      event.preventDefault();
      if(pasted.type==="image/svg+xml"){setError("Paste a PNG, JPEG, WebP or other raster image.");return}
      if(pasted.size>25*1024*1024){setError("Paste an image smaller than 25 MB.");return}
      if(source)URL.revokeObjectURL(source);
      if(result)URL.revokeObjectURL(result.url);
      setFile(pasted);setSource(URL.createObjectURL(pasted));setResult(null);setError("");
    };
    window.addEventListener("paste",handlePaste);
    return()=>window.removeEventListener("paste",handlePaste);
  },[mode,result,source]);
  const onLoad=(event:React.SyntheticEvent<HTMLImageElement>)=>{
    const image=event.currentTarget;imageRef.current=image;setSourceWidth(image.naturalWidth);setSourceHeight(image.naturalHeight);setWidth(image.naturalWidth);setHeight(image.naturalHeight);
  };
  const process=async()=>{
    const image=imageRef.current;if(!image||!file)return;
    setBusy(true);setError("");
    try{
      const outputType=mode==="resize"&&file.type in extensions?file.type:mode==="resize"?"image/png":format;
      const {processImage}=await import("@/lib/lab/process-image");
      const processed=await processImage({file,mode,width,height,quality:quality/100,outputType,ratio,position});
      const candidate=processed.blob;
      const improvement=mode==="compress"?Math.round((1-candidate.size/file.size)*100):0;
      const outcome:CompressionOutcome=mode!=="compress"?"processed":candidate.size>=file.size?"original":improvement<=3?"tiny":"smaller";
      const blob=outcome==="original"?file:candidate;
      if(result)URL.revokeObjectURL(result.url);
      setResult({url:URL.createObjectURL(blob),blob,width:processed.width,height:processed.height,outcome});
    }catch(caught){setError(caught instanceof Error?caught.message:"The image could not be processed.")}finally{setBusy(false)}
  };
  const clear=()=>{if(source)URL.revokeObjectURL(source);if(result)URL.revokeObjectURL(result.url);setFile(null);setSource(null);setResult(null);setSourceWidth(0);setSourceHeight(0);setKeepProportions(true);setQuality(82);setCompressionPreset("balanced");setError("")};
  const choosePreset=(preset:Exclude<CompressionPreset,"custom">)=>{setCompressionPreset(preset);setQuality(preset==="smaller"?60:preset==="balanced"?82:94)};
  const outputName=result&&file?result.outcome==="original"?file.name:`${file.name.replace(/\.[^.]+$/,"")}-${mode}.${extensions[result.blob.type]??"png"}`:"";
  const savedPercent=result&&file?Math.max(0,Math.round((1-result.blob.size/file.size)*100)):0;
  const download=()=>{if(!result||!file)return;const anchor=document.createElement("a");anchor.href=result.url;anchor.download=outputName;anchor.click()};
  const continueWith=async(nextMode:ImageMode)=>{if(!result)return;setHandoffBusy(nextMode);setError("");try{await saveImageHandoff(result.blob,outputName);router.push(routes[nextMode])}catch{setError("This browser could not pass the image to the next tool. Download it instead.");setHandoffBusy(null)}};

  return <div className={styles.workspace}>
    <p className={styles.privacy}>Your image is processed locally in this browser and is not uploaded.</p>
    <div className={styles.grid}>
      <section className={styles.panel}><h2>Choose an image</h2>
        <label className={styles.drop} onDragOver={event=>event.preventDefault()} onDrop={event=>{event.preventDefault();choose(event.dataTransfer.files[0])}}><input type="file" accept="image/png,image/jpeg,image/webp,image/gif,image/bmp,image/avif" onChange={event=>choose(event.target.files?.[0])}/><span><strong>Drop an image</strong>or<br/><u>Choose image</u></span></label>
        {mode==="compress"&&!source&&<p className={styles.inputHint}>You can also paste an image from your clipboard.</p>}
        {source&&<><div className={styles.preview}><Image unoptimized src={source} alt="Selected image preview" width={width||1} height={height||1} onLoad={onLoad}/></div><p>{file?.name}</p>{mode==="compress"&&file&&<><dl className={styles.originalSummary}><div><dt>Original</dt><dd>{prettyBytes(file.size)}</dd></div><div><dt>Dimensions</dt><dd>{width} × {height}</dd></div><div><dt>Type</dt><dd>{(extensions[file.type]??file.type.replace("image/","")).toUpperCase()}</dd></div></dl><fieldset className={styles.presets}><legend>Choose the result you prefer</legend><label><input type="radio" name="compression-preset" checked={compressionPreset==="smaller"} onChange={()=>choosePreset("smaller")}/><span>Smaller file</span></label><label><input type="radio" name="compression-preset" checked={compressionPreset==="balanced"} onChange={()=>choosePreset("balanced")}/><span>Balanced <small>Recommended</small></span></label><label><input type="radio" name="compression-preset" checked={compressionPreset==="quality"} onChange={()=>choosePreset("quality")}/><span>Keep quality</span></label></fieldset></>}
          {mode==="resize"&&<section className={styles.resizeControls} aria-labelledby="custom-image-size"><div className={styles.currentDimensions}><span>Current size</span><strong>{sourceWidth} × {sourceHeight}</strong></div><h3 id="custom-image-size">Custom size</h3><div className={styles.row}><div className={styles.field}><label htmlFor="image-width">Width</label><input id="image-width" type="number" min="1" max="12000" value={width||""} onChange={event=>{const next=Number(event.target.value);setWidth(next);if(keepProportions&&sourceWidth)setHeight(Math.round(next*sourceHeight/sourceWidth))}}/></div><div className={styles.field}><label htmlFor="image-height">Height</label><input id="image-height" type="number" min="1" max="12000" value={keepProportions?"":height||""} placeholder={keepProportions?`Auto (${height}px)`:"Height"} readOnly={keepProportions} onChange={event=>setHeight(Number(event.target.value))}/></div></div><label className={styles.check}><input type="checkbox" checked={keepProportions} onChange={event=>{const checked=event.target.checked;setKeepProportions(checked);if(checked&&sourceWidth)setHeight(Math.round(width*sourceHeight/sourceWidth))}}/> Keep proportions</label></section>}
          {mode==="crop"&&<><div className={styles.field}><label htmlFor="crop-ratio">Crop shape</label><select id="crop-ratio" value={ratio} onChange={event=>setRatio(event.target.value)}><option value="1:1">Square · 1:1</option><option value="4:3">Landscape · 4:3</option><option value="16:9">Wide · 16:9</option><option value="3:4">Portrait · 3:4</option></select></div><div className={styles.field}><label htmlFor="crop-position">Crop position</label><input id="crop-position" type="range" min="0" max="100" value={position} onChange={event=>setPosition(Number(event.target.value))}/></div></>}
          {mode!=="resize"&&<details className={styles.advanced}><summary>More options</summary><div><div className={styles.field}><label htmlFor="image-format">Output format</label><select id="image-format" value={format} onChange={event=>setFormat(event.target.value)}><option value="image/webp">WebP</option><option value="image/jpeg">JPEG</option><option value="image/png">PNG</option></select></div>{format!=="image/png"&&<div className={styles.field}><label htmlFor="image-quality">Quality · {quality}%</label><input id="image-quality" type="range" min="30" max="100" value={quality} onChange={event=>{setQuality(Number(event.target.value));setCompressionPreset("custom")}}/></div>}</div></details>}
          <div className={styles.actions}><button type="button" className={styles.button} onClick={process} disabled={busy}>{busy?"Working…":labels[mode]}</button><button type="button" className={styles.button} data-quiet onClick={clear}>Clear</button></div></>}
      </section>
      <section className={styles.panel}><h2>Result</h2>{result&&file?<><div className={styles.resultHero} role="status"><span className={styles.resultLabel}>{result.outcome==="original"?"Original kept":result.outcome==="tiny"?"Small saving":"Done"}</span><strong className={styles.resultName}>{result.outcome==="original"?"The original is already more efficient.":result.outcome==="tiny"?"This image is already quite small.":outputName}</strong><div className={styles.sizeChange}><span>{prettyBytes(file.size)}</span><b aria-hidden="true">↓</b><strong>{prettyBytes(result.blob.size)}</strong></div><p>{result.outcome==="original"?"No smaller version was created.":result.outcome==="tiny"?`The new version only saves ${savedPercent}%. Keeping the original may be better.`:`${savedPercent}% smaller`}</p></div><div className={styles.preview}><Image unoptimized src={result.url} alt="Processed image preview" width={result.width} height={result.height}/></div><dl className={styles.stats}><div><dt>Filename</dt><dd>{outputName}</dd></div><div><dt>Format</dt><dd>{(extensions[result.blob.type]??"image").toUpperCase()}</dd></div><div><dt>Dimensions</dt><dd>{result.width} × {result.height}</dd></div><div><dt>Size</dt><dd>{prettyBytes(result.blob.size)}</dd></div><div><dt>Saved</dt><dd>{savedPercent}%</dd></div></dl><div className={styles.actions}><button type="button" className={styles.button} onClick={download}>{result.outcome==="original"?"Keep original":mode==="compress"?"Download compressed image":`Download ${outputName}`}</button></div><nav className={styles.resultLinks} aria-label="Use this image in another tool"><span>Use this result without uploading again</span>{(["compress","resize","crop","convert"] as const).filter(next=>next!==mode).map(next=><button type="button" key={next} disabled={handoffBusy!==null} onClick={()=>void continueWith(next)}>{handoffBusy===next?"Opening…":`${next[0].toUpperCase()}${next.slice(1)} this image`}</button>)}</nav></>:<p>Your processed image and its real file size will appear here.</p>}<p className={styles.status} data-error={Boolean(error)} role="status">{error}</p></section>
    </div>
    {mode==="compress"&&source&&result&&result.outcome!=="original"&&<section className={styles.comparison} aria-labelledby="compression-comparison"><h2 id="compression-comparison">Before and after</h2><p>Compare the complete images at the same fitted size. Neither preview is enlarged.</p><div><figure><figcaption>Original</figcaption><Image unoptimized src={source} alt="Original image before compression" width={width||result.width} height={height||result.height}/></figure><figure><figcaption>Compressed</figcaption><Image unoptimized src={result.url} alt="Image after compression" width={result.width} height={result.height}/></figure></div></section>}
  </div>;
}
