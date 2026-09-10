"use client";

import {useEffect,useRef,useState} from "react";
import {Advertisement} from "@/components/ui/advertisement";
import {AdSlot} from "@/components/ads/AdSlot";
import {AdProvider} from "@/components/ads/AdProvider";
import {adsenseConfigured} from "@/lib/advertising/config";
import {useAdvertisingConsent} from "@/lib/advertising/cmp";

type ToolAdPlacement="after-tool-result"|"after-tool-documentation";

/**
 * Consent-gated inventory mount point. It intentionally does not load an ad
 * provider by itself; provider code belongs in the certified CMP integration.
 */
export function ToolAdvertisementSlot({placement,publisherContentId}:{placement:ToolAdPlacement;publisherContentId:string}){
  const consent=useAdvertisingConsent();
  const markerRef=useRef<HTMLSpanElement>(null);
  const [hasResult,setHasResult]=useState(placement!=="after-tool-result");
  const slot=(placement==="after-tool-result"?process.env.NEXT_PUBLIC_GOOGLE_ADSENSE_TOOL_PRIMARY_SLOT:process.env.NEXT_PUBLIC_GOOGLE_ADSENSE_TOOL_SECONDARY_SLOT)?.trim();
  const inventory=adsenseConfigured&&slot?<AdSlot slot={slot}/>:null;
  useEffect(()=>{
    if(placement!=="after-tool-result"||!adsenseConfigured||!slot||consent==="rejected")return;
    const page=markerRef.current?.closest(".tool-page");if(!page)return;
    const update=()=>setHasResult(Boolean(page.querySelector(".resultHero"))&&!page.querySelector('[data-tool-processing="true"]'));
    const frame=requestAnimationFrame(update),observer=new MutationObserver(update);observer.observe(page,{childList:true,subtree:true});
    return()=>{cancelAnimationFrame(frame);observer.disconnect()};
  },[placement,slot,consent]);
  if(!inventory||consent==="rejected")return null;
  if(!hasResult)return <span ref={markerRef} className="ad-result-marker" aria-hidden="true"/>;
  return <div className="tool-ad-boundary" data-ad-separation={placement}>
    <AdProvider />
    <Advertisement placement={placement} context="tool-page" publisherContentId={publisherContentId}>{inventory}</Advertisement>
  </div>;
}
