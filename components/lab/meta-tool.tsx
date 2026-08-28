"use client";

import { useEffect, useState } from "react";
import { readCrossToolState, saveCrossToolState } from "@/lib/lab/cross-tool-state";
import { CopySnippet } from "@/components/ui/copy-snippet";

export function MetaTool(){
  const [url,setUrl]=useState("https://example.com/thoughtful-page");
  const [title,setTitle]=useState("A clear, specific page title");
  const [description,setDescription]=useState("Describe the value of this page in natural language so people know why it deserves their click.");
  useEffect(()=>{const timer=window.setTimeout(()=>{const saved=readCrossToolState();if(saved.url)setUrl(saved.url);if(saved.title)setTitle(saved.title);if(saved.description)setDescription(saved.description);},0);return()=>window.clearTimeout(timer);},[]);
  const titleStatus=title.length<=60?"Good length":"Consider shortening";
  const descriptionStatus=description.length>=120&&description.length<=160?"Good length":"Use the space needed to describe the page clearly";
  let displayUrl=url;try{const parsed=new URL(url);displayUrl=`${parsed.hostname}${parsed.pathname}`;}catch{}
  const markup=`<title>${title}</title>\n<meta name="description" content="${description}" />`;
  return <div className="tool-card"><div className="field-stack"><label>Page URL<input inputMode="url" value={url} onChange={event=>{setUrl(event.target.value);saveCrossToolState({url:event.target.value});}} /></label><label>Page title<input value={title} maxLength={100} onChange={event=>{setTitle(event.target.value);saveCrossToolState({title:event.target.value});}} /><small>{title.length} characters · {titleStatus}</small></label><label>Meta description<textarea value={description} maxLength={240} onChange={event=>{setDescription(event.target.value);saveCrossToolState({description:event.target.value});}} /><small>{description.length} characters · {descriptionStatus}</small></label></div><div className="search-preview"><span>{displayUrl}</span><strong>{title||"Untitled page"}</strong><p>{description||"Add a helpful description for this page."}</p></div><CopySnippet code={markup} /></div>;
}
