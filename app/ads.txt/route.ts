import { createAdsTxt } from "@/lib/advertising/ads-txt";

export const runtime="nodejs";
export const dynamic="force-dynamic";

export function GET(){
  const content=createAdsTxt();
  if(!content)return new Response("ads.txt is not configured.\n",{status:404,headers:{"Content-Type":"text/plain; charset=utf-8","Cache-Control":"no-store","X-Content-Type-Options":"nosniff"}});
  return new Response(content,{status:200,headers:{"Content-Type":"text/plain; charset=utf-8","Cache-Control":"public, max-age=3600, stale-while-revalidate=86400","X-Content-Type-Options":"nosniff"}});
}
