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

  return <section
    id="lab-tool-directory"
    className="
      lab-directory grid gap-6 border-t border-ink
      px-[max(var(--spacing-gutter),calc((100vw-100rem)/2))] py-6 pb-0
    "
    aria-label="Lab tools"
  >
    <div className="lab-search grid max-w-[62rem] gap-2">
      <label className="font-display text-[clamp(1.5rem,3vw,2.25rem)] leading-[1.15]" htmlFor="lab-search">
        What do you need?
      </label>
      <div className="grid grid-cols-[auto_minmax(0,1fr)] items-center border-b border-ink">
        <Search className="w-5" aria-hidden="true"/>
        <input
          className="w-full border-0 bg-transparent px-4 py-3 text-base text-ink"
          id="lab-search"
          type="search"
          value={query}
          onChange={event=>setQuery(event.target.value)}
          placeholder="Search tools…"
          autoComplete="off"
        />
      </div>
      <nav className="lab-category-filters flex flex-wrap gap-x-3 gap-y-1" aria-label="Filter tools by category">
        {categoryFilters.map(filter=><button
          className="
            min-h-11 cursor-pointer border-0 border-b-2 border-b-transparent bg-transparent
            px-1 py-2 text-[.85rem] text-ink transition-[color,border-color]
            duration-fast ease-out hover:text-brand-strong active:bg-brand-soft
            focus-visible:outline-2 focus-visible:outline-offset-[3px] focus-visible:outline-brand-strong
            aria-pressed:border-b-current aria-pressed:font-bold aria-pressed:text-brand-strong
            motion-reduce:transition-none
          "
          type="button"
          key={filter.value}
          aria-pressed={category===filter.value}
          onClick={()=>setCategory(filter.value)}
        >{filter.label}</button>)}
      </nav>
      <p className="m-0 text-muted" aria-live="polite">
        {query||category!=="all"?`${matches.length} ${matches.length===1?"tool":"tools"} found.`:"Search by task, file type or tool name."}
      </p>
    </div>
    {matches.length?labCategoryOrder.map(category=>{
      const categoryTools=matches.filter(tool=>tool.category===category);
      if(!categoryTools.length)return null;
      const id=`lab-${category.replaceAll(" ","-").replace("&","and").toLowerCase()}`;
      return <section className="lab-category" key={category} aria-labelledby={id}>
        <header className="grid grid-cols-[minmax(0,1fr)_auto] items-end border-b border-ink pb-3">
          <h2 className="m-0 font-display text-[clamp(1.75rem,3vw,2.5rem)] font-normal leading-[1.2] tracking-[-.045em]" id={id}>{category}</h2>
          <span className="text-[.7rem] text-muted">{String(categoryTools.length).padStart(2,"0")}</span>
        </header>
        <div className="grid grid-cols-2 max-[760px]:grid-cols-1 lg:grid-cols-3 lg:gap-x-6">
          {categoryTools.map(tool=><article
            className="
              group/card relative isolate grid h-auto min-h-0 grid-cols-[1.1rem_minmax(0,1fr)]
              content-start gap-x-2 self-start border-b border-[var(--rule-hairline)] py-3
              odd:border-r odd:border-r-[var(--rule-hairline)] odd:pr-[clamp(1rem,3vw,3rem)]
              even:pl-[clamp(1rem,3vw,3rem)]
              transition-[background-color,box-shadow] duration-fast ease-out
              max-[760px]:border-r-0 max-[760px]:px-0
              lg:border-r-0 lg:px-0
              [@media(hover:hover)_and_(pointer:fine)]:hover:bg-[color-mix(in_srgb,var(--color-brand)_6%,transparent)]
              [@media(hover:hover)_and_(pointer:fine)]:hover:shadow-[inset_0_0_0_1px_color-mix(in_srgb,var(--color-brand)_40%,transparent)]
              focus-within:bg-[color-mix(in_srgb,var(--color-brand)_6%,transparent)]
              motion-reduce:transition-none
            "
            key={tool.slug}
            data-featured={tool.featured||undefined}
          >
            <span className="pt-[.3rem] text-[.625rem] font-normal tracking-normal text-muted [font-variant-numeric:tabular-nums]">{tool.number}</span>
            <div>
              <h3 className="m-0 font-display text-[1.3rem] font-normal leading-[1.2] transition-[color,text-indent] duration-fast ease-out group-hover/card:text-brand-strong [@media(hover:hover)_and_(pointer:fine)]:group-hover/card:[text-indent:2px] motion-reduce:transition-none motion-reduce:group-hover/card:[text-indent:0]">
                <Link
                  className="
                    lab-card-link text-inherit no-underline after:absolute after:inset-0
                    after:z-[1] after:cursor-pointer focus-visible:outline-none
                    focus-visible:after:outline-2 focus-visible:after:outline-offset-[3px]
                    focus-visible:after:outline-brand-strong
                  "
                  href={`/lab/${tool.slug}`}
                  aria-label={`Open ${tool.title}`}
                >{tool.title}</Link>
              </h3>
              <p className="my-[.4rem] mb-1 max-w-[35rem] text-[.9rem] leading-[1.5] text-muted">{tool.description}</p>
              <nav className="flex flex-wrap gap-x-4 gap-y-1" aria-label={`${tool.title} links`}>
                <span className="lab-tool-action inline-flex min-h-11 items-center gap-[.4rem] text-base font-bold text-brand-strong" aria-hidden="true">
                  Open tool
                  <ArrowUpRight className="w-4 transition-transform duration-fast ease-out [@media(hover:hover)_and_(pointer:fine)]:group-hover/card:translate-x-[3px] [@media(hover:hover)_and_(pointer:fine)]:group-hover/card:-translate-y-0.5 motion-reduce:transform-none motion-reduce:transition-none" aria-hidden="true"/>
                </span>
                {tool.documentationSlug&&<Link
                  className="
                    lab-documentation-action relative z-[2] inline-flex min-h-11 items-center gap-[.4rem]
                    text-[.75rem] font-normal tracking-normal text-muted no-underline
                    hover:text-ink hover:underline hover:underline-offset-[.2em]
                    focus-visible:text-ink focus-visible:underline focus-visible:underline-offset-[.2em]
                  "
                  href={`/writing/${tool.documentationSlug}`}
                  aria-label={`Guide for ${tool.title}`}
                >Guide</Link>}
              </nav>
            </div>
          </article>)}
        </div>
      </section>;
    }):<p className="lab-search-empty m-0 text-muted">No exact match. Try a task such as “join PDF”, “resize picture” or “make QR”.</p>}
  </section>;
}
