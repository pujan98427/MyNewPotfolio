import { articles } from "@/data/writing";
import { labTools } from "@/data/lab-tools";
import { projects } from "@/data/projects";
import { webGuides } from "@/data/web-guides";
import { PERSON_NAME } from "@/lib/identity";
import { SITE_URL } from "@/lib/site-config";
import { assertCanonicalPath, type CanonicalPath } from "@/lib/seo/canonical";

export const OPEN_GRAPH_IMAGE_SIZE={width:1200,height:630} as const;

export type OpenGraphCard={title:string;eyebrow:string;description:string};

const staticCards:Record<string,OpenGraphCard>={
  "/":{title:"I turn ideas into interfaces.",eyebrow:"Frontend developer",description:"Selected work, original writing and genuinely useful free web tools."},
  "/about":{title:"A frontend practice built on curiosity.",eyebrow:"About",description:`Experience, education and frontend practice — ${PERSON_NAME}`},
  "/work":{title:"Selected work, considered in context.",eyebrow:"Portfolio",description:"Product interfaces, publishing systems and WordPress case studies."},
  "/lab":{title:"Useful things for the web.",eyebrow:"The Lab",description:"Free tools for developers, designers and website owners."},
  "/lab/svg-base64-converter":{title:"SVG to Base64 Converter",eyebrow:"Free browser tool · Encode & decode",description:"Convert SVG code and files to Base64—or decode them back to SVG—privately in your browser."},
  "/writing":{title:"Notes from the workbench.",eyebrow:"Writing",description:"Original notes on frontend craft, interaction and performance."},
  "/contact":{title:"Have something interesting in mind?",eyebrow:"Contact",description:`Start a thoughtful frontend conversation with ${PERSON_NAME}.`},
  "/privacy":{title:"Privacy, stated plainly.",eyebrow:"Privacy",description:"How this portfolio and Web Doctor handle public URLs and browser storage."},
  "/cookies":{title:"A small, honest storage inventory.",eyebrow:"Cookies",description:"Current browser storage and future consent requirements."},
  "/terms":{title:"Terms for using this site.",eyebrow:"Terms",description:"Working terms for the portfolio, guides and free web tools."},
  "/lab/web-doctor/changelog":{title:"Web Doctor changelog.",eyebrow:"Product updates",description:"Meaningful improvements to the free website diagnostic."},
};

export function resolveOpenGraphCard(path:string):OpenGraphCard|undefined{
  const staticCard=staticCards[path];
  if(staticCard)return staticCard;
  if(path.startsWith("/work/")){const item=projects.find(project=>`/work/${project.slug}`===path);return item?{title:item.title,eyebrow:"Frontend case study",description:item.summary}:undefined;}
  if(path.startsWith("/lab/")){const item=labTools.find(tool=>`/lab/${tool.slug}`===path);return item?{title:item.title,eyebrow:item.category,description:item.description}:undefined;}
  if(path.startsWith("/guides/")){const item=webGuides.find(guide=>`/guides/${guide.slug}`===path);return item?{title:item.title,eyebrow:"Web Doctor guide",description:item.description}:undefined;}
  if(path.startsWith("/writing/")){const item=articles.find(article=>`/writing/${article.slug}`===path);return item?{title:item.title,eyebrow:"Writing",description:item.excerpt}:undefined;}
}

export function openGraphImageUrl(path:CanonicalPath):string{
  assertCanonicalPath(path);
  const url=new URL("/api/og",SITE_URL);
  url.searchParams.set("path",path);
  return url.toString();
}
