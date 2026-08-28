import { recommendation } from "../recommendations";
import type { SeoCheck } from "../types/analysis";

export const checkRobotsMeta:SeoCheck=({document,headers})=>{
  const meta=document.robotsMeta.trim(),header=(headers?.get("x-robots-tag")??"").trim(),combined=`${meta},${header}`.toLowerCase();
  const noindex=/(^|[\s,:])noindex([\s,]|$)/.test(combined)||/(^|[\s,:])none([\s,]|$)/.test(combined),nofollow=/(^|[\s,:])nofollow([\s,]|$)/.test(combined)||/(^|[\s,:])none([\s,]|$)/.test(combined),usesDefault=!meta&&!header;
  const value=noindex?"NOINDEX DETECTED":usesDefault?"Default: indexing may be permitted":[meta,header].filter(Boolean).join(" · ");
  return {id:"indexing",label:"INDEXABILITY",status:noindex?"error":"pass",value,explanation:noindex?"This page currently asks compatible search engines not to include it in search results.":usesDefault?"No robots meta tag or X-Robots-Tag restriction was detected. Default behaviour may still permit indexing, although inclusion is never guaranteed.":nofollow?"No noindex directive was detected, so indexing may be permitted. A nofollow directive asks compatible crawlers not to follow links from this page.":"The detected directives permit compatible search engines to index and follow this page, but inclusion is never guaranteed.",fix:noindex?recommendation("indexing"):undefined,indexabilityAnalysis:{metaRobots:meta,headerRobots:header,noindex,nofollow,usesDefault}};
};
