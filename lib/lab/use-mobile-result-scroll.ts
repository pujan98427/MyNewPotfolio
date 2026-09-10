"use client";

import {useEffect,type RefObject} from "react";

export function revealResultIfNeeded(region:HTMLElement){
  const bounds=region.getBoundingClientRect();
  const viewport=window.visualViewport;
  const headerHeight=parseFloat(getComputedStyle(document.documentElement).getPropertyValue("--sticky-header-height"))||0;
  const top=(viewport?.offsetTop??0)+headerHeight+24;
  const bottom=(viewport?.offsetTop??0)+(viewport?.height??window.innerHeight);
  // Reveal the beginning of a long report, not its bottom or the page footer.
  const visibleHeight=Math.min(bounds.height,160,Math.max(0,bottom-top));
  if(bounds.top>=top&&bounds.top+visibleHeight<=bottom)return;
  const delta=bounds.top<top?bounds.top-top:bounds.top+visibleHeight-bottom;
  window.scrollBy({top:delta,behavior:window.matchMedia("(prefers-reduced-motion: reduce)").matches?"instant":"smooth"});
}

export function useMobileResultScroll(active:boolean,resultRef:RefObject<HTMLElement|null>){
  useEffect(()=>{if(!active||!window.matchMedia("(max-width: 768px), (pointer: coarse)").matches)return;const frame=window.requestAnimationFrame(()=>{if(resultRef.current)revealResultIfNeeded(resultRef.current)});return()=>window.cancelAnimationFrame(frame)},[active,resultRef]);
}
