"use client";

import {useEffect,useRef,useState} from "react";
import styles from "./simple-tools.module.css";

export type ImageMode="compress"|"resize"|"convert"|"crop";
type Result={url:string;blob:Blob;width:number;height:number};
const labels:Record<ImageMode,string>={compress:"Compress image",resize:"Resize image",convert:"Convert image",crop:"Crop image"};
const extensions:Record<string,string>={"image/jpeg":"jpg","image/png":"png","image/webp":"webp"};
const prettyBytes=(bytes:number)=>bytes<1024?`${bytes} B`:bytes<1048576?`${(bytes/1024).toFixed(1)} KB`:`${(bytes/1048576).toFixed(1)} MB`;

export function ImageTool({mode}:{mode:ImageMode}){
  const [file,setFile]=useState<File|null>(null);
  const [source,setSource]=useState<string|null>(null);
  const [result,setResult]=useState<Result|null>(null);
  const [error,setError]=useState("");
  const [width,setWidth]=useState(0);
  const [height,setHeight]=useState(0);
  const [quality,setQuality]=useState(82);
  const [format,setFormat]=useState("image/webp");
  const [ratio,setRatio]=useState("1:1");
  const [position,setPosition]=useState(50);
  const [busy,setBusy]=useState(false);
  const imageRef=useRef<HTMLImageElement|null>(null);

  useEffect(()=>()=>{if(source)URL.revokeObjectURL(source);if(result)URL.revokeObjectURL(result.url)},[source,result]);
  const choose=(next?:File)=>{
    if(!next)return;
    if(!next.type.startsWith("image/")||next.type==="image/svg+xml"){setError("Choose a PNG, JPEG, WebP, GIF, BMP or AVIF image.");return}
    if(next.size>25*1024*1024){setError("Choose an image smaller than 25 MB.");return}
    if(source)URL.revokeObjectURL(source);
    if(result)URL.revokeObjectURL(result.url);
    setFile(next);setSource(URL.createObjectURL(next));setResult(null);setError("");
  };
  const onLoad=(event:React.SyntheticEvent<HTMLImageElement>)=>{
    const image=event.currentTarget;imageRef.current=image;setWidth(image.naturalWidth);setHeight(image.naturalHeight);
  };
  const process=async()=>{
    const image=imageRef.current;if(!image||!file)return;
    setBusy(true);setError("");
    try{
      let sx=0,sy=0,sw=image.naturalWidth,sh=image.naturalHeight,dw=width||sw,dh=height||sh;
      if(mode==="compress"||mode==="convert"){dw=sw;dh=sh}
      if(mode==="crop"){
        const [rw,rh]=ratio.split(":").map(Number),target=rw/rh;
        if(sw/sh>target){const cropWidth=sh*target;sx=(sw-cropWidth)*(position/100);sw=cropWidth}
        else{const cropHeight=sw/target;sy=(sh-cropHeight)*(position/100);sh=cropHeight}
        dw=Math.round(sw);dh=Math.round(sh);
      }
      const canvas=document.createElement("canvas");canvas.width=Math.max(1,Math.round(dw));canvas.height=Math.max(1,Math.round(dh));
      const context=canvas.getContext("2d");if(!context)throw new Error("Canvas is unavailable.");
      const outputType=mode==="resize"&&file.type in extensions?file.type:mode==="resize"?"image/png":format;
      if(outputType==="image/jpeg"){context.fillStyle="#fff";context.fillRect(0,0,canvas.width,canvas.height)}
      context.drawImage(image,sx,sy,sw,sh,0,0,canvas.width,canvas.height);
      const blob=await new Promise<Blob|null>(resolve=>canvas.toBlob(resolve,outputType,quality/100));
      if(!blob)throw new Error("This browser could not create the selected format.");
      if(result)URL.revokeObjectURL(result.url);
      setResult({url:URL.createObjectURL(blob),blob,width:canvas.width,height:canvas.height});
    }catch(caught){setError(caught instanceof Error?caught.message:"The image could not be processed.")}finally{setBusy(false)}
  };
  const clear=()=>{if(source)URL.revokeObjectURL(source);if(result)URL.revokeObjectURL(result.url);setFile(null);setSource(null);setResult(null);setError("")};
  const download=()=>{if(!result||!file)return;const anchor=document.createElement("a");anchor.href=result.url;anchor.download=`${file.name.replace(/\.[^.]+$/,"")}-${mode}.${extensions[result.blob.type]??"png"}`;anchor.click()};

  return <div className={styles.workspace}>
    <p className={styles.privacy}>Your image is processed locally in this browser and is not uploaded.</p>
    <div className={styles.grid}>
      <section className={styles.panel}><h2>Choose an image</h2>
        <label className={styles.drop} onDragOver={event=>event.preventDefault()} onDrop={event=>{event.preventDefault();choose(event.dataTransfer.files[0])}}><input type="file" accept="image/png,image/jpeg,image/webp,image/gif,image/bmp,image/avif" onChange={event=>choose(event.target.files?.[0])}/><span><strong>Drop an image here</strong>or choose a file</span></label>
        {source&&<><div className={styles.preview}><img src={source} alt="Selected image preview" onLoad={onLoad}/></div><p>{file?.name} · {file&&prettyBytes(file.size)}</p>
          {mode==="resize"&&<div className={styles.row}><div className={styles.field}><label htmlFor="image-width">Width (px)</label><input id="image-width" type="number" min="1" max="12000" value={width} onChange={event=>{const next=Number(event.target.value);setWidth(next);if(imageRef.current)setHeight(Math.round(next*imageRef.current.naturalHeight/imageRef.current.naturalWidth))}}/></div><div className={styles.field}><label htmlFor="image-height">Height (px)</label><input id="image-height" type="number" min="1" max="12000" value={height} onChange={event=>{const next=Number(event.target.value);setHeight(next);if(imageRef.current)setWidth(Math.round(next*imageRef.current.naturalWidth/imageRef.current.naturalHeight))}}/></div></div>}
          {mode==="crop"&&<><div className={styles.field}><label htmlFor="crop-ratio">Crop shape</label><select id="crop-ratio" value={ratio} onChange={event=>setRatio(event.target.value)}><option value="1:1">Square · 1:1</option><option value="4:3">Landscape · 4:3</option><option value="16:9">Wide · 16:9</option><option value="3:4">Portrait · 3:4</option></select></div><div className={styles.field}><label htmlFor="crop-position">Crop position</label><input id="crop-position" type="range" min="0" max="100" value={position} onChange={event=>setPosition(Number(event.target.value))}/></div></>}
          {mode!=="resize"&&<details className={styles.advanced}><summary>More options</summary><div><div className={styles.field}><label htmlFor="image-format">Output format</label><select id="image-format" value={format} onChange={event=>setFormat(event.target.value)}><option value="image/webp">WebP</option><option value="image/jpeg">JPEG</option><option value="image/png">PNG</option></select></div>{format!=="image/png"&&<div className={styles.field}><label htmlFor="image-quality">Quality · {quality}%</label><input id="image-quality" type="range" min="30" max="100" value={quality} onChange={event=>setQuality(Number(event.target.value))}/></div>}</div></details>}
          <div className={styles.actions}><button type="button" className={styles.button} onClick={process} disabled={busy}>{busy?"Working…":labels[mode]}</button><button type="button" className={styles.button} data-quiet onClick={clear}>Clear</button></div></>}
      </section>
      <section className={styles.panel}><h2>Result</h2>{result?<><div className={styles.preview}><img src={result.url} alt="Processed image preview"/></div><dl className={styles.stats}><div><dt>Before</dt><dd>{file&&prettyBytes(file.size)}</dd></div><div><dt>After</dt><dd>{prettyBytes(result.blob.size)}</dd></div><div><dt>Dimensions</dt><dd>{result.width} × {result.height}</dd></div><div><dt>Change</dt><dd>{file?`${Math.round((result.blob.size/file.size-1)*100)}%`:"—"}</dd></div></dl><div className={styles.actions}><button type="button" className={styles.button} onClick={download}>Download image</button></div></>:<p>Your processed image and its real file size will appear here.</p>}<p className={styles.status} data-error={Boolean(error)} role="status">{error}</p></section>
    </div>
  </div>;
}
