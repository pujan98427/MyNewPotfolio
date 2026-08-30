import Image from "next/image";
import Link from "next/link";
import { ArrowRight,ArrowUpRight } from "lucide-react";
import type { Project } from "@/data/projects";
import { ParallaxMedia,RevealImage,RevealText } from "@/components/interactions/reveal";

function ProjectDestination({project}:{project:Project}){
  if(project.ownership==="personal")return <Link className="button button-text project-external-link" href={project.internalPath} aria-label={`Read the ${project.title} case study`}>View case study <ArrowRight aria-hidden="true" /></Link>;
  return <a className="button button-external project-external-link" href={project.url} target="_blank" rel="nofollow noopener noreferrer" aria-label={`Visit the public ${project.title} website in a new tab`}>Visit site <ArrowUpRight aria-hidden="true" /></a>;
}

export function ProjectCard({project,index,priority=false}:{project:Project;index:number;priority?:boolean}){
  return <article className="project"><ParallaxMedia className="project-media"><RevealImage><Image src={project.image} alt={project.imageAlt} width={project.imageWidth} height={project.imageHeight} sizes="(max-width: 760px) 100vw, 66vw" preload={priority} /></RevealImage></ParallaxMedia><div className="project-meta"><span className="project-number">{String(index+1).padStart(2,"0")}</span><div className="project-copy"><p className="eyebrow">{project.relationship}</p><h2><RevealText>{project.title}</RevealText></h2><p>{project.summary}</p></div><div className="project-tags"><span>{project.type}</span><span>{project.stack.join(" · ")}</span><span>{project.period}</span></div><ProjectDestination project={project} /></div></article>;
}
