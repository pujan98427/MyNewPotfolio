import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Page not found",
  robots: { index: false, follow: false },
};

export default function NotFound() {
  return <main id="main" className="guide-page">
    <header>
      <p className="eyebrow">404 / PAGE NOT FOUND</p>
      <h1>This page isn&apos;t here.</h1>
      <p>The address may have changed, or the page may never have existed.</p>
      <Link className="back-link" href="/">Return home</Link>
    </header>
  </main>;
}
