import Link from "next/link";
import type { ReactNode } from "react";
import { ArrowUpRight } from "lucide-react";
import { Breadcrumbs } from "@/components/navigation/breadcrumbs";
import { JsonLd } from "@/components/seo/json-ld";
import { ToolEducation } from "@/components/lab/tool-education";
import { ToolAdvertisementSlot } from "@/components/lab/tool-advertisement";
import { labTools } from "@/data/lab-tools";
import { getToolEducation } from "@/data/tool-education";
import { webApplicationStructuredData } from "@/lib/seo/structured-data";
import { ToolOpenedEvent } from "@/components/analytics/tool-opened-event";

type SharedProps={title:string;description:string;path:`/lab/${string}`;children:ReactNode;variant?:"editorial"|"compact"|"product";supplementalDocumentation?:ReactNode;advertisement?:ReactNode};
type ToolPageLayoutProps=SharedProps&({immersive?:false;education?:never}|{immersive:true;education:React.ReactNode});

/** SEO and content contract shared by every interactive Lab tool. */
export function ToolPageLayout({title,description,path,children,variant="editorial",supplementalDocumentation,advertisement,...mode}:ToolPageLayoutProps){
  const tool=labTools.find(item=>`/lab/${item.slug}`===path);
  if(!tool)throw new Error(`ToolPageLayout requires a registered Lab tool for ${path}.`);
  // Established tools use the detailed data record; newer local utilities use
  // the server-rendered fallback below, which requires educational and privacy content.
  const standardEducation=getToolEducation(tool.slug);
  const immersive=mode.immersive===true;
  const compactWorkspace=["contrast-checker","clamp-generator","random-picker","svg-base64-converter"].includes(tool.slug);
  const relatedTools=labTools.filter(item=>item.slug!==tool.slug&&item.category===tool.category).slice(0,4);
  const schema=webApplicationStructuredData({name:title,description,path,category:tool.category});
  const actionLinkClass=[
    "group/link inline-flex items-center gap-[.45rem] bg-[linear-gradient(var(--color-link-hover),var(--color-link-hover))]",
    "bg-left-bottom bg-no-repeat bg-[length:0_1px] text-[.78rem] font-bold uppercase tracking-[.05em] text-link",
    "[transition:background-size_var(--duration-medium)_var(--ease-smooth),color_var(--duration-fast)_var(--ease-smooth),transform_var(--duration-fast)_var(--ease-out)]",
    "hover:translate-x-px hover:bg-[length:100%_1px] hover:text-link-hover focus-visible:translate-x-px focus-visible:bg-[length:100%_1px] focus-visible:text-link-hover",
    "motion-reduce:transition-none",
  ].join(" ");
  return <main id="main"><section className={[
    "tool-page min-h-0 px-[2.2rem] pb-20 pt-[clamp(1.5rem,3vw,2.5rem)]",
    "max-[820px]:px-4 max-[820px]:pb-16 print:max-w-none print:p-0",
    `tool-page-${variant}`,
    `tool-page-${tool.slug}`,
    immersive?"tool-page-immersive":"",
  ].filter(Boolean).join(" ")}>
    <ToolOpenedEvent toolName={tool.slug} />
    <Breadcrumbs items={[{label:"Lab",href:"/lab"},{label:title,href:path}]} />
    {!immersive&&<header className="tool-product-intro grid max-w-[56rem] grid-cols-[minmax(0,1fr)] gap-3 print:hidden">
      <h1 className="col-start-1 m-0 max-w-[18ch] text-[clamp(3rem,4vw,4rem)] leading-[.95] tracking-[-.045em] max-[760px]:text-[clamp(2rem,9vw,2.625rem)]">{title}</h1>
      <p className="col-start-1 m-0 max-w-[42rem] text-lead leading-[1.6] text-muted">{description}</p>
    </header>}
    {immersive?children:<section className={["tool-workspace",compactWorkspace?"mt-4":"mt-[clamp(1.25rem,2vw,2rem)]"].join(" ")} id={`${tool.slug}-workspace`} aria-label={`${title} workspace`}>{children}</section>}
    {!immersive&&<section className="tool-next-actions mt-8 flex flex-wrap items-center gap-x-6 gap-y-3 border-t border-[var(--rule-hairline)] py-4" aria-labelledby={`${tool.slug}-next-actions`}>
      <h2 className="m-0 max-w-[18ch] text-base font-semibold leading-6" id={`${tool.slug}-next-actions`}>Continue</h2>
      <div className="flex flex-wrap gap-x-8 gap-y-4">
        {tool.documentationSlug&&<Link href={`/writing/${tool.documentationSlug}`} aria-label={`Guide for ${tool.title}`} className={`${actionLinkClass} tool-guide-link text-[.8rem] font-normal normal-case tracking-normal text-muted`}>Guide</Link>}
        <Link className={actionLinkClass} href="/lab">Find another tool <ArrowUpRight className="w-4 transition-transform duration-fast ease-out group-hover/link:translate-x-[3px] group-hover/link:-translate-y-[3px] group-focus-visible/link:translate-x-[3px] group-focus-visible/link:-translate-y-[3px] motion-reduce:transform-none motion-reduce:transition-none" aria-hidden="true" /></Link>
      </div>
    </section>}
    {!immersive&&tool.advertisingEligible&&<ToolAdvertisementSlot placement="after-tool-result" publisherContentId={`${tool.slug}-workspace`} />}
    {!immersive&&!tool.advertisingEligible&&advertisement}
    <div id={`${tool.slug}-documentation`}>{immersive?mode.education:standardEducation?<ToolEducation content={standardEducation} />:<section className="tool-education"><header><p className="eyebrow">About this tool</p><h2>A direct route from input to result.</h2></header><div><h3>How it works</h3><p>{description} The interactive work happens locally in your browser, so your selected files or entered choices are not uploaded to this site.</p><h3>Before you download</h3><p>Review the preview, dimensions or file-size information shown by the tool. Keep the original file until you have checked that the downloaded result suits its intended use.</p><h3>Privacy</h3><p>This tool has no account and does not store your input. Closing or refreshing the page clears the current workspace.</p></div></section>}{supplementalDocumentation}</div>
    {tool.advertisingEligible&&<ToolAdvertisementSlot placement="after-tool-documentation" publisherContentId={`${tool.slug}-documentation`} />}
    <section className="tool-related mt-[clamp(2rem,4vw,3rem)]" aria-labelledby={`${tool.slug}-related`}>
      <h2 className="m-0 max-w-[18ch] font-display text-[clamp(1.75rem,3vw,3rem)] font-normal leading-none" id={`${tool.slug}-related`}>Related tools</h2>
      <nav className="tool-switcher mt-4 max-w-[90rem] border-t-0 print:hidden" aria-label="Related lab tools">
        {relatedTools.map(item=><Link className="group/related grid grid-cols-[minmax(0,1fr)_auto] items-center gap-4 border-b border-[var(--rule-hairline)] py-[.85rem] hover:text-link-hover focus-visible:text-link-hover" href={`/lab/${item.slug}`} key={item.slug}>{item.title}<ArrowUpRight className="w-4 transition-transform duration-medium ease-smooth group-hover/related:translate-x-[3px] group-hover/related:-translate-y-0.5 group-focus-visible/related:translate-x-[3px] group-focus-visible/related:-translate-y-0.5 motion-reduce:transform-none motion-reduce:transition-none" aria-hidden="true" /></Link>)}
      </nav>
    </section>
    <JsonLd data={schema} />
  </section></main>;
}
