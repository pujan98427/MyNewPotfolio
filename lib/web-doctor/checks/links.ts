import { recommendation } from "../recommendations";
import type { SeoCheck } from "../types/analysis";

export const checkLinks:SeoCheck=({document,url})=>{
  let page:URL;try{page=new URL(url);}catch{page=new URL("https://manual.invalid/");}
  const analysis={total:document.links.length,internal:0,external:0,email:0,telephone:0,http:0,empty:0,hashOnly:0,javascript:0,other:0};
  for(const link of document.links){const href=link.href.trim();if(!href){analysis.empty++;continue;}if(href==="#"){analysis.hashOnly++;continue;}if(/^javascript:/i.test(href)){analysis.javascript++;continue;}if(/^mailto:/i.test(href)){analysis.email++;continue;}if(/^tel:/i.test(href)){analysis.telephone++;continue;}if(/^http:\/\//i.test(href))analysis.http++;try{const resolved=new URL(href,page);if(!["http:","https:"].includes(resolved.protocol)){analysis.other++;continue;}if(resolved.hostname.toLowerCase()===page.hostname.toLowerCase())analysis.internal++;else analysis.external++;}catch{analysis.other++;}}
  const problemCount=analysis.empty+analysis.hashOnly+analysis.javascript,hasProblems=problemCount>0;
  return {id:"links",label:"LINKS",status:hasProblems?"warning":"pass",value:`${analysis.total} links found`,explanation:hasProblems?`${problemCount} obvious destination problem${problemCount===1?" was":"s were"} detected in the page HTML. WEB DOCTOR did not request any linked pages.`:"No empty, hash-only, or JavaScript link destinations were detected. WEB DOCTOR did not request any linked pages.",fix:hasProblems?recommendation("links"):undefined,linkAnalysis:analysis};
};
