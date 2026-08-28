import Image from "next/image"; import Link from "next/link"; import { ArrowLeft, ArrowUpRight } from "lucide-react"; import { projects, type ProjectCaseStudy } from "@/data/projects"; import { Breadcrumbs } from "@/components/navigation/breadcrumbs"; import { JsonLd } from "@/components/seo/json-ld"; import { creativeWorkStructuredData } from "@/lib/seo/structured-data";

function Label({children}:{children:React.ReactNode}){ return <p className="case-label">{children}</p>; }

export function CaseStudy({project,index}:{project:ProjectCaseStudy;index:number}) { return <article className={`case-study case-layout-${project.layout}`}><Breadcrumbs items={[{label:"Work",href:"/work"},{label:project.title,href:`/work/${project.slug}`}]} />
  <JsonLd data={creativeWorkStructuredData({name:project.title,description:project.summary,path:`/work/${project.slug}`,image:project.image,externalUrl:project.url,year:project.year})} />
  <header className="case-hero"><Link className="back-link" href="/work"><ArrowLeft aria-hidden="true" /> All work</Link><div className="case-kicker"><span>{String(index+1).padStart(2,"0")} / {String(projects.length).padStart(2,"0")}</span><span>{project.type}</span></div><h1>{project.title}</h1><p className="case-summary">{project.summary}</p><dl className="case-facts">{project.year&&<><dt>Year</dt><dd>{project.year}</dd></>}<dt>Role</dt><dd>{project.role}</dd><dt>Technologies</dt><dd>{project.technologies.join(" · ")}</dd></dl></header>
  <figure className="case-image"><Image src={project.image} alt={project.imageAlt} width={project.imageWidth} height={project.imageHeight} priority sizes="100vw" /><figcaption>Interface overview / {project.title}</figcaption></figure>
  <div className="case-narrative">
    <section className="case-context"><Label>Context</Label><h2>{project.context}</h2></section>
    <section><Label>Challenge</Label><h2>A clear problem to solve.</h2><p>{project.challenge}</p></section>
    <section><Label>Responsibilities</Label><h2>The frontend remit.</h2><ol>{project.responsibilities.map((item,itemIndex)=><li key={item}><span>{String(itemIndex+1).padStart(2,"0")}</span>{item}</li>)}</ol></section>
    <figure className="case-detail-image"><div><Image src={project.image} alt="" width={project.imageWidth} height={project.imageHeight} sizes="(max-width:760px) 100vw, 70vw" /></div><figcaption>A cropped detail from the interface screenshot above</figcaption></figure>
    <section><Label>Implementation</Label><h2>From structure to interface.</h2><p>{project.implementation}</p></section>
    <section><Label>Notable frontend decisions</Label><h2>Details that hold the experience together.</h2><ul>{project.decisions.map(item=><li key={item}>{item}</li>)}</ul></section>
    <section><Label>Responsive behaviour</Label><h2>Recomposed for smaller screens.</h2><p>{project.responsive}</p></section>
    {project.result&&<section><Label>Result</Label><h2>Shipped, not speculative.</h2><p>{project.result}</p></section>}
  </div>
  <footer className="case-outro"><a href={project.url} target="_blank" rel="noreferrer">Visit live project <ArrowUpRight aria-hidden="true" /></a><Link href={`/work/${projects[index+1]?.slug??projects[0].slug}`}>Next project <ArrowUpRight aria-hidden="true" /></Link></footer>
  </article>; }
