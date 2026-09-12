"use client";

import {useMemo,useState} from "react";
import Link from "next/link";
import {ArrowUpRight,Search} from "lucide-react";
import {labCategoryOrder,type LabTool,type LabCategory} from "@/data/lab-tools";

const normalize=(value:string)=>value.toLocaleLowerCase().replace(/[^a-z0-9]+/g," ").trim();
const categoryFilters:readonly {label:string;value:LabCategory|"all"}[]=[
  {label:"All",value:"all"},{label:"Images",value:"Images"},{label:"PDF",value:"Documents"},
  {label:"Website",value:"Website & SEO"},{label:"Developer",value:"Developer & Design"},{label:"Everyday",value:"Everyday"},
];

export function LabDirectory({tools}:{tools:readonly LabTool[]}){
  const [query,setQuery]=useState("");
  const [category,setCategory]=useState<LabCategory|"all">("all");
  const normalized=normalize(query);
  const matches=useMemo(()=>{
    const terms=normalized.split(" ").filter(Boolean);
    return tools.filter(tool=>{
      if(category!=="all"&&tool.category!==category)return false;
      if(!terms.length)return true;
      const haystack=normalize([tool.title,tool.description,tool.category,...tool.searchTerms].join(" "));
      return terms.every(term=>haystack.includes(term));
    });
  },[normalized,tools,category]);

  return <section id="lab-tool-directory" className="lab-directory section" aria-label="Lab tools">
    <div className="lab-search"><label htmlFor="lab-search">What do you need?</label><div><Search aria-hidden="true"/><input id="lab-search" type="search" value={query} onChange={event=>setQuery(event.target.value)} placeholder="Search tools…" autoComplete="off"/></div><nav className="lab-category-filters" aria-label="Filter tools by category">{categoryFilters.map(filter=><button type="button" key={filter.value} aria-pressed={category===filter.value} onClick={()=>setCategory(filter.value)}>{filter.label}</button>)}</nav><p aria-live="polite">{query||category!=="all"?`${matches.length} ${matches.length===1?"tool":"tools"} found.`:"Search by task, file type or tool name."}</p></div>
{matches.length?labCategoryOrder.map(category=>{const categoryTools=matches.filter(tool=>tool.category===category);if(!categoryTools.length)return null;const id=`lab-${category.replaceAll(" ","-").replace("&","and").toLowerCase()}`;return <section className="lab-category" key={category} aria-labelledby={id}><header><h2 id={id}>{category}</h2><span>{String(categoryTools.length).padStart(2,"0")}</span></header><div>{categoryTools.map(tool=><article key={tool.slug} data-featured={tool.featured||undefined}><span>{tool.number}</span><div><h3><Link className="lab-card-link" href={`/lab/${tool.slug}`} aria-label={`Open ${tool.title}`}>{tool.title}</Link></h3><p>{tool.description}</p><nav aria-label={`${tool.title} links`}><span className="lab-tool-action" aria-hidden="true">Open tool <ArrowUpRight aria-hidden="true"/></span>{tool.documentationSlug&&<Link className="lab-documentation-action" href={`/writing/${tool.documentationSlug}`} aria-label={`Guide for ${tool.title}`}>Guide</Link>}</nav></div></article>)}</div></section>;}):<p className="lab-search-empty">No exact match. Try a task such as “join PDF”, “resize picture” or “make QR”.</p>}
  </section>;
}
