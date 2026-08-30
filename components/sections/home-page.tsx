import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { projects } from "@/data/projects";
import { education,experience } from "@/data/experience";
import { skills } from "@/data/skills";
import { HeroStage } from "@/components/interactions/hero-stage";
import { ProjectStory } from "@/components/work/project-story";
import { ExperienceList } from "@/components/sections/experience-list";

export function HomePage(){return <main id="main">
  <HeroStage />

  <section className="work story-section" id="selected-work"><div className="section-head story-heading"><p className="eyebrow">02 / Selected work</p><h2>Frontend craft,<br />shown honestly.</h2><p>Selected employment contributions, presented without product case studies, business claims or implied ownership.</p></div><ProjectStory projects={projects} /><Link className="large-link story-all-link" href="/work">View the work overview <ArrowUpRight aria-hidden="true" /></Link></section>

  <section className="home-expertise section" aria-labelledby="home-expertise-heading"><header className="home-overview-head"><p className="eyebrow">03 / Skills &amp; capability</p><h2 id="home-expertise-heading">What I work<br />with.</h2><p>A practical toolkit spanning interface engineering, content systems, design collaboration and everyday workplace software. No percentage scores—just capabilities demonstrated by the work and tools on this site.</p></header><div className="capability-list">{Object.entries(skills).map(([group,items],groupIndex)=><article key={group}><span>{String(groupIndex+1).padStart(2,"0")}</span><h3>{group}</h3><ol>{items.map((item,itemIndex)=><li key={item} data-skill={item}><span>{item}</span><b>{String(itemIndex+1).padStart(2,"0")}</b></li>)}</ol></article>)}</div></section>

  <section className="home-experience section" aria-labelledby="home-experience-heading"><header className="home-overview-head"><p className="eyebrow">04 / Experience</p><h2 id="home-experience-heading">Where I have<br />worked.</h2><p>{experience.length} roles across frontend development, UI/UX design and WordPress delivery from 2019 to August 2025.</p></header><ExperienceList /><Link className="text-link" href="/about">Full professional profile <ArrowUpRight aria-hidden="true" /></Link></section>

  <section className="home-lab section" aria-labelledby="home-lab-heading"><header className="home-overview-head"><p className="eyebrow">05 / The Lab</p><h2 id="home-lab-heading">Useful things<br />for the web.</h2><p>Free, privacy-conscious utilities for developers, designers and website owners—built to solve a real task without an account.</p></header><nav className="home-links" aria-label="Explore free web tools"><Link href="/lab">Explore all free web tools <ArrowUpRight aria-hidden="true" /></Link><Link href="/lab/web-doctor">Check a page before publishing <ArrowUpRight aria-hidden="true" /></Link><Link href="/lab/svg-base64-converter">Convert SVG and Base64 locally <ArrowUpRight aria-hidden="true" /></Link><Link href="/lab/meta-generator">Write sharper search metadata <ArrowUpRight aria-hidden="true" /></Link><Link href="/lab/contrast-checker">Test a colour pairing <ArrowUpRight aria-hidden="true" /></Link></nav></section>

  <section className="home-education section" aria-labelledby="home-education-heading"><header className="home-overview-head"><p className="eyebrow">06 / Education</p><h2 id="home-education-heading">Where I<br />studied.</h2><p>Formal computing foundations followed by postgraduate study in web development in Scotland.</p></header><ol>{education.map((item,index)=><li key={item.course}><span>{String(index+1).padStart(2,"0")}</span><div><h3>{item.course}</h3><p>{item.school}</p></div><p>{item.place}{item.year&&<> · {item.year}</>}</p></li>)}</ol></section>

  <section className="about section home-about"><div className="about-grid"><div className="portrait"><Image src="/pujan-chapagain-portrait.png" alt="Pujan Chapagain wearing a suit and sunglasses" width={660} height={499} sizes="(max-width: 760px) 100vw, 40vw" /></div><div><p className="eyebrow">07 / About</p><h2>Curious by nature.<br /><em>Exacting</em> by craft.</h2><p className="standfirst">I’m Pujan Chapagain, a frontend developer based in Glasgow. I combine user-centred thinking, streamlined workflows and precise implementation to build thoughtful web experiences.</p><Link className="text-link" href="/about">More about my approach <ArrowUpRight aria-hidden="true" /></Link></div></div></section>

  <section className="home-contact section" aria-labelledby="home-contact-heading"><p className="eyebrow">08 / Contact</p><div><h2 id="home-contact-heading">Have something<br />interesting in mind?</h2><p>For a website project, frontend role or thoughtful collaboration, send a concise note directly to my inbox.</p><Link className="button button-primary" href="/contact">Message Pujan <ArrowUpRight aria-hidden="true" /></Link></div></section>
</main>;}
