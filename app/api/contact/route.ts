import { NextRequest } from "next/server";
import { SITE_URL } from "@/lib/site-config";
import { CONTACT_LIMITS,validateContactInput } from "@/lib/contact/validation";
import { bestEffortContactRateLimit } from "@/lib/contact/rate-limit";
import { sendContactEmail } from "@/lib/contact/resend";
import { logContactFailure } from "@/lib/contact/diagnostics";
import { verifyTurnstileToken } from "@/lib/contact/turnstile";
import { browserRequestOriginIsAllowed } from "@/lib/contact/request-origin";

export const runtime="nodejs";
const responseHeaders={"cache-control":"private, no-store, max-age=0","pragma":"no-cache","expires":"0","vary":"Origin","content-type":"application/json; charset=utf-8"};
const json=(body:unknown,status=200,extra:HeadersInit={})=>Response.json(body,{status,headers:{...extra,...responseHeaders}});
const failure=(code:string,message:string,status:number,extra:HeadersInit={})=>json({ok:false,code,message},status,extra);

export async function POST(request:NextRequest){
  const origin=request.headers.get("origin");
  if(origin&&origin!==SITE_URL&&origin!==request.nextUrl.origin)return failure("REQUEST_REJECTED","This request could not be accepted.",403);
  if(!browserRequestOriginIsAllowed(request))return failure("REQUEST_REJECTED","This request could not be accepted.",403);
  const contentType=request.headers.get("content-type")??"";
  if(!contentType.toLowerCase().startsWith("application/json"))return failure("UNSUPPORTED_MEDIA_TYPE","Send the contact form as JSON.",415);
  const declaredSize=Number(request.headers.get("content-length")??0);
  if(declaredSize>CONTACT_LIMITS.body)return failure("PAYLOAD_TOO_LARGE","That message is too large.",413);
  let input:unknown;try{const raw=await request.text();if(new TextEncoder().encode(raw).byteLength>CONTACT_LIMITS.body)return failure("PAYLOAD_TOO_LARGE","That message is too large.",413);input=JSON.parse(raw);}catch{return failure("INVALID_REQUEST","The message could not be read.",400);}
  let contact;try{contact=validateContactInput(input);}catch{return failure("VALIDATION_ERROR","Check your email and message.",400);}
  if(contact.honeypot)return json({ok:true});
  const forwarded=request.headers.get("x-forwarded-for")?.split(",")[0]?.trim(),key=forwarded||request.headers.get("x-real-ip")||"unknown";
  const limit=bestEffortContactRateLimit(key);
  if(!limit.allowed)return failure("RATE_LIMITED","Too many attempts. Please try again later.",429,{"retry-after":String(limit.retryAfter)});
  if(contact.suspiciouslyFast)return json({ok:true});
  const turnstile=await verifyTurnstileToken({token:contact.turnstileToken,remoteIp:key,requestId:contact.requestId});
  if(!turnstile.ok){
    if(turnstile.reason==="missing-token"||turnstile.reason==="rejected")return failure("SECURITY_CHECK_FAILED","Please complete the security check and try again.",400);
    return failure("SECURITY_CHECK_UNAVAILABLE","The security check is temporarily unavailable. Please try again.",503);
  }
  try{await sendContactEmail(contact);return json({ok:true});}
  catch(error){logContactFailure(contact.requestId,error);return failure("SEND_FAILED","Message could not be sent right now.",502);}
}
