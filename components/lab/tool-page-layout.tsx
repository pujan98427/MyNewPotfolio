import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { Breadcrumbs } from "@/components/navigation/breadcrumbs";
import { JsonLd } from "@/components/seo/json-ld";
import { ToolEducation } from "@/components/lab/tool-education";
import { labTools } from "@/data/lab-tools";
import { getToolEducation } from "@/data/tool-education";
import { webApplicationStructuredData } from "@/lib/seo/structured-data";

type SharedProps={title:string;description:string;path:`/lab/${string}`;children:React.ReactNode;variant?:"editorial"|"compact"|"product"};
type ToolPageLayoutProps=SharedProps&({immersive?:false;education?:never}|{immersive:true;education:React.ReactNode});

/** SEO and content contract shared by every interactive Lab tool. */
export function ToolPageLayout({title,description,path,children,variant="editorial",...mode}:ToolPageLayoutProps){
  const tool=labTools.find(item=>`/lab/${item.slug}`===path);
  if(!tool)throw new Error(`ToolPageLayout requires a registered Lab tool for ${path}.`);
  const standardEducation=getToolEducation(tool.slug);
  const immersive=mode.immersive===true;
  if(!immersive&&!standardEducation)throw new Error(`ToolPageLayout requires educational and privacy content for ${path}.`);
  const schema=webApplicationStructuredData({name:title,description,path,category:tool.category});
  return <main id="main"><section className={`tool-page tool-page-${variant} tool-page-${tool.slug}${immersive?" tool-page-immersive":""}`}>
    <Breadcrumbs items={[{label:"Lab",href:"/lab"},{label:title,href:path}]} />
    {!immersive&&<header><p className="eyebrow">Frontend lab</p><h1>{title}</h1><p>{description}</p></header>}
    {children}
    {immersive?mode.education:<ToolEducation content={standardEducation!} />}
    <aside className="tool-note-link"><p className="eyebrow">Notes from the Lab</p><Link href={`/writing/${tool.documentationSlug}`} aria-label={`Read documentation for ${tool.title}`}>Read how {tool.title} works <ArrowUpRight aria-hidden="true" /></Link></aside>
    <nav className="tool-switcher" aria-label="Other lab tools">{labTools.filter(item=>item.slug!==tool.slug).map(item=><Link href={`/lab/${item.slug}`} key={item.slug}><span>{item.number}</span>{item.title}<ArrowUpRight aria-hidden="true" /></Link>)}</nav>
    <JsonLd data={schema} />
  </section></main>;
}
