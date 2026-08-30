import Link from "next/link";
const legalLinks=[{href:"/privacy",label:"Privacy"},{href:"/cookies",label:"Cookies"},{href:"/terms",label:"Terms"},{href:"/#contact",label:"Contact"}];
export function SiteFooter() { return <footer className="site-footer"><span>© {new Date().getFullYear()} Pujan Chapagain</span><nav aria-label="Legal and contact">{legalLinks.map(link=><Link href={link.href} key={link.href}>{link.label}</Link>)}</nav></footer>; }
