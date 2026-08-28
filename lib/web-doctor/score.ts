import type { Diagnostic, WebDoctorReport } from "./types/analysis";
import { SCORE_CATEGORIES, SCORE_STATUS_MULTIPLIERS, WEB_DOCTOR_SCORE_MAXIMUM } from "./checks.config";

const limited=(value:string,maximum:number)=>Array.from(value).slice(0,maximum).join("");
const limitedUrl=(value:string)=>limited(value,2_048);

/**
 * Explicit report boundary: only diagnostic fields needed by the product UI
 * leave the server. Raw HTML and parser-only data cannot pass through an
 * accidental object spread, and extracted text/URL collections stay bounded.
 */
function publicDiagnostic(item:Diagnostic):Diagnostic{
  const output:Diagnostic={
    id:limited(item.id,80),label:limited(item.label,120),status:item.status,
    value:limited(item.value,500),explanation:limited(item.explanation,1_200),
  };
  if(item.availability)output.availability=item.availability;
  if(item.fix)output.fix=limited(item.fix,5_000);
  if(item.scoreable!==undefined)output.scoreable=item.scoreable;
  if(item.headingAnalysis)output.headingAnalysis={...item.headingAnalysis,items:item.headingAnalysis.items.slice(0,50).map(heading=>({level:heading.level,text:limited(heading.text,200)}))};
  if(item.canonicalAnalysis)output.canonicalAnalysis={...item.canonicalAnalysis,values:item.canonicalAnalysis.values.slice(0,10).map(limitedUrl)};
  if(item.indexabilityAnalysis)output.indexabilityAnalysis={...item.indexabilityAnalysis,metaRobots:limited(item.indexabilityAnalysis.metaRobots,500),headerRobots:limited(item.indexabilityAnalysis.headerRobots,500)};
  if(item.robotsAnalysis)output.robotsAnalysis={...item.robotsAnalysis,url:limitedUrl(item.robotsAnalysis.url),directives:item.robotsAnalysis.directives.slice(0,30).map(directive=>({name:limited(directive.name,80),value:limited(directive.value,500)}))};
  if(item.sitemapAnalysis)output.sitemapAnalysis={...item.sitemapAnalysis,url:limitedUrl(item.sitemapAnalysis.url)};
  if(item.openGraphAnalysis)output.openGraphAnalysis={...item.openGraphAnalysis,title:limited(item.openGraphAnalysis.title,300),description:limited(item.openGraphAnalysis.description,500),image:limitedUrl(item.openGraphAnalysis.image),url:limitedUrl(item.openGraphAnalysis.url),type:limited(item.openGraphAnalysis.type,100),siteName:limited(item.openGraphAnalysis.siteName,200)};
  if(item.twitterAnalysis)output.twitterAnalysis={...item.twitterAnalysis,card:limited(item.twitterAnalysis.card,100),title:limited(item.twitterAnalysis.title,300),description:limited(item.twitterAnalysis.description,500),image:limitedUrl(item.twitterAnalysis.image)};
  if(item.linkAnalysis)output.linkAnalysis=item.linkAnalysis;
  if(item.siteIdentityAnalysis)output.siteIdentityAnalysis={favicon:{...item.siteIdentityAnalysis.favicon,url:limitedUrl(item.siteIdentityAnalysis.favicon.url)},touchIcon:{...item.siteIdentityAnalysis.touchIcon,url:limitedUrl(item.siteIdentityAnalysis.touchIcon.url)},manifest:{...item.siteIdentityAnalysis.manifest,url:limitedUrl(item.siteIdentityAnalysis.manifest.url)}};
  if(item.structuredDataAnalysis)output.structuredDataAnalysis={...item.structuredDataAnalysis,types:item.structuredDataAnalysis.types.slice(0,50).map(type=>limited(type,100)),errors:item.structuredDataAnalysis.errors.slice(0,5).map(error=>limited(error,250))};
  if(item.hreflangAnalysis)output.hreflangAnalysis={...item.hreflangAnalysis,items:item.hreflangAnalysis.items.slice(0,50).map(alternate=>({lang:limited(alternate.lang,80),href:limitedUrl(alternate.href)}))};
  if(item.securityBasicsAnalysis)output.securityBasicsAnalysis=item.securityBasicsAnalysis;
  if(item.contentOverviewAnalysis)output.contentOverviewAnalysis=item.contentOverviewAnalysis;
  return output;
}

export function scoreDiagnostics(diagnostics:Diagnostic[]){
  const diagnosticById=new Map(diagnostics.map(item=>[item.id,item]));
  const categories=SCORE_CATEGORIES.map(category=>{
    const checks=Object.entries(category.checks).map(([id,weight])=>{
      const diagnostic=diagnosticById.get(id);
      const status=diagnostic?.status??"error";
      const neutral=diagnostic?.scoreable===false;
      return {id,label:diagnostic?.label??id,weight,status,neutral,earned:neutral?weight:weight*SCORE_STATUS_MULTIPLIERS[status]};
    });
    return {id:category.id,label:category.label,maximum:category.maximum,score:checks.reduce((total,check)=>total+check.earned,0),checks};
  });
  const rawScore=categories.reduce((total,category)=>total+category.score,0);
  return {score:Math.round(rawScore/WEB_DOCTOR_SCORE_MAXIMUM*100),categories};
}
export function summarize(diagnostics:Diagnostic[]){const scored=diagnostics.filter(item=>item.scoreable!==false);return {passed:scored.filter(item=>item.status==="pass").length,warnings:scored.filter(item=>item.status==="warning").length,errors:scored.filter(item=>item.status==="error").length};}
export function createReport(input:Omit<WebDoctorReport,"schemaVersion"|"score"|"scoreCategories"|"summary"|"checkedAt">):WebDoctorReport{const diagnostics=input.diagnostics.map(publicDiagnostic),result=scoreDiagnostics(diagnostics);return {schemaVersion:1,url:limitedUrl(input.url),statusCode:input.statusCode,responseTimeMs:input.responseTimeMs,diagnostics,checkedAt:new Date().toISOString(),score:result.score,scoreCategories:result.categories,summary:summarize(diagnostics)};}
