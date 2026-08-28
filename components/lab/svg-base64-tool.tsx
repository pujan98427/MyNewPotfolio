"use client";

import { type DragEvent, type ClipboardEvent, useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import { ArrowDownToLine, Clipboard, FileUp, RefreshCw } from "lucide-react";
import { decodeSvgBase64, encodeSvgBase64, encodeSvgUtf8DataUri, formatSvgMarkup, MAX_SVG_BYTES } from "@/lib/svg-base64";

type CopyTarget="base64"|"data-uri"|"css-background"|"css-url"|"svg";
type OutputTab="base64"|"data-uri"|"css";
type Direction="encode"|"decode";

function formatBytes(bytes:number){if(bytes<1024)return `${bytes} B`;const kilobytes=bytes/1024;return `${kilobytes<10?kilobytes.toFixed(1):Math.round(kilobytes)} KB`;}

function detectDirection(value:string):Direction|null{const input=value.trim();if(/^(?:<\?xml[\s\S]*?\?>\s*)?<svg(?:\s|>)/i.test(input))return "encode";if(/^data:image\/svg\+xml(?:;charset=[^;,]+)?;base64,/i.test(input))return "decode";return null;}

function safePreviewDataUri(source:string){
  if(new TextEncoder().encode(source).byteLength>MAX_SVG_BYTES)return null;
  if(/<!DOCTYPE|<!ENTITY/i.test(source))return null;
  const document=new DOMParser().parseFromString(source,"image/svg+xml");
  if(document.querySelector("parsererror")||document.documentElement.localName!=="svg")return null;
  let removed=0;
  document.querySelectorAll("script,foreignObject,iframe,object,embed,image,use,style,link").forEach(element=>{removed++;element.remove();});
  document.querySelectorAll("*").forEach(element=>{for(const attribute of Array.from(element.attributes)){const name=attribute.name.toLowerCase(),value=attribute.value.trim(),externalReference=(name==="href"||name==="xlink:href")&&!value.startsWith("#"),unsafeUrl=/javascript\s*:/i.test(value)||/url\s*\(/i.test(value);if(name.startsWith("on")||externalReference||unsafeUrl){removed++;element.removeAttribute(attribute.name);}}});
  const safeMarkup=new XMLSerializer().serializeToString(document.documentElement);
  return {uri:`data:image/svg+xml;base64,${encodeSvgBase64(safeMarkup)}`,removed};
}

export function SvgBase64Tool(){
  const [svg,setSvg]=useState('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120">\n  <circle cx="60" cy="60" r="48" fill="#d6f342" />\n  <path d="M38 62l14 14 31-34" fill="none" stroke="#151515" stroke-width="8" />\n</svg>');
  const [base64,setBase64]=useState("");
  const [decodeInput,setDecodeInput]=useState("");
  const [error,setError]=useState("");
  const [copied,setCopied]=useState<CopyTarget|null>(null);
  const [outputTab,setOutputTab]=useState<OutputTab>("base64");
  const [direction,setDirection]=useState<Direction>("encode");
  const [dragging,setDragging]=useState(false);
  const [previewUri,setPreviewUri]=useState<string|null>(null);
  const [previewPending,setPreviewPending]=useState(false);
  const [previewRemoved,setPreviewRemoved]=useState(0);
  const fileRef=useRef<HTMLInputElement>(null);
  const dataUri=base64?`data:image/svg+xml;base64,${base64}`:"";
  const utf8DataUri=useMemo(()=>{try{return base64?encodeSvgUtf8DataUri(svg):"";}catch{return "";}},[base64,svg]);
  const cssUrl=utf8DataUri?`url("${utf8DataUri}")`:"";
  const cssBackground=cssUrl?`background-image: ${cssUrl};`:"";
  const fileInfo=useMemo(()=>{try{const encoded=encodeSvgBase64(svg),originalBytes=new TextEncoder().encode(svg).byteLength,base64Bytes=new TextEncoder().encode(encoded).byteLength,difference=originalBytes?Math.round(((base64Bytes-originalBytes)/originalBytes)*100):0;return {originalBytes,base64Bytes,difference,characters:Array.from(svg).length};}catch{return null;}},[svg]);
  const formattedSvg=useMemo(()=>{try{return svg?formatSvgMarkup(svg):"";}catch{return svg;}},[svg]);

  useEffect(()=>{setPreviewPending(Boolean(svg));const timer=window.setTimeout(()=>{try{const preview=svg?safePreviewDataUri(svg):null;setPreviewUri(preview?.uri??null);setPreviewRemoved(preview?.removed??0);}catch{setPreviewUri(null);setPreviewRemoved(0);}setPreviewPending(false);},180);return()=>window.clearTimeout(timer);},[svg]);

  function acceptSvg(source:string){try{const encoded=encodeSvgBase64(source);setSvg(source);setBase64(encoded);setError("");}catch(cause){setBase64("");setError(cause instanceof Error?cause.message:"The SVG could not be encoded.");}}
  function encode(){acceptSvg(svg);}
  function acceptBase64(source:string){try{const result=decodeSvgBase64(source);setDecodeInput(source);setSvg(result);setBase64(encodeSvgBase64(result));setError("");}catch(cause){setError(cause instanceof Error?cause.message:"The Base64 value could not be decoded.");}}
  function decode(){acceptBase64(decodeInput);}
  async function copy(value:string,target:CopyTarget){await navigator.clipboard.writeText(value);setCopied(target);window.setTimeout(()=>setCopied(current=>current===target?null:current),1600);}
  function download(){const blob=new Blob([svg],{type:"image/svg+xml;charset=utf-8"}),url=URL.createObjectURL(blob),anchor=document.createElement("a");anchor.href=url;anchor.download="decoded-image.svg";anchor.click();URL.revokeObjectURL(url);}
  async function selectFile(file:File|undefined){if(!file)return;if(file.size>MAX_SVG_BYTES){setError("SVG file is larger than the 1 MB browser limit.");return;}if(!file.name.toLowerCase().endsWith(".svg")&&file.type!=="image/svg+xml"){setError("Choose an SVG file.");return;}acceptSvg(await file.text());}
  function pasteSvg(event:ClipboardEvent<HTMLTextAreaElement>){const pasted=event.clipboardData.getData("text"),detected=detectDirection(pasted);if(!detected)return;event.preventDefault();setDirection(detected);if(detected==="encode")acceptSvg(pasted);else acceptBase64(pasted);}
  function pasteBase64(event:ClipboardEvent<HTMLTextAreaElement>){const pasted=event.clipboardData.getData("text"),detected=detectDirection(pasted);if(!detected)return;event.preventDefault();setDirection(detected);if(detected==="encode")acceptSvg(pasted);else acceptBase64(pasted);}
  function dragOver(event:DragEvent<HTMLButtonElement>){event.preventDefault();event.dataTransfer.dropEffect="copy";setDragging(true);}
  function dropFile(event:DragEvent<HTMLButtonElement>){event.preventDefault();setDragging(false);const file=event.dataTransfer.files[0];void selectFile(file);}
  function reset(){setSvg("");setBase64("");setDecodeInput("");setError("");setCopied(null);setOutputTab("base64");if(fileRef.current)fileRef.current.value="";}

  return <section className="svg-converter" aria-labelledby="svg-converter-heading">
    <header><p className="eyebrow">LOCAL BROWSER UTILITY</p><h2 id="svg-converter-heading">Convert in either direction.</h2><p>Your SVG never leaves this device. The 1 MB limit keeps conversion responsive and discourages embedding oversized artwork.</p></header>
    <aside className="svg-local-privacy" aria-label="SVG conversion privacy"><strong>Private by design.</strong><p>Your SVG is processed locally in your browser and is not uploaded to our server.</p></aside>
    <div className="svg-direction" role="tablist" aria-label="Conversion direction"><button id="direction-encode" type="button" role="tab" aria-selected={direction==="encode"} aria-controls="direction-panel-encode" onClick={()=>setDirection("encode")}>SVG → Base64</button><button id="direction-decode" type="button" role="tab" aria-selected={direction==="decode"} aria-controls="direction-panel-decode" onClick={()=>setDirection("decode")}>Base64 → SVG</button></div>
    <div className="svg-converter-grid">
      <section id="direction-panel-encode" role="tabpanel" aria-labelledby="direction-encode" hidden={direction!=="encode"}><div className="svg-panel-heading"><span>01</span><div><h3 id="encode-svg-heading">SVG to Base64</h3><p>Paste markup, choose a file, or drop an SVG below.</p></div></div><label htmlFor="svg-source">SVG markup</label><textarea id="svg-source" value={svg} spellCheck={false} onPaste={pasteSvg} onChange={event=>{setSvg(event.target.value);setBase64("");setError("");}} /><button type="button" className="svg-drop-zone" data-dragging={dragging||undefined} onClick={()=>fileRef.current?.click()} onDragEnter={dragOver} onDragOver={dragOver} onDragLeave={()=>setDragging(false)} onDrop={dropFile}><FileUp aria-hidden="true" /><span><strong>{dragging?"Drop the SVG here":"Drop an SVG file here"}</strong><small>or choose a local .svg file · maximum 1 MB</small></span></button><div className="svg-actions"><button type="button" onClick={encode}>Encode SVG</button><input ref={fileRef} className="sr-only" type="file" accept=".svg,image/svg+xml" onChange={event=>void selectFile(event.target.files?.[0])} /></div></section>
      <section id="direction-panel-decode" role="tabpanel" aria-labelledby="direction-decode" hidden={direction!=="decode"}><div className="svg-panel-heading"><span>02</span><div><h3 id="decode-svg-heading">Base64 to SVG</h3><p>Raw Base64 and complete SVG data URIs are detected automatically.</p></div></div><label htmlFor="svg-base64-source">Base64 input</label><textarea id="svg-base64-source" value={decodeInput} spellCheck={false} onPaste={pasteBase64} placeholder="PHN2ZyB4bWxucz0iLi4u or data:image/svg+xml;base64,…" onChange={event=>{setDecodeInput(event.target.value);setError("");}} /><div className="svg-actions"><button type="button" onClick={decode}>Decode Base64</button><button type="button" className="secondary" onClick={reset}><RefreshCw aria-hidden="true" /> CLEAR</button></div></section>
    </div>
    {fileInfo&&<dl className="svg-file-info" aria-label="SVG file information"><div><dt>Original size</dt><dd>{formatBytes(fileInfo.originalBytes)}</dd></div><div><dt>Base64 size</dt><dd>{formatBytes(fileInfo.base64Bytes)}</dd></div><div><dt>Difference</dt><dd>{fileInfo.difference>0?"+":""}{fileInfo.difference}%</dd></div><div><dt>Characters</dt><dd>{fileInfo.characters.toLocaleString()}</dd></div></dl>}
    <section className="svg-live-preview" aria-labelledby="svg-preview-heading"><div><p className="eyebrow">PREVIEW-SAFE VERSION</p><h3 id="svg-preview-heading">Rendered graphic</h3><p>Conversion input remains untouched. The image preview uses a separate sanitized copy with active content and unsafe references removed.</p><p className="svg-preview-safety" aria-live="polite">{previewUri?(previewRemoved?`${previewRemoved} unsafe ${previewRemoved===1?"item":"items"} removed from preview only. Copy and download still use your exact source.`:"No unsafe preview content was detected. Conversion output still uses your exact source."):"A preview-safe version will appear after a complete SVG is detected."}</p></div><div className="svg-preview-canvas" aria-live="polite" aria-busy={previewPending}>{previewUri?<Image src={previewUri} alt="Sanitized preview of the current SVG markup" width={640} height={400} unoptimized />:<p>{previewPending?"Preparing sanitized preview…":"Enter a complete SVG to see a preview."}</p>}</div></section>
    {error&&<p className="svg-error" role="alert">{error}</p>}
    <section className="svg-output" aria-labelledby="svg-output-heading"><div><p className="eyebrow">OUTPUT</p><h3 id="svg-output-heading">Copy the format you need.</h3></div>{base64?<div className="svg-output-list"><section className="svg-encoded-output" aria-label="Encoded SVG output">
      <div className="svg-output-tabs" role="tablist" aria-label="Choose SVG output format"><button id="svg-tab-base64" type="button" role="tab" aria-selected={outputTab==="base64"} aria-controls="svg-panel-base64" onClick={()=>setOutputTab("base64")}>Base64</button><button id="svg-tab-data-uri" type="button" role="tab" aria-selected={outputTab==="data-uri"} aria-controls="svg-panel-data-uri" onClick={()=>setOutputTab("data-uri")}>Data URI</button><button id="svg-tab-css" type="button" role="tab" aria-selected={outputTab==="css"} aria-controls="svg-panel-css" onClick={()=>setOutputTab("css")}>CSS</button></div>
      <article id="svg-panel-base64" role="tabpanel" aria-labelledby="svg-tab-base64" hidden={outputTab!=="base64"}><header><strong>Raw Base64</strong><button type="button" aria-label="Copy raw SVG Base64" onClick={()=>void copy(base64,"base64")}><Clipboard aria-hidden="true" /><span aria-live="polite">{copied==="base64"?"Copied":"COPY"}</span></button></header><pre><code>{base64}</code></pre></article>
      <article id="svg-panel-data-uri" role="tabpanel" aria-labelledby="svg-tab-data-uri" hidden={outputTab!=="data-uri"}><header><strong>Complete Base64 data URI</strong><button type="button" aria-label="Copy complete SVG data URI" onClick={()=>void copy(dataUri,"data-uri")}><Clipboard aria-hidden="true" /><span aria-live="polite">{copied==="data-uri"?"Copied":"COPY"}</span></button></header><pre><code>{dataUri}</code></pre></article>
      <div id="svg-panel-css" role="tabpanel" aria-labelledby="svg-tab-css" hidden={outputTab!=="css"} className="svg-css-output"><article><header><strong>CSS background image</strong><button type="button" aria-label="Copy SVG CSS background-image declaration" onClick={()=>void copy(cssBackground,"css-background")}><Clipboard aria-hidden="true" /><span aria-live="polite">{copied==="css-background"?"Copied":"COPY"}</span></button></header><pre><code>{cssBackground}</code></pre></article><article><header><strong>Data URL with CSS url() function</strong><button type="button" aria-label="Copy SVG CSS URL function" onClick={()=>void copy(cssUrl,"css-url")}><Clipboard aria-hidden="true" /><span aria-live="polite">{copied==="css-url"?"Copied":"COPY"}</span></button></header><pre><code>{cssUrl}</code></pre></article></div>
    </section><article className="svg-decoded-output"><header><strong>Formatted SVG output</strong><div><button type="button" aria-label="Copy decoded SVG markup" onClick={()=>void copy(svg,"svg")}><Clipboard aria-hidden="true" /><span aria-live="polite">{copied==="svg"?"Copied":"COPY SVG"}</span></button><button type="button" onClick={download}><ArrowDownToLine aria-hidden="true" /> DOWNLOAD .SVG</button></div></header><pre><code>{formattedSvg}</code></pre></article></div>:<p className="svg-empty">Encode SVG markup or decode a Base64 value to create copyable output.</p>}</section>
  </section>;
}
