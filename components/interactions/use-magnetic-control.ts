"use client";

import { useCallback,useEffect,useRef } from "react";
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
  const frameRef=useRef(0);
  const pendingRef=useRef<{element:T;clientX:number;clientY:number}|null>(null);

  useEffect(()=>()=>cancelAnimationFrame(frameRef.current),[]);

  const onPointerMove=useCallback((event:ReactPointerEvent<T>)=>{
    const element=event.currentTarget;
    if(!canMove(element,event)){reset(element);return;}
    pendingRef.current={element,clientX:event.clientX,clientY:event.clientY};
    if(frameRef.current)return;
    frameRef.current=requestAnimationFrame(()=>{
      frameRef.current=0;
      const pending=pendingRef.current;
      if(!pending)return;
      const bounds=pending.element.getBoundingClientRect();
      const x=((pending.clientX-bounds.left)/Math.max(bounds.width,1)-.5)*2;
      const y=((pending.clientY-bounds.top)/Math.max(bounds.height,1)-.5)*2;
      pending.element.style.setProperty("--magnetic-x",`${(x*MAX_MAGNETIC_OFFSET).toFixed(2)}px`);
      pending.element.style.setProperty("--magnetic-y",`${(y*MAX_MAGNETIC_OFFSET).toFixed(2)}px`);
    });
  },[]);
  const onPointerLeave=useCallback((event:ReactPointerEvent<T>)=>{pendingRef.current=null;cancelAnimationFrame(frameRef.current);frameRef.current=0;reset(event.currentTarget);},[]);
  const onBlur=useCallback((event:ReactFocusEvent<T>)=>reset(event.currentTarget),[]);
  return {onPointerMove,onPointerLeave,onBlur,"data-magnetic":true as const};
}
