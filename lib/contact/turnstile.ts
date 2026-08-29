import "server-only";
import { SITE_URL } from "@/lib/site-config";

const SITEVERIFY_URL="https://challenges.cloudflare.com/turnstile/v0/siteverify";
const TURNSTILE_ACTION="contact";
const VERIFY_TIMEOUT_MS=5_000;

type SiteverifyResponse={success?:boolean;action?:string;hostname?:string;"error-codes"?:string[]};
export type TurnstileResult={ok:true;mode:"disabled"|"verified"|"development-bypass"}|{ok:false;reason:"configuration"|"missing-token"|"rejected"|"unavailable"};

const enabled=(value:string|undefined)=>value?.trim().toLowerCase()==="true";

export async function verifyTurnstileToken({token,remoteIp,requestId}:{token:string;remoteIp?:string;requestId:string}):Promise<TurnstileResult>{
  const siteKey=process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY?.trim()??"";
  const secret=process.env.TURNSTILE_SECRET_KEY?.trim()??"";
  const required=enabled(process.env.TURNSTILE_REQUIRED);
  const developmentBypass=process.env.NODE_ENV==="development"&&enabled(process.env.TURNSTILE_DEV_BYPASS);

  if(!siteKey&&!secret&&!required)return {ok:true,mode:"disabled"};
  if((!siteKey||!secret)&&developmentBypass)return {ok:true,mode:"development-bypass"};
  if(!siteKey||!secret)return {ok:false,reason:"configuration"};
  if(!token)return {ok:false,reason:"missing-token"};

  const body=new URLSearchParams({secret,response:token,idempotency_key:requestId});
  if(remoteIp&&remoteIp!=="unknown")body.set("remoteip",remoteIp);
  try{
    const response=await fetch(SITEVERIFY_URL,{method:"POST",headers:{"content-type":"application/x-www-form-urlencoded"},body,cache:"no-store",signal:AbortSignal.timeout(VERIFY_TIMEOUT_MS)});
    if(!response.ok)return {ok:false,reason:"unavailable"};
    const result=await response.json() as SiteverifyResponse;
    if(!result.success||result.action!==TURNSTILE_ACTION)return {ok:false,reason:"rejected"};
    if(process.env.NODE_ENV==="production"&&result.hostname&&result.hostname!==new URL(SITE_URL).hostname)return {ok:false,reason:"rejected"};
    return {ok:true,mode:"verified"};
  }catch{return {ok:false,reason:"unavailable"};}
}
