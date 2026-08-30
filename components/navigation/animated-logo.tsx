"use client";

import { useEffect, useRef } from "react";

import {
  PUJAN_LOGO_DISPLAY_VIEW_BOX,
  pujanLogoLetterGroups,
  pujanLogoPaths,
} from "@/components/navigation/logo-geometry";

export function AnimatedLogo() {
  const logoRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    const logo = logoRef.current;
    if (!logo || typeof IntersectionObserver === "undefined") return;

    let isInViewport = true;
    const syncMotion = () => {
      logo.dataset.motionActive = String(
        isInViewport && document.visibilityState === "visible",
      );
    };
    const observer = new IntersectionObserver(([entry]) => {
      isInViewport = entry?.isIntersecting ?? false;
      syncMotion();
    });

    observer.observe(logo);
    document.addEventListener("visibilitychange", syncMotion);
    syncMotion();

    return () => {
      observer.disconnect();
      document.removeEventListener("visibilitychange", syncMotion);
    };
  }, []);

  return (
    <svg
      ref={logoRef}
      className="animated-logo"
      data-motion-active="true"
      viewBox={PUJAN_LOGO_DISPLAY_VIEW_BOX}
      role="img"
      aria-label="Pujan"
    >
      {/* pathLength normalizes each path's browser-measured length to 1. This
          keeps the CSS dash animation exact without guessed pixel lengths or
          a JavaScript measurement/animation loop. */}
      {pujanLogoLetterGroups.map(({ letter, paths }) => (
        <g key={letter} data-letter={letter}>
          {paths.map((name) => (
            <path
              key={`stroke-${name}`}
              className={`logo-stroke logo-letter-${letter} logo-segment-${name}`}
              pathLength="1"
              d={pujanLogoPaths[name]}
            />
          ))}
          {paths.map((name) => (
            <path
              key={`fill-${name}`}
              className={`logo-fill logo-letter-${letter} logo-segment-${name}`}
              d={pujanLogoPaths[name]}
            />
          ))}
        </g>
      ))}
      <path
        className="logo-glint"
        pathLength="1"
        d="M231 310 L247 227 M257 280 L289 259"
      />
    </svg>
  );
}
