"use client";

import { useSyncExternalStore } from "react";

export type AdvertisingConsent = "not-configured"|"pending"|"accepted"|"rejected";

export interface CertifiedCmpAdapter {
  certification:"google-certified-cmp";
  getAdvertisingConsent():AdvertisingConsent;
  getPersonalizationConsent():AdvertisingConsent;
  subscribe(listener:()=>void):()=>void;
}

let adapter:CertifiedCmpAdapter|null=null;
let unsubscribeFromAdapter:(()=>void)|null=null;
const adapterListeners=new Set<()=>void>();
function notifyListeners(){adapterListeners.forEach(listener=>listener());}

/**
 * Integration point for the SDK adapter supplied by a Google-certified CMP.
 * Registration must happen only when advertising is enabled and the CMP has
 * been configured for the relevant UK, EEA and Swiss consent requirements.
 * This module deliberately provides no homemade banner or consent inference.
 */
export function registerCertifiedCmpAdapter(nextAdapter:CertifiedCmpAdapter){
  unsubscribeFromAdapter?.();
  adapter=nextAdapter;
  unsubscribeFromAdapter=nextAdapter.subscribe(notifyListeners);
  notifyListeners();
  return ()=>{if(adapter===nextAdapter){unsubscribeFromAdapter?.();unsubscribeFromAdapter=null;adapter=null;notifyListeners();}};
}

function subscribe(listener:()=>void){
  adapterListeners.add(listener);
  return ()=>{adapterListeners.delete(listener);};
}

function getSnapshot():AdvertisingConsent{return adapter?.getAdvertisingConsent()??"not-configured";}
function getPersonalizationSnapshot():AdvertisingConsent{return adapter?.getPersonalizationConsent()??"not-configured";}

export function useAdvertisingConsent(){
  return useSyncExternalStore(subscribe,getSnapshot,()=>"not-configured");
}

/**
 * A rejected value is a resolved choice, not permission to personalise.
 * The certified CMP must communicate that choice through Google's consent
 * signals; this application does not infer or manufacture those signals.
 */
export function useAdvertisingPersonalizationConsent(){
  return useSyncExternalStore(subscribe,getPersonalizationSnapshot,()=>"not-configured");
}
