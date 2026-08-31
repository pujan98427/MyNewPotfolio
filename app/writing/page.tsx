import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { PageIntro } from "@/components/ui/page-intro";
import { articles } from "@/data/writing";
import { getLabTool } from "@/data/lab-tools";
import { createPageMetadata } from "@/lib/seo/metadata";

export const metadata=createPageMetadata({title:"Notes from the Lab",description:"Read practical documentation and implementation notes for Pujan Chapagain’s free browser and website tools.",path:"/writing"});

export default function WritingPage(){return <main id="main"><PageIntro index="08" eyebrow="Lab notes" title="Behind the tools." description="Practical notes about how each Lab tool works, what its output means, and where its limits begin." /><section className="section article-list" aria-label="Lab tool documentation">{articles.map(article=>{const tool=getLabTool(article.toolSlug);return <article key={article.slug}><time dateTime={article.date}>{new Intl.DateTimeFormat("en-GB",{dateStyle:"long"}).format(new Date(article.date))}</time><div><span>{tool?.title}</span><h2><Link href={`/writing/${article.slug}`}>{article.title}</Link></h2><p>{article.excerpt}</p><span>{article.readingTime}</span></div><Link href={`/writing/${article.slug}`} aria-label={`Read ${article.title}`}><ArrowUpRight aria-hidden="true" /></Link></article>;})}</section></main>;}
