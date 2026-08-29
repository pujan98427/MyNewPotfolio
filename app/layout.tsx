import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import "./globals.css";
import { SiteNavigation } from "@/components/navigation/site-navigation";
import { SiteFooter } from "@/components/navigation/site-footer";
import { SITE_URL } from "@/lib/site-config";
import { PERSON_NAME } from "@/lib/identity";
import { OPEN_GRAPH_IMAGE_SIZE, openGraphImageUrl } from "@/lib/seo/open-graph";
import { ContactChat } from "@/components/contact/contact-chat";
const sans = localFont({ src:"./fonts/manrope-latin.woff2", variable:"--font-sans", display:"swap", weight:"400 700" });
const serif = localFont({ src:[{path:"./fonts/playfair-display-latin.woff2",weight:"400",style:"normal"},{path:"./fonts/playfair-display-italic-latin.woff2",weight:"400",style:"italic"}], variable:"--font-serif", display:"swap" });
const siteUrl = SITE_URL;
const googleVerification=process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION?.trim();
const homepageShareImage={url:openGraphImageUrl("/"),width:OPEN_GRAPH_IMAGE_SIZE.width,height:OPEN_GRAPH_IMAGE_SIZE.height,type:"image/png",alt:`${PERSON_NAME} — Frontend Developer & Web Tools`};
export const metadata: Metadata = { metadataBase: new URL(siteUrl), title: { default: `${PERSON_NAME} — Frontend Developer & Web Tools`, template: `%s — ${PERSON_NAME}` }, description: "Frontend developer in Glasgow building fast interactive websites, considered interfaces and genuinely useful free web tools.", alternates: { canonical: "/" }, openGraph: { title: `${PERSON_NAME} — Frontend Developer & Web Tools`, description: "Explore selected frontend work and free tools for diagnosing, designing and building better websites.", url: siteUrl, siteName: PERSON_NAME, images: [homepageShareImage], locale: "en_GB", type: "website" }, twitter: { card: "summary_large_image", title: `${PERSON_NAME} — Frontend Developer & Web Tools`, description: "Explore selected frontend work and free tools for diagnosing, designing and building better websites.", images: [homepageShareImage] }, robots: { index: true, follow: true }, icons: { icon: "/favicon.ico", apple: "/apple-touch-icon.png" } };
if(googleVerification)metadata.verification={google:googleVerification};
export const viewport: Viewport = { width: "device-width", initialScale: 1, themeColor: "#f0eee8", colorScheme: "light" };
export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) { return <html lang="en" className={`${sans.variable} ${serif.variable}`}><body><a className="skip-link" href="#main">Skip to content</a><SiteNavigation />{children}<SiteFooter /><ContactChat /></body></html>; }
