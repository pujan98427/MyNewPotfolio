import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { createPageMetadata } from "@/lib/seo/metadata";
import { Breadcrumbs } from "@/components/navigation/breadcrumbs";

export const metadata=createPageMetadata({title:"Web Doctor Changelog",description:"Read product updates, new diagnostic checks and usability improvements added to the free Web Doctor website analysis tool.",path:"/lab/web-doctor/changelog"});

const releases=[
  {version:"v1.1",title:"A stronger diagnosis",changes:["Added robots.txt and XML sitemap detection.","Improved canonical, indexability, social-sharing and structured-data checks.","Added isolated check failures, clearer unavailable states and faster parallel analysis.","Added editable fixes, accessibility improvements, recent checks and fresh reanalysis."]},
  {version:"v1.0",title:"Initial Web Doctor release",changes:["Introduced URL-first public website analysis with no signup or user API key.","Added deterministic scoring, prioritised findings and copyable implementation guidance.","Added metadata, heading, content, link, image and technical-basics diagnostics."]},
] as const;

export default function WebDoctorChangelogPage(){return <main id="main" className="guide-page changelog-page"><Breadcrumbs items={[{label:"Lab",href:"/lab"},{label:"Web Doctor",href:"/lab/web-doctor"},{label:"Changelog",href:"/lab/web-doctor/changelog"}]} /><header><Link className="back-link" href="/lab/web-doctor"><ArrowLeft aria-hidden="true" /> Web Doctor</Link><p className="eyebrow">PRODUCT UPDATES</p><h1>Web Doctor changelog.</h1><p>A simple record of meaningful improvements to the free website diagnostic.</p></header><article>{releases.map((release,index)=><section key={release.version}><span>{String(index+1).padStart(2,"0")}</span><div><p className="changelog-version">{release.version}</p><h2>{release.title}</h2><ul>{release.changes.map(change=><li key={change}>{change}</li>)}</ul></div></section>)}</article></main>;}
