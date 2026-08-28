"use client";

import { useEffect, useState } from "react";
import { readCrossToolState, saveCrossToolState } from "@/lib/lab/cross-tool-state";
import { CopySnippet } from "@/components/ui/copy-snippet";

export function OpenGraphTool(){
  const [siteName,setSiteName]=useState("Your website");
  const [title,setTitle]=useState("A clear title for shared links");
  const [description,setDescription]=useState("Explain what people will find when they open this page.");
  const [url,setUrl]=useState("https://example.com/page");
  const [image,setImage]=useState("https://example.com/social-image.jpg");
  useEffect(()=>{const timer=window.setTimeout(()=>{const saved=readCrossToolState();if(saved.url)setUrl(saved.url);if(saved.title)setTitle(saved.title);if(saved.description)setDescription(saved.description);},0);return()=>window.clearTimeout(timer);},[]);
  let domain="example.com";try{domain=new URL(url).hostname;}catch{}
  const markup=`<meta property="og:title" content="${title}" />\n<meta property="og:description" content="${description}" />\n<meta property="og:url" content="${url}" />\n<meta property="og:image" content="${image}" />\n<meta property="og:site_name" content="${siteName}" />`;
  return <div className="tool-card open-graph-tool"><div className="field-stack"><label>Site name<input value={siteName} onChange={event=>setSiteName(event.target.value)} /></label><label>Page title<input value={title} onChange={event=>{setTitle(event.target.value);saveCrossToolState({title:event.target.value});}} /></label><label>Description<textarea value={description} onChange={event=>{setDescription(event.target.value);saveCrossToolState({description:event.target.value});}} /></label><label>Page URL<input inputMode="url" value={url} onChange={event=>{setUrl(event.target.value);saveCrossToolState({url:event.target.value});}} /></label><label>Image URL<input inputMode="url" value={image} onChange={event=>setImage(event.target.value)} /></label></div><div><section className="og-tool-preview" aria-label="Open Graph sharing preview"><div className="og-tool-image"><span>IMAGE PREVIEW AREA</span><small>{image||"Add a public image URL"}</small></div><div><small>{domain}</small><strong>{title||"Untitled page"}</strong><p>{description||"Add a useful description."}</p></div></section><p className="tool-note">Platforms crop images and may display different text. This preview does not contact or download the supplied image.</p><CopySnippet code={markup} /></div></div>;
}
