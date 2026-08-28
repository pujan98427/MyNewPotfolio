"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { useAdvertisingConsent } from "@/lib/advertising/cmp";

type ReportAdvertisement = {
  placement:"after-report-value"|"between-analysis-sections";
  context:"web-doctor-report";
  publisherContentId:string;
};

type EducationalAdvertisement = {
  placement:"before-supporting-guides";
  context:"educational-content";
  publisherContentId:string;
};

export type AdvertisementProps = (ReportAdvertisement|EducationalAdvertisement)&{children:ReactNode};

/**
 * The only approved wrapper for future advertising placements.
 *
 * Web Doctor placement policy:
 * 1. `after-report-value` comes only after score, priorities and quick wins.
 * 2. `between-analysis-sections` separates two substantial result sections.
 * 3. `before-supporting-guides` comes near the end of the experience.
 *
 * Do not render empty inventory. Keep the total at three or fewer until real
 * analytics support a change, and keep every placement outside tool controls
 * and individual diagnostic findings. The surrounding interface must never
 * ask, reward or pressure visitors to click, visit or support an advertiser;
 * "Advertisement" is the only site-authored label for this container.
 *
 * Mount this component only beside the completed publisher-created content
 * identified by `publisherContentId`. Never mount it in loading, error, empty,
 * authentication, redirect, not-found or acknowledgement-only states, and do
 * not create a route whose purpose is merely to host this component.
 */
export function Advertisement({children,placement,context,publisherContentId}:AdvertisementProps){
  const containerRef=useRef<HTMLElement>(null);
  const [isReady,setIsReady]=useState(false);
  const consent=useAdvertisingConsent();

  useEffect(()=>{
    const container=containerRef.current;
    if(!container)return;
    if(!("IntersectionObserver" in window)){const timer=setTimeout(()=>setIsReady(true),0);return()=>clearTimeout(timer);}
    const observer=new IntersectionObserver(entries=>{
      if(!entries.some(entry=>entry.isIntersecting))return;
      setIsReady(true);
      observer.disconnect();
    },{rootMargin:"400px 0px"});
    observer.observe(container);
    return ()=>observer.disconnect();
  },[]);

  if(children===null||children===undefined||children===false||consent==="not-configured"||consent==="rejected")return null;
  const canLoad=isReady&&consent==="accepted";
  return <aside ref={containerRef} className="advertisement" data-ad-placement={placement} data-ad-context={context} data-ad-state={canLoad?"ready":"reserved"} data-consent-state={consent} aria-label="Advertisement" aria-describedby={publisherContentId} aria-busy={!canLoad}><span>Advertisement</span><div>{canLoad?children:null}</div></aside>;
}
