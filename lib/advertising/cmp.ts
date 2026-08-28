"use client";

import { useSyncExternalStore } from "react";

export type AdvertisingConsent = "not-configured"|"pending"|"accepted"|"rejected";

export interface CertifiedCmpAdapter {
  getAdvertisingConsent():AdvertisingConsent;
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

export function useAdvertisingConsent(){
  return useSyncExternalStore(subscribe,getSnapshot,()=>"not-configured");
}
