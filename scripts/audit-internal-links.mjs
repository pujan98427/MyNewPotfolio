import { spawn } from "node:child_process";
import process from "node:process";

const args=new Set(process.argv.slice(2));
const valueFor=name=>{const prefix=`${name}=`;return process.argv.slice(2).find(value=>value.startsWith(prefix))?.slice(prefix.length);};
const port=Number(valueFor("--port")??4317);
const suppliedUrl=valueFor("--url");
const shouldStart=!args.has("--no-start")&&!suppliedUrl;
const localOrigin=new URL(suppliedUrl??`http://127.0.0.1:${port}`).origin;
const timeoutMs=10_000;
let server;

function anchors(html){return [...html.matchAll(/<a\b[^>]*\bhref\s*=\s*["']([^"']+)["']/gi)].map(match=>match[1].trim()).filter(Boolean);}
function canonical(html){return html.match(/<link\b[^>]*\brel\s*=\s*["'][^"']*\bcanonical\b[^"']*["'][^>]*\bhref\s*=\s*["']([^"']+)["']/i)?.[1]??html.match(/<link\b[^>]*\bhref\s*=\s*["']([^"']+)["'][^>]*\brel\s*=\s*["'][^"']*\bcanonical\b[^"']*["']/i)?.[1]??"";}
function sitemapLocations(xml){return [...xml.matchAll(/<loc>\s*([^<]+?)\s*<\/loc>/gi)].map(match=>match[1].trim());}
function routeKey(url){return `${url.pathname}${url.search}`;}
function cleanUrl(value,base){const url=new URL(value,base);url.hash="";return url;}
function isHttp(url){return url.protocol==="http:"||url.protocol==="https:";}

async function waitForServer(){const deadline=Date.now()+30_000;while(Date.now()<deadline){try{const response=await fetch(localOrigin,{signal:AbortSignal.timeout(1_500)});if(response.status<500)return;}catch{}await new Promise(resolve=>setTimeout(resolve,250));}throw new Error(`Production server did not become ready at ${localOrigin}. Run npm run build first.`);}
async function fetchStep(url){return fetch(url,{redirect:"manual",headers:{"user-agent":"Pujan-Portfolio-Internal-Link-Audit/1.0","accept":"text/html,application/xhtml+xml"},signal:AbortSignal.timeout(timeoutMs)});}

async function main(){
  if(shouldStart){server=spawn(process.execPath,["node_modules/next/dist/bin/next","start","-p",String(port)],{stdio:["ignore","pipe","pipe"],env:{...process.env,NODE_ENV:"production"}});server.stdout.on("data",()=>{});server.stderr.on("data",chunk=>{if(args.has("--verbose"))process.stderr.write(chunk);});}
  await waitForServer();

  const homeResponse=await fetchStep(`${localOrigin}/`),homeHtml=await homeResponse.text(),homeCanonical=canonical(homeHtml);
  if(!homeCanonical)throw new Error("Homepage has no canonical URL; internal-host classification cannot be trusted.");
  const canonicalOrigin=new URL(homeCanonical).origin;
  const internalHosts=new Set([new URL(localOrigin).host,new URL(canonicalOrigin).host]);
  const toLocal=url=>new URL(`${url.pathname}${url.search}`,localOrigin);
  const issues=[];
  const discovered=new Set(["/"]);
  const queued=new Set(["/"]);
  const queue=[new URL("/",localOrigin)];
  const pages=new Map();

  while(queue.length){
    const requested=queue.shift();
    let current=requested,redirects=[];
    let response;
    try{
      for(let count=0;count<=10;count++){
        response=await fetchStep(current);
        if(![301,302,303,307,308].includes(response.status))break;
        const location=response.headers.get("location");
        if(!location){issues.push({type:"broken-redirect",url:routeKey(requested),detail:`${response.status} without Location`});break;}
        const destination=cleanUrl(location,current);
        redirects.push({status:response.status,from:routeKey(current),to:destination.href});
        if(!isHttp(destination)||!internalHosts.has(destination.host)){issues.push({type:"external-redirect",url:routeKey(requested),detail:destination.href});break;}
        current=toLocal(destination);
      }
    }catch(error){issues.push({type:"request-failed",url:routeKey(requested),detail:error instanceof Error?error.message:"Request failed"});continue;}
    if(!response)continue;
    if(redirects.length>1)issues.push({type:"redirect-chain",url:routeKey(requested),detail:redirects.map(item=>`${item.status} ${item.to}`).join(" -> ")});
    if(redirects.length===1)issues.push({type:"non-canonical-link",url:routeKey(requested),detail:`Links to redirect: ${redirects[0].status} ${redirects[0].to}`});
    if(response.status===404)issues.push({type:"404",url:routeKey(requested),detail:"Internal link returned 404"});
    else if(response.status>=400)issues.push({type:"broken-link",url:routeKey(requested),detail:`HTTP ${response.status}`});
    const contentType=response.headers.get("content-type")??"";
    if(response.status!==200||!contentType.includes("text/html"))continue;
    const html=await response.text(),finalPath=routeKey(current),pageCanonical=canonical(html);
    pages.set(finalPath,{status:response.status,canonical:pageCanonical,links:anchors(html).length});
    if(!pageCanonical)issues.push({type:"missing-canonical",url:finalPath,detail:"HTML page has no canonical link"});
    else{
      const canonicalUrl=cleanUrl(pageCanonical,current);
      if(canonicalUrl.protocol!=="https:")issues.push({type:"http-canonical",url:finalPath,detail:canonicalUrl.href});
      if(canonicalUrl.origin!==canonicalOrigin||routeKey(canonicalUrl)!==finalPath)issues.push({type:"canonical-mismatch",url:finalPath,detail:canonicalUrl.href});
    }
    for(const href of anchors(html)){
      if(/^(?:mailto:|tel:|javascript:|data:)/i.test(href)||href.startsWith("#"))continue;
      let target;try{target=cleanUrl(href,new URL(finalPath,canonicalOrigin));}catch{issues.push({type:"invalid-href",url:finalPath,detail:href});continue;}
      if(!isHttp(target)||!internalHosts.has(target.host))continue;
      if(target.protocol==="http:"&&target.host===new URL(canonicalOrigin).host)issues.push({type:"http-internal-link",url:finalPath,detail:target.href});
      const key=routeKey(target);discovered.add(key);
      if(!queued.has(key)){queued.add(key);queue.push(toLocal(target));}
    }
  }

  const sitemapResponse=await fetchStep(`${localOrigin}/sitemap.xml`);
  if(sitemapResponse.status!==200)issues.push({type:"sitemap-unavailable",url:"/sitemap.xml",detail:`HTTP ${sitemapResponse.status}`});
  else for(const location of sitemapLocations(await sitemapResponse.text())){const url=cleanUrl(location,canonicalOrigin);if(url.origin!==canonicalOrigin)issues.push({type:"foreign-sitemap-url",url:"/sitemap.xml",detail:url.href});else if(!discovered.has(routeKey(url)))issues.push({type:"orphan-page",url:routeKey(url),detail:"Listed in sitemap but not reachable from homepage HTML links"});}

  const uniqueIssues=[...new Map(issues.map(issue=>[`${issue.type}|${issue.url}|${issue.detail}`,issue])).values()];
  console.log(`\nInternal link audit: ${pages.size} HTML pages crawled, ${discovered.size} routes discovered.`);
  if(uniqueIssues.length){console.error(`\n${uniqueIssues.length} issue${uniqueIssues.length===1?"":"s"} found:`);for(const issue of uniqueIssues)console.error(`- [${issue.type}] ${issue.url}: ${issue.detail}`);process.exitCode=1;}
  else console.log("No broken links, redirect chains, orphan pages, non-canonical links, HTTP internal links, or 404 links found.");
}

try{await main();}finally{if(server&&!server.killed)server.kill();}
