"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowRight,ArrowUpRight } from "lucide-react";
import { useEffect,useRef,useState } from "react";
import type { Project } from "@/data/projects";

function ProjectDestination({project}:{project:Project}){
  if(project.ownership==="personal")return <Link href={project.internalPath} aria-label={`Read the ${project.title} case study`}>View case study <ArrowRight aria-hidden="true" /></Link>;
  return <a href={project.url} target="_blank" rel="nofollow noopener noreferrer" aria-label={`Visit the public ${project.title} website in a new tab`}>Visit website <ArrowUpRight aria-hidden="true" /></a>;
}

export function ProjectStory({projects}:{projects:readonly Project[]}){
  const [activeIndex,setActiveIndex]=useState(0),chaptersRef=useRef<(HTMLElement|null)[]>([]);
  useEffect(()=>{const observer=new IntersectionObserver(entries=>{const visible=entries.filter(entry=>entry.isIntersecting).sort((a,b)=>b.intersectionRatio-a.intersectionRatio)[0];if(!visible)return;const index=Number((visible.target as HTMLElement).dataset.index);if(Number.isFinite(index))setActiveIndex(index);},{rootMargin:"-22% 0px -38% 0px",threshold:[.15,.35,.6]});chaptersRef.current.forEach(chapter=>chapter&&observer.observe(chapter));return()=>observer.disconnect();},[]);
  return <div className="project-story"><div className="story-visual" aria-hidden="true"><div className="story-index"><span>Project</span><div className="story-number-window"><div className="story-number-track" style={{transform:`translate3d(0,${activeIndex*-1}em,0)`}}>{projects.map((_,index)=><b key={index}>{String(index+1).padStart(2,"0")}</b>)}</div></div><span>/ {String(projects.length).padStart(2,"0")}</span></div><div className="story-images"><Image key={projects[activeIndex].slug} className="is-active" src={projects[activeIndex].image} alt="" width={projects[activeIndex].imageWidth} height={projects[activeIndex].imageHeight} sizes="(max-width: 760px) 1px, 58vw" priority={activeIndex===0} /></div><p>{projects[activeIndex].type}<br />{projects[activeIndex].stack.join(" · ")}</p></div><div className="story-chapters">{projects.map((project,index)=><article className={index===activeIndex?"is-active":""} data-index={index} key={project.slug} ref={node=>{chaptersRef.current[index]=node;}}><span className="story-mobile-number">{String(index+1).padStart(2,"0")}</span><div className="story-mobile-image"><Image src={project.image} alt={project.imageAlt} width={project.imageWidth} height={project.imageHeight} sizes="(max-width: 760px) 100vw, 1px" /></div><div className="story-copy"><p>{project.relationship}</p><h3>{project.title}</h3><p>{project.summary}</p><span>{project.stack.join(" · ")}<br />{project.period}</span><ProjectDestination project={project} /></div></article>)}</div></div>;
}
