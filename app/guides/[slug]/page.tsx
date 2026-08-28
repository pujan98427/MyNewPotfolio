import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { Breadcrumbs } from "@/components/navigation/breadcrumbs";
import { JsonLd } from "@/components/seo/json-ld";
import { getWebGuide, webGuides } from "@/data/web-guides";
import { createPageMetadata } from "@/lib/seo/metadata";
import { articleStructuredData } from "@/lib/seo/structured-data";

type Props={params:Promise<{slug:string}>};
export function generateStaticParams(){return webGuides.map(({slug})=>({slug}));}
export async function generateMetadata({params}:Props):Promise<Metadata>{const guide=getWebGuide((await params).slug);return guide?createPageMetadata({title:guide.title,description:guide.description,path:`/guides/${guide.slug}`,type:"article"}):{};}

export default async function GuidePage({params}:Props){
  const guide=getWebGuide((await params).slug);
  if(!guide)notFound();
  return <main id="main" className="guide-page">
    <Breadcrumbs items={[{label:"Web Doctor",href:"/lab/web-doctor"},{label:guide.title,href:`/guides/${guide.slug}`}]} />
    <JsonLd data={articleStructuredData({headline:guide.title,description:guide.description,path:`/guides/${guide.slug}`})} />
    <header><Link className="back-link" href="/lab/web-doctor"><ArrowLeft aria-hidden="true" /> Web Doctor</Link><p className="eyebrow">WEB DOCTOR GUIDE</p><h1>{guide.title}</h1><p>{guide.intro}</p></header>
    <article>{guide.sections.map((section,index)=><section key={section.title}><span>{String(index+1).padStart(2,"0")}</span><div><h2>{section.title}</h2>{section.body.map(paragraph=><p key={paragraph}>{paragraph}</p>)}{section.code&&<pre><code>{section.code}</code></pre>}</div></section>)}</article>
    <aside><p className="eyebrow">RELATED GUIDES</p>{guide.related.map(slug=>{const related=getWebGuide(slug);return related&&<Link href={`/guides/${slug}`} key={slug}>{related.title}<ArrowRight aria-hidden="true" /></Link>;})}<Link href="/lab/web-doctor">Check a website with Web Doctor <ArrowRight aria-hidden="true" /></Link></aside>
  </main>;
}
