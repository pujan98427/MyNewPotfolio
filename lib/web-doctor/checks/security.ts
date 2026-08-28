import { recommendation } from "../recommendations";
import type { SeoCheck } from "../types/analysis";

export const checkSecurity:SeoCheck=({url,headers,statusCode})=>{
  let protocol="";try{protocol=new URL(url).protocol;}catch{}
  const live=statusCode!==undefined,responseOk=!live||statusCode>=200&&statusCode<300;
  const response={id:"response",label:"HTTP RESPONSE",status:responseOk?"pass" as const:"error" as const,value:live?String(statusCode):"Manual HTML",explanation:!live?"No live HTTP response was available for pasted HTML.":responseOk?"The page returned a successful HTTP response.":"The page did not return a successful 2xx response.",fix:responseOk?undefined:recommendation("response")};
  if(!live)return [response];
  const cspValue=headers?.get("content-security-policy")??"",analysis={https:protocol==="https:",csp:Boolean(cspValue),hsts:Boolean(headers?.get("strict-transport-security")),contentTypeOptions:/\bnosniff\b/i.test(headers?.get("x-content-type-options")??""),referrerPolicy:Boolean(headers?.get("referrer-policy")),permissionsPolicy:Boolean(headers?.get("permissions-policy")),frameProtection:Boolean(headers?.get("x-frame-options")||/\bframe-ancestors\b/i.test(cspValue))},count=Object.values(analysis).filter(Boolean).length;
  return [response,{id:"security-basics",label:"SECURITY BASICS",status:count>=5?"pass" as const:"warning" as const,value:`${count}/7 basic protections detected`,explanation:"Security checks are informational and are not included in the WEB DOCTOR SEO score. They are not a Google ranking score.",fix:count===7?undefined:recommendation("security-basics"),scoreable:false,securityBasicsAnalysis:analysis}];
};
