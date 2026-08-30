"use client";

import Image from "next/image";
import { ArrowDown } from "lucide-react";
import { useEffect, useRef } from "react";
import { PERSON_NAME, PERSON_ROLE } from "@/lib/identity";

export function HeroStage() {
  const stageRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const stage = stageRef.current;
    if (!stage) return;

    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const finePointer = window.matchMedia("(pointer: fine)");
    const simpleMobileMotion = window.matchMedia("(max-width: 1024px), (pointer: coarse)");
    let pointerFrame=0,scrollFrame=0,stageHeight=Math.max(stage.getBoundingClientRect().height,1),effectsActive=false;
    let pointerClientX=0,pointerClientY=0;

    const updatePointer = (event: PointerEvent) => {
      if (reducedMotion.matches || !finePointer.matches) return;
      pointerClientX=event.clientX;
      pointerClientY=event.clientY;
      if(pointerFrame)return;
      pointerFrame = requestAnimationFrame(() => {
        pointerFrame=0;
        const bounds = stage.getBoundingClientRect();
        const x = ((pointerClientX - bounds.left) / bounds.width - 0.5) * 2;
        const y = ((pointerClientY - bounds.top) / bounds.height - 0.5) * 2;
        stage.style.setProperty("--pointer-x", x.toFixed(3));
        stage.style.setProperty("--pointer-y", y.toFixed(3));
        stage.style.setProperty("--hero-pointer-x", `${(x * 3).toFixed(2)}px`);
        stage.style.setProperty("--hero-pointer-y", `${(y * 3).toFixed(2)}px`);
        stage.style.setProperty("--hero-rotate-x", `${(y * -1).toFixed(3)}deg`);
        stage.style.setProperty("--hero-rotate-y", `${x.toFixed(3)}deg`);
      });
    };

    const resetPointer = () => {
      cancelAnimationFrame(pointerFrame);
      pointerFrame=0;
      stage.style.setProperty("--pointer-x", "0");
      stage.style.setProperty("--pointer-y", "0");
      stage.style.setProperty("--hero-pointer-x", "0px");
      stage.style.setProperty("--hero-pointer-y", "0px");
      stage.style.setProperty("--hero-rotate-x", "0deg");
      stage.style.setProperty("--hero-rotate-y", "0deg");
    };

    const updateScroll = () => {
      if(scrollFrame)return;
      scrollFrame = requestAnimationFrame(() => {
        scrollFrame=0;
        const progress = Math.min(Math.max(window.scrollY / stageHeight, 0), 1);
        stage.style.setProperty("--hero-scroll", progress.toFixed(3));
        stage.style.setProperty("--hero-clip-top", `${(4 - progress * 4).toFixed(3)}%`);
        stage.style.setProperty("--hero-clip-bottom", `${(2 - progress * 2).toFixed(3)}%`);
        stage.style.setProperty("--hero-image-scale", (0.985 + progress * 0.015).toFixed(4));
        stage.style.setProperty("--hero-image-y", `${(progress * 0.75).toFixed(3)}rem`);
      });
    };

    const resetScroll = () => {
      cancelAnimationFrame(scrollFrame);
      scrollFrame=0;
      stage.style.setProperty("--hero-scroll", "0");
      stage.style.setProperty("--hero-clip-top", "4%");
      stage.style.setProperty("--hero-clip-bottom", "2%");
      stage.style.setProperty("--hero-image-scale", ".985");
      stage.style.setProperty("--hero-image-y", "0rem");
    };

    const sizeObserver=new ResizeObserver(entries=>{
      stageHeight=Math.max(entries[0]?.contentRect.height??stage.getBoundingClientRect().height,1);
    });

    const stopEffects=()=>{
      if(!effectsActive)return;
      effectsActive=false;
      stage.removeEventListener("pointermove", updatePointer);
      stage.removeEventListener("pointerleave", resetPointer);
      window.removeEventListener("scroll", updateScroll);
      resetPointer();
      resetScroll();
    };
    const syncEffects=()=>{
      const shouldRun=!simpleMobileMotion.matches&&!reducedMotion.matches&&document.visibilityState==="visible";
      if(!shouldRun){stopEffects();return;}
      if(!effectsActive){
        effectsActive=true;
        stage.addEventListener("pointermove", updatePointer, { passive: true });
        stage.addEventListener("pointerleave", resetPointer);
        window.addEventListener("scroll", updateScroll, { passive: true });
      }
      updateScroll();
    };

    sizeObserver.observe(stage);
    simpleMobileMotion.addEventListener("change",syncEffects);
    reducedMotion.addEventListener("change",syncEffects);
    finePointer.addEventListener("change",syncEffects);
    document.addEventListener("visibilitychange",syncEffects);
    syncEffects();

    return () => {
      stopEffects();
      sizeObserver.disconnect();
      simpleMobileMotion.removeEventListener("change",syncEffects);
      reducedMotion.removeEventListener("change",syncEffects);
      finePointer.removeEventListener("change",syncEffects);
      document.removeEventListener("visibilitychange",syncEffects);
    };
  }, []);

  return <section className="hero-stage" ref={stageRef} aria-labelledby="hero-title">
    <div className="hero-art" aria-hidden="true"><i /><i /><i /></div>
    <p className="hero-identity"><strong>{PERSON_NAME}</strong><i aria-hidden="true">/</i><span>{PERSON_ROLE}</span></p>
    <h1 id="hero-title">
      <span className="hero-line-mask hero-line-one"><span className="hero-word hero-word-one">I turn ideas</span></span>
      <span className="hero-line-mask hero-line-two"><span className="hero-word hero-word-two">into <em>interfaces.</em></span></span>
    </h1>
    <div className="hero-support">
      <p>Frontend developer building fast, thoughtful and interactive web experiences.</p>
    </div>
    <div className="hero-project-canvas hero-original-art">
      <div className="hero-portrait-frame">
        <div className="hero-portrait-entrance">
          <Image
            src="/pujan-chapagain-hero.png"
            alt={`${PERSON_NAME} wearing sunglasses`}
            width={1440}
            height={500}
            sizes="(max-width: 760px) 135vw, (max-height: 720px) min(60vw, 58rem), (max-height: 900px) min(66vw, 68rem), min(72vw, 82rem)"
            preload
          />
        </div>
      </div>
    </div>
    <a className="hero-scroll-cue" href="#selected-work"><span>Selected work</span><ArrowDown aria-hidden="true" /></a>
  </section>;
}
