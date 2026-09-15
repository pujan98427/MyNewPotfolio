import Link from "next/link";
import { AnimatedLogo } from "./animated-logo";
import { NavigationRuntime } from "./navigation-runtime";
import { PrimaryNavigation } from "./primary-navigation";
import { labTools } from "@/data/lab-tools";

const primaryLinks=[
  {href:"/#selected-work",label:"Work",sectionId:"selected-work"},
  {href:"/#lab",label:"Lab",sectionId:"lab"},
  {href:"/#skills",label:"Skills",sectionId:"skills"},
  {href:"/#experience",label:"Experience",sectionId:"experience"},
  {href:"/#contact",label:"Contact",sectionId:"contact"},
];
const portfolioCommandLinks=[{href:"/",label:"Home"},{href:"/#selected-work",label:"Selected work"},{href:"/#skills",label:"Skills"},{href:"/#experience",label:"Experience"},{href:"/#education",label:"Education"},{href:"/#about",label:"About Pujan"},{href:"/#contact",label:"Contact"}];
const commandLinks=[...portfolioCommandLinks.map(link=>({...link,group:"Homepage"})),{href:"/#lab",label:"Lab overview",group:"Free tools"},...labTools.map(tool=>({href:`/lab/${tool.slug}`,label:tool.title,group:tool.category}))];

export function SiteNavigation(){return <><header className="site-header" data-site-header><Link className="wordmark" href="/" aria-label="Pujan Chapagain, home"><AnimatedLogo /><small>Frontend developer<br />Glasgow, Scotland</small></Link><PrimaryNavigation links={primaryLinks} /><div className="site-actions"><button className="command-trigger" type="button" data-command-trigger aria-haspopup="dialog">Search <kbd>⌘K</kbd></button></div></header><dialog className="command-dialog" data-command-dialog aria-labelledby="command-heading"><div><header><div><span>COMMAND NAVIGATION</span><h2 id="command-heading">Where would you like to go?</h2></div><button type="button" data-command-close aria-label="Close command navigation">Esc</button></header><label htmlFor="command-search">Search pages and tools</label><input id="command-search" data-command-input placeholder="Type a page or tool…" autoComplete="off" /><nav aria-label="Command results">{commandLinks.map((link,index)=><Link href={link.href} data-command-link key={link.href}><span>{String(index+1).padStart(2,"0")}</span><strong>{link.label}</strong><small>{link.group}</small></Link>)}<p data-command-empty hidden>No matching page. Try “Lab” or “Web Doctor”.</p></nav></div></dialog><NavigationRuntime /></>}
