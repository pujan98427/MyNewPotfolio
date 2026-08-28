import { recommendation } from "../recommendations";
import type { SeoCheck } from "../types/analysis";

export const checkHreflang:SeoCheck=({document})=>{
  if(!document.hreflang.length)return null;
  const invalid=document.hreflang.filter(item=>!item.href||!(/^x-default$/i.test(item.lang)||/^[a-z]{2,3}(?:-[a-z0-9]{2,8})*$/i.test(item.lang))).length;
  const duplicates=document.hreflang.length-new Set(document.hreflang.map(item=>item.lang.toLowerCase())).size;
  return {id:"hreflang",label:"HREFLANG",status:invalid||duplicates?"warning":"pass",value:`${document.hreflang.length} language alternate${document.hreflang.length===1?"":"s"}`,explanation:invalid?`${invalid} declaration${invalid===1?" has":"s have"} an empty or invalid language tag or destination.`:duplicates?`${duplicates} duplicate language declaration${duplicates===1?" was":"s were"} detected. Keep one destination per language and region.`:"Language-alternate declarations were detected with recognizable language tags and destinations.",fix:invalid||duplicates?recommendation("hreflang"):undefined,hreflangAnalysis:{items:document.hreflang,invalid,duplicates}};
};
