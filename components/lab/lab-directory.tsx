"use client";

import {useMemo,useState} from "react";
import Link from "next/link";
import {ArrowUpRight,Search} from "lucide-react";
import {labCategoryOrder,type LabTool} from "@/data/lab-tools";

const normalize=(value:string)=>value.toLocaleLowerCase().replace(/[^a-z0-9]+/g," ").trim();

export function LabDirectory({tools}:{tools:readonly LabTool[]}){
  const [query,setQuery]=useState("");
  const normalized=normalize(query);
  const matches=useMemo(()=>{
    const terms=normalized.split(" ").filter(Boolean);
    return tools.filter(tool=>{
      if(!terms.length)return true;
      const haystack=normalize([tool.title,tool.description,tool.category,...tool.keywords].join(" "));
      return terms.every(term=>haystack.includes(term));
    });
  },[normalized,tools]);

  return <section className="lab-directory section" aria-label="Lab tools">
    <div className="lab-search"><label htmlFor="lab-search">What do you need to do?</label><div><Search aria-hidden="true"/><input id="lab-search" type="search" value={query} onChange={event=>setQuery(event.target.value)} placeholder="make an image smaller…" autoComplete="off"/></div><p aria-live="polite">{query?`${matches.length} ${matches.length===1?"tool":"tools"} found.`:"Search by task, file type or tool name."}</p></div>
    {matches.length?labCategoryOrder.map(category=>{const categoryTools=matches.filter(tool=>tool.category===category);if(!categoryTools.length)return null;const id=`lab-${category.replaceAll(" ","-").replace("&","and").toLowerCase()}`;return <section className="lab-category" key={category} aria-labelledby={id}><header><h2 id={id}>{category}</h2><span>{String(categoryTools.length).padStart(2,"0")}</span></header><div>{categoryTools.map(tool=><article key={tool.slug} data-featured={tool.featured||undefined}><span>{tool.number}</span><div><h3>{tool.title}</h3><p>{tool.description}</p><nav aria-label={`${tool.title} links`}><Link className="lab-tool-action" href={`/lab/${tool.slug}`} aria-label={`Open ${tool.title}`}>Open tool <ArrowUpRight aria-hidden="true"/></Link>{tool.documentationSlug&&<Link className="lab-documentation-action" href={`/writing/${tool.documentationSlug}`} aria-label={`Read documentation for ${tool.title}`}>Read documentation <ArrowUpRight aria-hidden="true"/></Link>}</nav></div></article>)}</div></section>;}):<p className="lab-search-empty">No exact match. Try a task such as “join PDF”, “resize picture” or “make QR”.</p>}
  </section>;
}
