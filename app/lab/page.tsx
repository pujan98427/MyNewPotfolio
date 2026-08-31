import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { PageIntro } from "@/components/ui/page-intro";
import { labTools } from "@/data/lab-tools";
import { createPageMetadata } from "@/lib/seo/metadata";

export const metadata=createPageMetadata({title:"Free Web Tools — The Lab",description:"Use free, privacy-conscious tools for website diagnosis, metadata, colour contrast, responsive CSS, social sharing, and SVG conversion.",path:"/lab"});

export default function LabPage(){return <main id="main"><PageIntro index="03" eyebrow="Lab" title="Useful things for the web." description="Small tools I build for developers, designers and website owners." /><section className="section lab-list">{labTools.map(tool=><article key={tool.slug}><span>{tool.number}</span><div><small>{tool.category}</small><h2>{tool.title}</h2><p>{tool.description}</p><nav aria-label={`${tool.title} links`}><Link className="lab-tool-action" href={`/lab/${tool.slug}`} aria-label={`Open ${tool.title}`}>Open tool <ArrowUpRight aria-hidden="true" /></Link><Link className="lab-documentation-action" href={`/writing/${tool.documentationSlug}`} aria-label={`Read documentation for ${tool.title}`}>Read documentation <ArrowUpRight aria-hidden="true" /></Link></nav></div></article>)}</section></main>;}
