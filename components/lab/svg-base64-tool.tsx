"use client";

import { type DragEvent, type ClipboardEvent, useMemo, useRef, useState } from "react";
import { ArrowDownToLine, Clipboard, FileUp, RefreshCw } from "lucide-react";
import { decodeSvgBase64, encodeSvgBase64, formatSvgMarkup, MAX_SVG_BYTES } from "@/lib/svg-base64";

type CopyTarget="base64"|"data-uri"|"svg";
type OutputTab="base64"|"data-uri";

export function SvgBase64Tool(){
  const [svg,setSvg]=useState('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120">\n  <circle cx="60" cy="60" r="48" fill="#d6f342" />\n  <path d="M38 62l14 14 31-34" fill="none" stroke="#151515" stroke-width="8" />\n</svg>');
  const [base64,setBase64]=useState("");
  const [decodeInput,setDecodeInput]=useState("");
  const [error,setError]=useState("");
  const [copied,setCopied]=useState<CopyTarget|null>(null);
  const [outputTab,setOutputTab]=useState<OutputTab>("base64");
  const [dragging,setDragging]=useState(false);
  const fileRef=useRef<HTMLInputElement>(null);
  const dataUri=base64?`data:image/svg+xml;base64,${base64}`:"";
  const formattedSvg=useMemo(()=>{try{return svg?formatSvgMarkup(svg):"";}catch{return svg;}},[svg]);

  function acceptSvg(source:string){try{const encoded=encodeSvgBase64(source);setSvg(source);setBase64(encoded);setError("");}catch(cause){setBase64("");setError(cause instanceof Error?cause.message:"The SVG could not be encoded.");}}
  function encode(){acceptSvg(svg);}
  function decode(){try{const result=decodeSvgBase64(decodeInput);setSvg(result);setBase64(encodeSvgBase64(result));setError("");}catch(cause){setError(cause instanceof Error?cause.message:"The Base64 value could not be decoded.");}}
  async function copy(value:string,target:CopyTarget){await navigator.clipboard.writeText(value);setCopied(target);window.setTimeout(()=>setCopied(current=>current===target?null:current),1600);}
  function download(){const blob=new Blob([svg],{type:"image/svg+xml;charset=utf-8"}),url=URL.createObjectURL(blob),anchor=document.createElement("a");anchor.href=url;anchor.download="decoded-image.svg";anchor.click();URL.revokeObjectURL(url);}
  async function selectFile(file:File|undefined){if(!file)return;if(file.size>MAX_SVG_BYTES){setError("SVG file is larger than the 1 MB browser limit.");return;}if(!file.name.toLowerCase().endsWith(".svg")&&file.type!=="image/svg+xml"){setError("Choose an SVG file.");return;}acceptSvg(await file.text());}
  function pasteSvg(event:ClipboardEvent<HTMLTextAreaElement>){const pasted=event.clipboardData.getData("text");if(!/<svg(?:\s|>)/i.test(pasted))return;event.preventDefault();acceptSvg(pasted);}
  function dragOver(event:DragEvent<HTMLButtonElement>){event.preventDefault();event.dataTransfer.dropEffect="copy";setDragging(true);}
  function dropFile(event:DragEvent<HTMLButtonElement>){event.preventDefault();setDragging(false);const file=event.dataTransfer.files[0];void selectFile(file);}
  function reset(){setSvg("");setBase64("");setDecodeInput("");setError("");setCopied(null);setOutputTab("base64");if(fileRef.current)fileRef.current.value="";}

  return <section className="svg-converter" aria-labelledby="svg-converter-heading">
    <header><p className="eyebrow">LOCAL BROWSER UTILITY</p><h2 id="svg-converter-heading">Convert in either direction.</h2><p>Your SVG never leaves this device. The 1 MB limit keeps conversion responsive and discourages embedding oversized artwork.</p></header>
    <div className="svg-converter-grid">
      <section aria-labelledby="encode-svg-heading"><div className="svg-panel-heading"><span>01</span><div><h3 id="encode-svg-heading">SVG to Base64</h3><p>Paste markup, choose a file, or drop an SVG below.</p></div></div><label htmlFor="svg-source">SVG markup</label><textarea id="svg-source" value={svg} spellCheck={false} onPaste={pasteSvg} onChange={event=>{setSvg(event.target.value);setBase64("");setError("");}} /><button type="button" className="svg-drop-zone" data-dragging={dragging||undefined} onClick={()=>fileRef.current?.click()} onDragEnter={dragOver} onDragOver={dragOver} onDragLeave={()=>setDragging(false)} onDrop={dropFile}><FileUp aria-hidden="true" /><span><strong>{dragging?"Drop the SVG here":"Drop an SVG file here"}</strong><small>or choose a local .svg file · maximum 1 MB</small></span></button><div className="svg-actions"><button type="button" onClick={encode}>Encode SVG</button><input ref={fileRef} className="sr-only" type="file" accept=".svg,image/svg+xml" onChange={event=>void selectFile(event.target.files?.[0])} /></div></section>
      <section aria-labelledby="decode-svg-heading"><div className="svg-panel-heading"><span>02</span><div><h3 id="decode-svg-heading">Base64 to SVG</h3><p>Raw Base64 and complete SVG data URIs are detected automatically.</p></div></div><label htmlFor="svg-base64-source">Base64 input</label><textarea id="svg-base64-source" value={decodeInput} spellCheck={false} placeholder="PHN2ZyB4bWxucz0iLi4u or data:image/svg+xml;base64,…" onChange={event=>{setDecodeInput(event.target.value);setError("");}} /><div className="svg-actions"><button type="button" onClick={decode}>Decode Base64</button><button type="button" className="secondary" onClick={reset}><RefreshCw aria-hidden="true" /> CLEAR</button></div></section>
    </div>
    {error&&<p className="svg-error" role="alert">{error}</p>}
    <section className="svg-output" aria-labelledby="svg-output-heading"><div><p className="eyebrow">OUTPUT</p><h3 id="svg-output-heading">Copy the format you need.</h3></div>{base64?<div className="svg-output-list"><section className="svg-encoded-output" aria-label="Encoded SVG output"><div className="svg-output-tabs" role="tablist" aria-label="Choose Base64 output format"><button id="svg-tab-base64" type="button" role="tab" aria-selected={outputTab==="base64"} aria-controls="svg-panel-base64" onClick={()=>setOutputTab("base64")}>Base64</button><button id="svg-tab-data-uri" type="button" role="tab" aria-selected={outputTab==="data-uri"} aria-controls="svg-panel-data-uri" onClick={()=>setOutputTab("data-uri")}>Data URI</button></div><article id="svg-panel-base64" role="tabpanel" aria-labelledby="svg-tab-base64" hidden={outputTab!=="base64"}><header><strong>Raw Base64</strong><button type="button" aria-label="Copy raw SVG Base64" onClick={()=>void copy(base64,"base64")}><Clipboard aria-hidden="true" /><span aria-live="polite">{copied==="base64"?"Copied":"COPY"}</span></button></header><pre><code>{base64}</code></pre></article><article id="svg-panel-data-uri" role="tabpanel" aria-labelledby="svg-tab-data-uri" hidden={outputTab!=="data-uri"}><header><strong>Complete data URI</strong><button type="button" aria-label="Copy complete SVG data URI" onClick={()=>void copy(dataUri,"data-uri")}><Clipboard aria-hidden="true" /><span aria-live="polite">{copied==="data-uri"?"Copied":"COPY"}</span></button></header><pre><code>{dataUri}</code></pre></article></section><article className="svg-decoded-output"><header><strong>Formatted SVG output</strong><div><button type="button" aria-label="Copy decoded SVG markup" onClick={()=>void copy(svg,"svg")}><Clipboard aria-hidden="true" /><span aria-live="polite">{copied==="svg"?"Copied":"COPY SVG"}</span></button><button type="button" onClick={download}><ArrowDownToLine aria-hidden="true" /> DOWNLOAD .SVG</button></div></header><pre><code>{formattedSvg}</code></pre></article></div>:<p className="svg-empty">Encode SVG markup or decode a Base64 value to create copyable output.</p>}</section>
  </section>;
}
