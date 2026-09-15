import "server-only";
import type { NextRequest } from "next/server";
import { SITE_HOSTNAME } from "@/lib/site-config";

const alternateHostname=SITE_HOSTNAME.startsWith("www.")?SITE_HOSTNAME.slice(4):`www.${SITE_HOSTNAME}`;
const productionHosts=new Set([SITE_HOSTNAME,alternateHostname]);

export function browserRequestOriginIsAllowed(request:NextRequest){
  const origin=request.headers.get("origin");
  const fetchSite=request.headers.get("sec-fetch-site")?.toLowerCase();
  if(fetchSite==="cross-site")return false;
  if(!origin)return true;

  let parsedOrigin:URL;
  try{parsedOrigin=new URL(origin);}catch{return false;}
  const productionOrigin=parsedOrigin.protocol==="https:"&&productionHosts.has(parsedOrigin.hostname)&&!parsedOrigin.port;
  const currentOrigin=parsedOrigin.origin===request.nextUrl.origin;
  if(!productionOrigin&&!currentOrigin)return false;

  const host=request.headers.get("host")?.trim().toLowerCase();
  if(!host)return false;
  return productionOrigin?productionHosts.has(host):host===parsedOrigin.host.toLowerCase();
}
