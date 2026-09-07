"use client";

import Script from "next/script";
import {useAdvertisingConsent,useAdvertisingPersonalizationConsent} from "@/lib/advertising/cmp";
import {adsenseClient,adsenseConfigured} from "@/lib/advertising/config";

/** Loads no advertising code until configuration and certified-CMP consent agree. */
export function AdProvider(){
  const consent=useAdvertisingConsent();
  const personalizationConsent=useAdvertisingPersonalizationConsent();
  const personalizationChoiceResolved=personalizationConsent==="accepted"||personalizationConsent==="rejected";
  if(!adsenseConfigured||consent!=="accepted"||!personalizationChoiceResolved)return null;
  return <Script id="adsense-provider" async strategy="lazyOnload" crossOrigin="anonymous" src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${encodeURIComponent(adsenseClient)}`}/>;
}
