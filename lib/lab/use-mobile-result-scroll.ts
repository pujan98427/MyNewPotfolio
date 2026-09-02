"use client";

import {useEffect,type RefObject} from "react";

export function useMobileResultScroll(active:boolean,resultRef:RefObject<HTMLElement|null>){
  useEffect(()=>{if(!active||!window.matchMedia("(max-width: 768px), (pointer: coarse)").matches)return;const frame=window.requestAnimationFrame(()=>resultRef.current?.scrollIntoView({behavior:window.matchMedia("(prefers-reduced-motion: reduce)").matches?"auto":"smooth",block:"start"}));return()=>window.cancelAnimationFrame(frame)},[active,resultRef]);
}
