import { NextRequest } from "next/server";
import { SITE_URL } from "@/lib/site-config";
import { CONTACT_LIMITS,validateContactInput } from "@/lib/contact/validation";
import { contactRateLimit } from "@/lib/contact/rate-limit";
import { sendContactEmail } from "@/lib/contact/resend";

export const runtime="nodejs";
const headers={"cache-control":"no-store","content-type":"application/json; charset=utf-8"};
const json=(body:unknown,status=200,extra:HeadersInit={})=>Response.json(body,{status,headers:{...headers,...extra}});

export async function POST(request:NextRequest){
  const origin=request.headers.get("origin");
  if(origin&&origin!==SITE_URL&&origin!==request.nextUrl.origin)return json({ok:false,message:"This request could not be accepted."},403);
  const contentType=request.headers.get("content-type")??"";
  if(!contentType.toLowerCase().startsWith("application/json"))return json({ok:false,message:"Send the contact form as JSON."},415);
  const declaredSize=Number(request.headers.get("content-length")??0);
  if(declaredSize>CONTACT_LIMITS.body)return json({ok:false,message:"That message is too large."},413);
  let input:unknown;try{const raw=await request.text();if(new TextEncoder().encode(raw).byteLength>CONTACT_LIMITS.body)return json({ok:false,message:"That message is too large."},413);input=JSON.parse(raw);}catch{return json({ok:false,message:"The message could not be read."},400);}
  let contact;try{contact=validateContactInput(input);}catch(error){return json({ok:false,message:error instanceof Error?error.message:"Check the form and try again."},400);}
  if(contact.honeypot)return json({ok:true,message:"Thanks — your message has been sent."});
  const forwarded=request.headers.get("x-forwarded-for")?.split(",")[0]?.trim(),key=forwarded||request.headers.get("x-real-ip")||"unknown";
  const limit=contactRateLimit(key);
  if(!limit.allowed)return json({ok:false,message:"Too many messages were sent from this connection. Please try again later."},429,{"retry-after":String(limit.retryAfter)});
  try{await sendContactEmail(contact);return json({ok:true,message:"Thanks — your message has been sent. I’ll reply by email."});}
  catch{return json({ok:false,message:"I couldn’t send that message right now. Please email me directly instead."},502);}
}
