import type { NextConfig } from "next";
import { SITE_HOSTNAME, SITE_URL } from "./lib/site-config";
import { LEGACY_REDIRECTS } from "./lib/seo/legacy-redirects";

const isDevelopment=process.env.NODE_ENV!=="production";
const turnstileOrigin="https://challenges.cloudflare.com";
const turnstileEnabled=Boolean(process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY?.trim());
const adsenseEnabled=process.env.NEXT_PUBLIC_ADSENSE_ENABLED==="true"&&/^ca-pub-\d{16}$/.test(process.env.NEXT_PUBLIC_ADSENSE_CLIENT?.trim()??"");
const adsenseScriptOrigin="https://pagead2.googlesyndication.com";
const adsenseFrameOrigins="https://googleads.g.doubleclick.net https://tpc.googlesyndication.com";
const contentSecurityPolicy=[
  "default-src 'self'",
  `script-src 'self' 'unsafe-inline'${isDevelopment?" 'unsafe-eval'":""}${turnstileEnabled?` ${turnstileOrigin}`:""}${adsenseEnabled?` ${adsenseScriptOrigin}`:""}`,
  "style-src 'self' 'unsafe-inline'",
  `img-src 'self' data:${adsenseEnabled?` ${adsenseScriptOrigin} https://googleads.g.doubleclick.net`:""}`,
  "font-src 'self'",
  `connect-src 'self'${isDevelopment?" ws: wss:":""}${adsenseEnabled?` ${adsenseScriptOrigin} https://googleads.g.doubleclick.net`:""}`,
  `frame-src 'self'${turnstileEnabled?` ${turnstileOrigin}`:""}${adsenseEnabled?` ${adsenseFrameOrigins}`:""}`,
  "base-uri 'self'",
  "form-action 'self'",
  "frame-ancestors 'none'",
  ...(!isDevelopment?["upgrade-insecure-requests"]:[]),
].join("; ");

const securityHeaders=[
  {key:"Content-Security-Policy",value:contentSecurityPolicy},
  {key:"Referrer-Policy",value:"strict-origin-when-cross-origin"},
  {key:"X-Content-Type-Options",value:"nosniff"},
  {key:"X-Frame-Options",value:"DENY"},
  {key:"Permissions-Policy",value:"camera=(), microphone=(), geolocation=()"},
];
const alternateHostname=SITE_HOSTNAME.startsWith("www.")?SITE_HOSTNAME.slice(4):`www.${SITE_HOSTNAME}`;

const nextConfig:NextConfig={
  poweredByHeader:false,
  trailingSlash:false,
  images:{formats:["image/avif","image/webp"]},
  async redirects(){return [
    ...LEGACY_REDIRECTS,
    {source:"/:path*",has:[{type:"host",value:alternateHostname}],destination:`${SITE_URL}/:path*`,permanent:true},
    {source:"/:path*",has:[{type:"header",key:"x-forwarded-proto",value:"http"}],destination:`${SITE_URL}/:path*`,permanent:true},
  ];},
  async headers(){return [{source:"/(.*)",headers:securityHeaders}];},
};

export default nextConfig;
