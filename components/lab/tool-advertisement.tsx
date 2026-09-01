"use client";

import {useEffect,useRef,useState} from "react";
import {Advertisement} from "@/components/ui/advertisement";

type ToolAdPlacement="after-tool-result"|"after-tool-documentation";

/**
 * Consent-gated inventory mount point. It intentionally does not load an ad
 * provider by itself; provider code belongs in the certified CMP integration.
 */
export function ToolAdvertisementSlot({placement,publisherContentId}:{placement:ToolAdPlacement;publisherContentId:string}){
  const markerRef=useRef<HTMLSpanElement>(null);
  const [hasResult,setHasResult]=useState(placement!=="after-tool-result");
  const client=process.env.NEXT_PUBLIC_GOOGLE_ADSENSE_CLIENT?.trim();
  const slot=(placement==="after-tool-result"?process.env.NEXT_PUBLIC_GOOGLE_ADSENSE_TOOL_PRIMARY_SLOT:process.env.NEXT_PUBLIC_GOOGLE_ADSENSE_TOOL_SECONDARY_SLOT)?.trim();
  const inventory=client&&slot?<div className="adsense-inventory" data-ad-client={client} data-ad-slot={slot} data-ad-format="auto"/>:null;
  useEffect(()=>{
    if(placement!=="after-tool-result"||!client||!slot)return;
    const page=markerRef.current?.closest(".tool-page");if(!page)return;
    const update=()=>setHasResult(Boolean(page.querySelector(".resultHero")));
    const frame=requestAnimationFrame(update),observer=new MutationObserver(update);observer.observe(page,{childList:true,subtree:true});
    return()=>{cancelAnimationFrame(frame);observer.disconnect()};
  },[client,placement,slot]);
  if(!inventory)return null;
  return <><span ref={markerRef} className="ad-result-marker" aria-hidden="true"/>{hasResult&&<Advertisement placement={placement} context="tool-page" publisherContentId={publisherContentId}>{inventory}</Advertisement>}</>;
}
