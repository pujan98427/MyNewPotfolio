"use client";

import { useEffect,useRef } from "react";

type TurnstileApi={render:(container:HTMLElement,options:Record<string,unknown>)=>string;reset:(widgetId:string)=>void;remove:(widgetId:string)=>void};
declare global{interface Window{turnstile?:TurnstileApi}}

const SCRIPT_ID="cloudflare-turnstile-script";
const SCRIPT_URL="https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit";

export function TurnstileWidget({siteKey,onToken,resetKey}:{siteKey:string;onToken:(token:string)=>void;resetKey:number}){
  const containerRef=useRef<HTMLDivElement>(null),widgetIdRef=useRef<string|undefined>(undefined);
  useEffect(()=>{
    let cancelled=false;
    const render=()=>{if(cancelled||widgetIdRef.current||!containerRef.current||!window.turnstile)return;widgetIdRef.current=window.turnstile.render(containerRef.current,{sitekey:siteKey,action:"contact",theme:"auto",size:"flexible",appearance:"interaction-only",callback:(token:string)=>onToken(token),"expired-callback":()=>onToken(""),"error-callback":()=>{onToken("");return true;}});};
    const existing=document.getElementById(SCRIPT_ID) as HTMLScriptElement|null;
    if(window.turnstile)render();
    else if(existing)existing.addEventListener("load",render,{once:true});
    else{const script=document.createElement("script");script.id=SCRIPT_ID;script.src=SCRIPT_URL;script.async=true;script.defer=true;script.addEventListener("load",render,{once:true});document.head.appendChild(script);}
    return()=>{cancelled=true;existing?.removeEventListener("load",render);if(widgetIdRef.current&&window.turnstile){window.turnstile.remove(widgetIdRef.current);widgetIdRef.current=undefined;}};
  },[siteKey,onToken]);
  useEffect(()=>{if(widgetIdRef.current&&window.turnstile){window.turnstile.reset(widgetIdRef.current);onToken("");}},[resetKey,onToken]);
  return <div className="contact-turnstile" aria-label="Automated abuse protection"><div ref={containerRef} /></div>;
}
