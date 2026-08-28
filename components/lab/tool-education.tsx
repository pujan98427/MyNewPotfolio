import Link from "next/link";
import type { ToolEducation as ToolEducationContent } from "@/data/tool-education";

export function ToolEducation({content}:{content:ToolEducationContent}){return <section className="tool-education" aria-labelledby={`${content.slug}-education-heading`}>
  <header><p className="eyebrow">ABOUT THIS TOOL</p><h2 id={`${content.slug}-education-heading`}>Use it with context.</h2><p>{content.summary}</p></header>
  <div className="tool-education-overview"><article><h3>Who it helps</h3><p>{content.audience}</p></article><article><h3>How it works</h3><p>{content.howItWorks}</p></article><article><h3>Privacy</h3><p>{content.privacy}</p></article></div>
  <section><p className="eyebrow">HOW TO USE IT</p><h2>A practical workflow.</h2><ol>{content.steps.map((step,index)=><li key={step}><span>{String(index+1).padStart(2,"0")}</span><p>{step}</p></li>)}</ol></section>
  <section><p className="eyebrow">COMMON PROBLEMS</p><h2>What the output cannot decide for you.</h2><div className="tool-problems">{content.commonProblems.map(problem=><article key={problem.title}><h3>{problem.title}</h3><p>{problem.body}</p></article>)}</div></section>
  <nav aria-label="Related tools and guides"><p className="eyebrow">RELATED TOOLS AND GUIDES</p>{content.related.map(item=><Link href={item.href} key={item.href}><strong>{item.label}</strong><span>{item.description}</span><i aria-hidden="true">→</i></Link>)}</nav>
</section>}
