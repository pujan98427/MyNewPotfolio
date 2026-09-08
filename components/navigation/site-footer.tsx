"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { PERSON_NAME } from "@/lib/identity";

type FooterVariant = "home" | "legal";

const legalLinks = [
  { href: "/privacy", label: "Privacy" },
  { href: "/cookies", label: "Cookies" },
  { href: "/terms", label: "Terms" },
] as const;

function Footer({ variant }: { variant: FooterVariant }) {
  return <footer className="site-footer" data-variant={variant}>
    <span>© {new Date().getFullYear()} {PERSON_NAME}</span>
    {variant === "legal" && <nav aria-label="Legal">{legalLinks.map((link) => <Link href={link.href} key={link.href}>{link.label}</Link>)}</nav>}
  </footer>;
}

export function SiteFooter() {
  const pathname = usePathname();
  return <Footer variant={pathname === "/" ? "home" : "legal"} />;
}
