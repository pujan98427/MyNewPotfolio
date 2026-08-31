"use client";

import dynamic from "next/dynamic";
import { Mail } from "lucide-react";
import { useCallback,useEffect,useRef,useState } from "react";
import { trackProductEvent } from "@/lib/analytics/product-events";
import { CONTACT_OPEN_EVENT } from "@/lib/contact/open-event";
import styles from "./contact-chat.module.css";

const ContactPanel=dynamic(()=>import("@/components/contact/contact-panel").then(module=>module.ContactPanel),{ssr:false,loading:()=> <span className={styles.loading} role="status">Loading message form…</span>});

export function ContactChat({turnstileSiteKey}:{turnstileSiteKey:string|null}){
  const launcherRef=useRef<HTMLButtonElement>(null);
  const [open,setOpen]=useState(false),[startedAt,setStartedAt]=useState(0);
  const show=useCallback(()=>{if(open)return;trackProductEvent("contact_opened",{});setStartedAt(performance.now());setOpen(true);},[open]);
  const handleClosed=useCallback(()=>{setOpen(false);launcherRef.current?.focus();},[]);
  useEffect(()=>{window.addEventListener(CONTACT_OPEN_EVENT,show);return()=>window.removeEventListener(CONTACT_OPEN_EVENT,show);},[show]);
  return <div className={styles.root} data-open={open||undefined}><button ref={launcherRef} type="button" className={styles.trigger} aria-label="Message Pujan" aria-haspopup="dialog" aria-expanded={open} onClick={show}><Mail aria-hidden="true" /><span>Message Pujan</span></button>{open&&<ContactPanel turnstileSiteKey={turnstileSiteKey} startedAt={startedAt} onClosed={handleClosed} />}</div>;
}
