import { parseHtml } from "./html-parser";
import { normalizeWebsiteUrl } from "./url-validation";
import { safeFetchPublicFile } from "./safe-fetch";
import { getDocumentLoader } from "./document-loader";
import { createReport } from "./score";
import type { AnalysisMode, CheckContext, Diagnostic, ProgressReporter, PublicFile, SeoCheck, WebDoctorReport } from "./types/analysis";
import { checkTitle } from "./checks/title";import { checkDescription } from "./checks/description";import { checkCanonical } from "./checks/canonical";import { checkRobotsMeta } from "./checks/robots-meta";import { checkRobotsTxt } from "./checks/robots-txt";import { checkSitemap } from "./checks/sitemap";import { checkHeadings } from "./checks/headings";import { checkOpenGraph } from "./checks/open-graph";import { checkTwitter } from "./checks/twitter";import { checkImages } from "./checks/images";import { checkLinks } from "./checks/links";import { checkSchema } from "./checks/schema";import { checkLanguage } from "./checks/language";import { checkViewport } from "./checks/viewport";import { checkFavicon } from "./checks/favicon";import { checkCharset } from "./checks/charset";import { checkHreflang } from "./checks/hreflang";import { checkSecurity } from "./checks/security";
import { checkContent } from "./checks/content";

type CheckModule={ids:Array<{id:string;label:string}>;run:SeoCheck};
const checkModule=(id:string,label:string,run:SeoCheck):CheckModule=>({ids:[{id,label}],run});
const checkGroups:Array<{stage:Parameters<ProgressReporter>[0];message:string;checks:CheckModule[]}>= [
  {stage:"metadata",message:"Reading metadata",checks:[checkModule("title","TITLE",checkTitle),checkModule("description","META DESCRIPTION",checkDescription),checkModule("language","DOCUMENT LANGUAGE",checkLanguage),checkModule("charset","CHARACTER ENCODING",checkCharset),checkModule("favicon","SITE IDENTITY",checkFavicon)]},
  {stage:"structure",message:"Inspecting page structure",checks:[checkModule("content","PAGE CONTENT",checkContent),checkModule("h1","HEADING STRUCTURE",checkHeadings),checkModule("images","IMAGE ALTERNATIVES",checkImages),checkModule("links","LINKS",checkLinks),checkModule("viewport","MOBILE VIEWPORT",checkViewport)]},
  {stage:"indexability",message:"Checking indexability",checks:[checkModule("canonical","CANONICAL",checkCanonical),checkModule("indexing","INDEXABILITY",checkRobotsMeta),checkModule("robots-file","ROBOTS.TXT",checkRobotsTxt),checkModule("sitemap-file","XML SITEMAP",checkSitemap),checkModule("hreflang","HREFLANG",checkHreflang)]},
  {stage:"social",message:"Checking social sharing",checks:[checkModule("social","OPEN GRAPH",checkOpenGraph),checkModule("twitter","TWITTER / X CARD",checkTwitter),checkModule("schema","STRUCTURED DATA",checkSchema)]},
  {stage:"diagnosis",message:"Checking response security",checks:[{ids:[{id:"response",label:"HTTP RESPONSE"},{id:"security-basics",label:"SECURITY BASICS"}],run:checkSecurity}]},
];

const unavailableExplanation="This check could not be completed, but the rest of the report is still available. Try checking the page again later.";
async function runCheck(check:CheckModule,context:CheckContext):Promise<Diagnostic[]>{try{const result=await check.run(context);if(!result)return [];const completed=Array.isArray(result)?result:[result];return completed.map(item=>({...item,availability:item.availability??(item.status==="pass"?"success" as const:"warning" as const)}));}catch{return check.ids.map(item=>({...item,status:"warning" as const,availability:"unavailable" as const,value:"Unavailable",explanation:unavailableExplanation,scoreable:false}));}}
async function runChecks(context:CheckContext,progress?:ProgressReporter){
  // Checks receive the same immutable parsed document. Starting independent
  // modules together avoids serial network waits in asset-related checks while
  // Promise.all preserves the configured result order.
  const groups=checkGroups.map(group=>{
    progress?.(group.stage,group.message);
    return Promise.all(group.checks.map(check=>runCheck(check,context)));
  });
  return (await Promise.all(groups)).flat(2);
}
const sitemapAccept="application/xml,text/xml,text/plain,*/*;q=0.1";
const isSitemap=(file:PublicFile)=>file.ok&&/<(?:urlset|sitemapindex)\b/i.test(file.text);
async function fetchSitemapCandidates(candidates:Array<{url:URL;source:"robots.txt"|"/sitemap.xml"|"/sitemap_index.xml"}>){
  const unique=[...new Map(candidates.map(candidate=>[candidate.url.toString(),candidate])).values()];
  const fetched=await Promise.all(unique.map(async candidate=>({candidate,file:await safeFetchPublicFile(candidate.url,sitemapAccept)})));
  const valid=fetched.find(({file})=>isSitemap(file));
  if(valid)return {...valid.file,source:valid.candidate.source} satisfies PublicFile;
  const usefulFailure=fetched.find(({file})=>file.status!==0)?.file??fetched[0]?.file;
  return {...(usefulFailure??{ok:false,status:0,text:"",url:unique[0]?.url.toString()??""}),source:"none"} satisfies PublicFile;
}
async function fetchSeoFiles(pageUrl:string){
  const origin=new URL(pageUrl).origin;
  const robots=await safeFetchPublicFile(new URL("/robots.txt",origin),"text/plain,*/*;q=0.1");
  const declared=robots.text.match(/^\s*Sitemap:\s*(\S+)/im)?.[1];
  if(declared){
    try{
      const declaredResult=await fetchSitemapCandidates([{url:new URL(declared,origin),source:"robots.txt"}]);
      if(isSitemap(declaredResult))return {robots,sitemap:declaredResult};
    }catch{}
  }
  const sitemap=await fetchSitemapCandidates([
    {url:new URL("/sitemap.xml",origin),source:"/sitemap.xml"},
    {url:new URL("/sitemap_index.xml",origin),source:"/sitemap_index.xml"},
  ]);
  return {robots,sitemap};
}

export async function analyseWebsite(input:string,progress?:ProgressReporter,mode:AnalysisMode="html"):Promise<WebDoctorReport>{progress?.("validating","Validating website address");const normalized=normalizeWebsiteUrl(input);const protocolWasProvided=/^https?:\/\//i.test(input.trim());const loader=getDocumentLoader(mode);progress?.("connecting",normalized.protocol==="https:"?"Connecting securely with HTTPS":"Connecting to website");let fetched;try{fetched=await loader.load(normalized);}catch(httpsError){if(protocolWasProvided||normalized.protocol!=="https:")throw httpsError;const fallback=new URL(normalized);fallback.protocol="http:";progress?.("connecting","HTTPS unavailable; trying HTTP");try{fetched=await loader.load(fallback);}catch{throw httpsError;}}progress?.("indexability","Checking robots.txt and sitemap");const files=await fetchSeoFiles(fetched.url);const context:CheckContext={document:parseHtml(fetched.html),url:fetched.url,statusCode:fetched.statusCode,responseTimeMs:fetched.responseTimeMs,headers:fetched.headers,...files};const diagnostics=await runChecks(context,progress);progress?.("diagnosis","Preparing diagnosis");return createReport({url:fetched.url,statusCode:fetched.statusCode,responseTimeMs:fetched.responseTimeMs,diagnostics});}
export async function analyseManualHtml(html:string,url="Manual HTML",progress?:ProgressReporter){if(html.length>3_000_000)throw new Error("The supplied HTML is too large to analyse.");const context:CheckContext={document:parseHtml(html),url,manual:true};const diagnostics=await runChecks(context,progress);progress?.("diagnosis","Preparing diagnosis");return createReport({url,diagnostics});}
export { normalizeWebsiteUrl } from "./url-validation";
