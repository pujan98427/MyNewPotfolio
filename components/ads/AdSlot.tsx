"use client";

import {useEffect,useRef} from "react";
import {adsenseClient,adsenseConfigured} from "@/lib/advertising/config";

type AdSenseWindow=Window&{adsbygoogle?:Record<string,unknown>[]};

/** Provider-neutral placement primitive. Consent gating belongs to Advertisement. */
export function AdSlot({slot,format="horizontal"}:{slot:string;format?:"auto"|"fluid"|"rectangle"|"horizontal"}){
  const requested=useRef(false);
  useEffect(()=>{
    if(requested.current||!adsenseConfigured||!slot)return;
    requested.current=true;
    const browser=window as AdSenseWindow;
    (browser.adsbygoogle=browser.adsbygoogle??[]).push({});
  },[slot]);
  if(!adsenseConfigured||!slot)return null;
  return <ins className="adsbygoogle adsense-inventory" data-ad-client={adsenseClient} data-ad-slot={slot} data-ad-format={format} data-full-width-responsive="false"/>;
}
