import "server-only";
import type { NextRequest } from "next/server";
import { SITE_URL } from "@/lib/site-config";

export function browserRequestOriginIsAllowed(request:NextRequest){
  const origin=request.headers.get("origin");
  const fetchSite=request.headers.get("sec-fetch-site")?.toLowerCase();
  if(fetchSite==="cross-site")return false;
  if(!origin)return true;

  let parsedOrigin:URL;
  try{parsedOrigin=new URL(origin);}catch{return false;}
  if(parsedOrigin.origin!==SITE_URL&&parsedOrigin.origin!==request.nextUrl.origin)return false;

  const host=request.headers.get("host")?.trim().toLowerCase();
  return Boolean(host&&host===parsedOrigin.host.toLowerCase());
}
