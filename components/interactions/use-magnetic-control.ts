"use client";

import { useCallback } from "react";
import type { FocusEvent as ReactFocusEvent,PointerEvent as ReactPointerEvent } from "react";

const MAX_MAGNETIC_OFFSET=6;

function canMove(element:HTMLElement,event:ReactPointerEvent<HTMLElement>){
  return event.pointerType==="mouse"
    &&window.matchMedia("(hover: hover) and (pointer: fine)").matches
    &&!window.matchMedia("(prefers-reduced-motion: reduce)").matches
    &&!(element instanceof HTMLButtonElement&&element.disabled);
}

function reset(element:HTMLElement){
  element.style.setProperty("--magnetic-x","0px");
  element.style.setProperty("--magnetic-y","0px");
}

export function useMagneticControl<T extends HTMLElement>(){
  const onPointerMove=useCallback((event:ReactPointerEvent<T>)=>{
    const element=event.currentTarget;
    if(!canMove(element,event)){reset(element);return;}
    const bounds=element.getBoundingClientRect();
    const x=((event.clientX-bounds.left)/Math.max(bounds.width,1)-.5)*2;
    const y=((event.clientY-bounds.top)/Math.max(bounds.height,1)-.5)*2;
    element.style.setProperty("--magnetic-x",`${(x*MAX_MAGNETIC_OFFSET).toFixed(2)}px`);
    element.style.setProperty("--magnetic-y",`${(y*MAX_MAGNETIC_OFFSET).toFixed(2)}px`);
  },[]);
  const onPointerLeave=useCallback((event:ReactPointerEvent<T>)=>reset(event.currentTarget),[]);
  const onBlur=useCallback((event:ReactFocusEvent<T>)=>reset(event.currentTarget),[]);
  return {onPointerMove,onPointerLeave,onBlur,"data-magnetic":true as const};
}
