"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowDownRight, ArrowUpRight } from "lucide-react";
import { useEffect, useRef } from "react";
import { PERSON_NAME, PERSON_ROLE } from "@/lib/identity";
import { useMagneticControl } from "@/components/interactions/use-magnetic-control";

export function HeroStage() {
  const stageRef = useRef<HTMLElement>(null);
  const primaryCtaMagnet=useMagneticControl<HTMLAnchorElement>();

  useEffect(() => {
    const stage = stageRef.current;
    if (!stage) return;

    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const finePointer = window.matchMedia("(pointer: fine)");
    let frame = 0;

    const updatePointer = (event: PointerEvent) => {
      if (reducedMotion.matches || !finePointer.matches) return;
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        const bounds = stage.getBoundingClientRect();
        const x = ((event.clientX - bounds.left) / bounds.width - 0.5) * 2;
        const y = ((event.clientY - bounds.top) / bounds.height - 0.5) * 2;
        stage.style.setProperty("--pointer-x", x.toFixed(3));
        stage.style.setProperty("--pointer-y", y.toFixed(3));
      });
    };

    const updateScroll = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        const progress = Math.min(Math.max(window.scrollY / Math.max(stage.offsetHeight, 1), 0), 1);
        stage.style.setProperty("--hero-scroll", progress.toFixed(3));
        stage.style.setProperty("--hero-clip-top", `${(4 - progress * 4).toFixed(3)}%`);
        stage.style.setProperty("--hero-clip-bottom", `${(2 - progress * 2).toFixed(3)}%`);
        stage.style.setProperty("--hero-image-scale", (0.985 + progress * 0.015).toFixed(4));
        stage.style.setProperty("--hero-image-y", `${(progress * 0.75).toFixed(3)}rem`);
      });
    };

    stage.addEventListener("pointermove", updatePointer, { passive: true });
    window.addEventListener("scroll", updateScroll, { passive: true });
    updateScroll();

    return () => {
      cancelAnimationFrame(frame);
      stage.removeEventListener("pointermove", updatePointer);
      window.removeEventListener("scroll", updateScroll);
    };
  }, []);

  return <section className="hero-stage" ref={stageRef} aria-labelledby="hero-title">
    <div className="hero-art" aria-hidden="true"><i /><i /><i /></div>
    <p className="hero-identity">{PERSON_NAME} <span>/</span> {PERSON_ROLE}</p>
    <h1 id="hero-title"><span className="hero-word hero-word-one">I turn ideas</span><span className="hero-word hero-word-two">into <em>interfaces.</em></span></h1>
    <div className="hero-support">
      <p>Frontend developer building fast, thoughtful and interactive web experiences.</p>
      <div className="hero-actions"><Link className="button button-primary" href="/work" {...primaryCtaMagnet}>Explore my work <ArrowUpRight aria-hidden="true" /></Link><Link className="button button-secondary" href="/lab">Explore the Lab <ArrowUpRight aria-hidden="true" /></Link></div>
    </div>
    <div className="hero-project-canvas hero-original-art">
      <div className="hero-portrait-frame">
        <div className="hero-portrait-entrance">
          <Image src="/pujan-chapagain-hero.png" alt={`${PERSON_NAME} wearing sunglasses`} width={1440} height={500} sizes="(max-width: 760px) 135vw, 58vw" priority />
        </div>
      </div>
    </div>
    <a className="hero-scroll-cue" href="#selected-work"><span>Scroll to work</span><ArrowDownRight aria-hidden="true" /></a>
  </section>;
}
