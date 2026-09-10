"use client";

import {useEffect,useState} from "react";
import {AdProvider} from "@/components/ads/AdProvider";
import {AdSlot} from "@/components/ads/AdSlot";
import {Advertisement} from "@/components/ui/advertisement";
import {adsenseConfigured} from "@/lib/advertising/config";
import {useAdvertisingConsent} from "@/lib/advertising/cmp";

const DIRECTORY_ID="lab-tool-directory";

/** One optional slot after the complete Lab directory, never inside search. */
export function LabIndexAdvertisement(){
  const consent=useAdvertisingConsent();
  const [hasDirectoryContent,setHasDirectoryContent]=useState(false);
  const slot=process.env.NEXT_PUBLIC_GOOGLE_ADSENSE_LAB_INDEX_SLOT?.trim();
  useEffect(()=>{
    if(!adsenseConfigured||!slot||consent==="rejected")return;
    const directory=document.getElementById(DIRECTORY_ID);
    if(!directory)return;
    const update=()=>setHasDirectoryContent(Boolean(directory.querySelector(".lab-category article")));
    update();
    const observer=new MutationObserver(update);
    observer.observe(directory,{childList:true,subtree:true});
    return()=>observer.disconnect();
  },[slot,consent]);
  if(!adsenseConfigured||!slot||!hasDirectoryContent||consent==="rejected")return null;
  return <div className="lab-index-ad-boundary">
    <AdProvider />
    <Advertisement placement="after-lab-directory" context="lab-index" publisherContentId={DIRECTORY_ID}><AdSlot slot={slot}/></Advertisement>
  </div>;
}
