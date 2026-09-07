"use client";

import {AdProvider} from "@/components/ads/AdProvider";
import {AdSlot} from "@/components/ads/AdSlot";
import {Advertisement} from "@/components/ui/advertisement";
import {adsenseConfigured} from "@/lib/advertising/config";

/** One restrained slot between complete, substantial article sections. */
export function DocumentationAdvertisement({publisherContentId}:{publisherContentId:string}){
  const slot=process.env.NEXT_PUBLIC_GOOGLE_ADSENSE_DOCUMENTATION_SLOT?.trim();
  if(!adsenseConfigured||!slot)return null;
  return <div className="documentation-ad-boundary">
    <AdProvider />
    <Advertisement placement="between-documentation-sections" context="lab-documentation" publisherContentId={publisherContentId}><AdSlot slot={slot}/></Advertisement>
  </div>;
}

