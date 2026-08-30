import type { ReactNode } from "react";

type MotionPrimitiveProps = { children?: ReactNode; className?: string };
const classes = (base: string, className?: string) => className ? `${base} ${className}` : base;

export function RevealText({ children, className }: MotionPrimitiveProps) {
  return <span className={classes("motion-reveal-text", className)}>{children}</span>;
}

export function RevealLine({ className }: Omit<MotionPrimitiveProps, "children">) {
  return <span className={classes("motion-reveal-line", className)} aria-hidden="true" />;
}

export function RevealImage({ children, className }: MotionPrimitiveProps) {
  return <div className={classes("motion-reveal-image", className)}>{children}</div>;
}

export function SectionIntro({ children, className }: MotionPrimitiveProps) {
  return <header className={classes("motion-section-intro", className)}>{children}</header>;
}

export function ParallaxMedia({ children, className }: MotionPrimitiveProps) {
  return <div className={classes("motion-parallax-media", className)}>{children}</div>;
}
