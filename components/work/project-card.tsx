import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import type { Project } from "@/data/projects";

export function ProjectCard({project,index,priority=false}:{project:Project;index:number;priority?:boolean}){
  return <article className="project"><Link href={`/work/${project.slug}`}><div className="project-media"><Image src={project.image} alt={project.imageAlt} width={project.imageWidth} height={project.imageHeight} sizes="(max-width: 760px) 100vw, 66vw" priority={priority} /></div><div className="project-meta"><span>{String(index+1).padStart(2,"0")}</span><div><h2>{project.title}</h2><p>{project.summary}</p></div><div className="project-tags"><span>{project.type}</span><span>{project.stack.join(" · ")}</span></div><ArrowUpRight aria-hidden="true" /></div></Link></article>;
}
