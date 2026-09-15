"use client";

import { useEffect } from "react";

export function NavigationRuntime(){
  useEffect(()=>{
    const header=document.querySelector("[data-site-header]"),dialog=document.querySelector("[data-command-dialog]"),trigger=document.querySelector("[data-command-trigger]"),close=document.querySelector("[data-command-close]"),input=document.querySelector("[data-command-input]"),empty=document.querySelector("[data-command-empty]");
    if(!(header instanceof HTMLElement)||!(dialog instanceof HTMLDialogElement)||!(trigger instanceof HTMLButtonElement)||!(close instanceof HTMLButtonElement)||!(input instanceof HTMLInputElement))return;

    const measureHeader=()=>{
      const nav=header.querySelector("nav"),rect=header.getBoundingClientRect(),height=Math.ceil(Math.max(rect.bottom,nav?.getBoundingClientRect().bottom??rect.bottom)-rect.top),root=document.documentElement,headerHeight=`${height}px`,stickyHeight=getComputedStyle(header).position==="sticky"?headerHeight:"0px";
      if(root.style.getPropertyValue("--header-height")!==headerHeight)root.style.setProperty("--header-height",headerHeight);
      if(root.style.getPropertyValue("--sticky-header-height")!==stickyHeight)root.style.setProperty("--sticky-header-height",stickyHeight);
    };
    const resizeObserver=typeof ResizeObserver==="undefined"?null:new ResizeObserver(measureHeader);
    resizeObserver?.observe(header);
    const nav=header.querySelector("nav");
    if(nav)resizeObserver?.observe(nav);

    let frame=0;
    const compact=()=>{
      if(frame)return;
      frame=window.requestAnimationFrame(()=>{frame=0;header.toggleAttribute("data-compact",window.scrollY>48);});
    };
    const open=()=>{
      if(dialog.open)return;
      input.value="";
      dialog.querySelectorAll<HTMLElement>("[data-command-link]").forEach(link=>link.removeAttribute("hidden"));
      empty?.setAttribute("hidden","");
      dialog.showModal();
      window.requestAnimationFrame(()=>input.focus());
    };
    const shut=()=>{dialog.close();trigger.focus();};
    const handleKeyDown=(event:KeyboardEvent)=>{if((event.ctrlKey||event.metaKey)&&event.key.toLowerCase()==="k"){event.preventDefault();open();}};
    const handleDialogClick=(event:MouseEvent)=>{if(event.target===dialog)shut();};
    const filterLinks=()=>{
      const query=input.value.trim().toLowerCase();
      let visible=0;
      dialog.querySelectorAll<HTMLElement>("[data-command-link]").forEach(link=>{const match=(link.textContent||"").toLowerCase().includes(query);link.toggleAttribute("hidden",!match);if(match)visible++;});
      empty?.toggleAttribute("hidden",visible>0);
    };

    measureHeader();
    compact();
    window.addEventListener("resize",measureHeader,{passive:true});
    window.addEventListener("scroll",compact,{passive:true});
    window.addEventListener("keydown",handleKeyDown);
    trigger.addEventListener("click",open);
    close.addEventListener("click",shut);
    dialog.addEventListener("click",handleDialogClick);
    input.addEventListener("input",filterLinks);

    return()=>{
      resizeObserver?.disconnect();
      if(frame)window.cancelAnimationFrame(frame);
      window.removeEventListener("resize",measureHeader);
      window.removeEventListener("scroll",compact);
      window.removeEventListener("keydown",handleKeyDown);
      trigger.removeEventListener("click",open);
      close.removeEventListener("click",shut);
      dialog.removeEventListener("click",handleDialogClick);
      input.removeEventListener("input",filterLinks);
    };
  },[]);

  return null;
}
