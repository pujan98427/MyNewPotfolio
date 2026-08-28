"use client";

import { useEffect, useRef, useState } from "react";
import { Clipboard } from "lucide-react";

export function CopySnippet({code,onCopied}:{code:string;onCopied?:()=>void}){
  const [copied,setCopied]=useState(false);
  const resetTimer=useRef<number|null>(null);
  useEffect(()=>()=>{if(resetTimer.current!==null)window.clearTimeout(resetTimer.current);},[]);
  async function copy(){try{await navigator.clipboard.writeText(code);onCopied?.();setCopied(true);if(resetTimer.current!==null)window.clearTimeout(resetTimer.current);resetTimer.current=window.setTimeout(()=>setCopied(false),1800);}catch{setCopied(false);}}
  return <div className="copy-snippet"><pre><code>{code}</code></pre><button type="button" onClick={()=>void copy()} aria-label={copied?"Code snippet copied":"Copy code snippet"}><Clipboard aria-hidden="true" /> <span aria-live="polite">{copied?"Copied":"Copy"}</span></button></div>;
}
