"use client";

import Link from "next/link";
import { useEffect,useState } from "react";
import { usePathname } from "next/navigation";

export type PrimaryNavigationLink={
  href:string;
  label:string;
  sectionId:string;
};

export function PrimaryNavigation({links}:{links:readonly PrimaryNavigationLink[]}){
  const pathname=usePathname();
  const [activeSection,setActiveSection]=useState<string|null>(null);

  useEffect(()=>{
    if(pathname!=="/")return;
    const sections=links.map(link=>document.getElementById(link.sectionId)).filter((section):section is HTMLElement=>Boolean(section));
    if(!sections.length)return;
    const visible=new Map<string,IntersectionObserverEntry>();
    const observer=new IntersectionObserver(entries=>{
      for(const entry of entries)visible.set(entry.target.id,entry);
      const current=[...visible.values()].filter(entry=>entry.isIntersecting).sort((a,b)=>Math.abs(a.boundingClientRect.top)-Math.abs(b.boundingClientRect.top))[0];
      if(current)setActiveSection(current.target.id);
    },{rootMargin:"-18% 0px -62%",threshold:[0,.1,.35]});
    sections.forEach(section=>observer.observe(section));
    return()=>observer.disconnect();
  },[links,pathname]);

  return <nav aria-label="Primary navigation">
    {links.map(link=>{
      const active=pathname==="/"?activeSection===link.sectionId:link.sectionId==="lab"&&pathname.startsWith("/lab");
      return <Link key={link.href} href={link.href} aria-current={active?"location":undefined}>{link.label}</Link>;
    })}
  </nav>;
}
