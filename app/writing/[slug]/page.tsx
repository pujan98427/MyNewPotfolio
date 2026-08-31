import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, ArrowUpRight } from "lucide-react";
import { notFound } from "next/navigation";
import { Breadcrumbs } from "@/components/navigation/breadcrumbs";
import { JsonLd } from "@/components/seo/json-ld";
import { articles, getArticle } from "@/data/writing";
import { getLabTool } from "@/data/lab-tools";
import { createPageMetadata } from "@/lib/seo/metadata";
import { articleStructuredData } from "@/lib/seo/structured-data";

type Props={params:Promise<{slug:string}>};
export function generateStaticParams(){return articles.map(({slug})=>({slug}));}
export async function generateMetadata({params}:Props):Promise<Metadata>{const article=getArticle((await params).slug);return article?createPageMetadata({title:article.title,description:article.excerpt,path:`/writing/${article.slug}`,type:"article"}):{};}
export default async function ArticlePage({params}:Props){
  const article=getArticle((await params).slug);
  if(!article)notFound();
  const tool=getLabTool(article.toolSlug);
  return <main id="main"><article className="writing-detail"><Breadcrumbs items={[{label:"Lab notes",href:"/writing"},{label:article.title,href:`/writing/${article.slug}`}]} /><JsonLd data={articleStructuredData({headline:article.title,description:article.excerpt,path:`/writing/${article.slug}`,datePublished:article.date})} /><Link className="back-link" href="/writing"><ArrowLeft aria-hidden="true" /> All Lab notes</Link><header><p className="eyebrow">{tool?.title} · {article.readingTime}</p><h1>{article.title}</h1><p>{article.excerpt}</p><time dateTime={article.date}>{new Intl.DateTimeFormat("en-GB",{dateStyle:"long"}).format(new Date(article.date))}</time>{tool&&<Link className="article-tool-link" href={`/lab/${tool.slug}`}>Open {tool.title} <ArrowUpRight aria-hidden="true" /></Link>}</header><div className="article-body">{article.sections.map(section=><section key={section.heading}><h2>{section.heading}</h2><p>{section.body}</p></section>)}</div></article></main>;
}
