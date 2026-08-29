import { spawn } from "node:child_process";
import process from "node:process";
import { gzipSync } from "node:zlib";

const routes=["/","/lab","/lab/web-doctor","/lab/svg-base64-converter","/work","/about","/guides/title-tags"];
const arg=name=>process.argv.slice(2).find(value=>value.startsWith(`${name}=`))?.slice(name.length+1);
const suppliedUrl=arg("--url"),port=Number(arg("--port")??4321),origin=new URL(suppliedUrl??`http://127.0.0.1:${port}`).origin;
const shouldStart=!process.argv.includes("--no-start")&&!suppliedUrl;
const budgets={javascript:220*1024,css:40*1024,html:250*1024,ttfb:1_000};
let server;

const attributes=(tag,name)=>new RegExp(`\\s${name}\\s*=\\s*["']([^"']+)["']`,"i").exec(tag)?.[1]??"";
const tags=(html,name)=>html.match(new RegExp(`<${name}\\b[^>]*>`,"gi"))??[];
const bytes=async url=>{const response=await fetch(url,{headers:{"accept-encoding":"identity"},signal:AbortSignal.timeout(10_000)});if(!response.ok)throw new Error(`${response.status} ${url}`);return gzipSync(Buffer.from(await response.arrayBuffer())).byteLength;};
async function waitForServer(){const deadline=Date.now()+30_000;while(Date.now()<deadline){try{if((await fetch(origin,{signal:AbortSignal.timeout(1_000)})).status<500)return;}catch{}await new Promise(resolve=>setTimeout(resolve,250));}throw new Error(`Production server did not become ready at ${origin}.`);}

async function auditRoute(route){
  const started=performance.now(),response=await fetch(new URL(route,origin),{headers:{"accept-encoding":"identity"},signal:AbortSignal.timeout(10_000)}),ttfb=Math.round(performance.now()-started),html=await response.text();
  if(response.status!==200)throw new Error(`${route} returned ${response.status}`);
  const scriptUrls=tags(html,"script").map(tag=>attributes(tag,"src")).filter(Boolean).map(src=>new URL(src,origin));
  const styleUrls=tags(html,"link").filter(tag=>/\bstylesheet\b/i.test(attributes(tag,"rel"))).map(tag=>new URL(attributes(tag,"href"),origin));
  const thirdPartyScripts=scriptUrls.filter(url=>url.origin!==origin);
  const imageTags=tags(html,"img"),imagesWithoutDimensions=imageTags.filter(tag=>!attributes(tag,"width")||!attributes(tag,"height"));
  const [javascript,css]=await Promise.all([Promise.all([...new Set(scriptUrls.filter(url=>url.origin===origin).map(String))].map(bytes)).then(values=>values.reduce((sum,value)=>sum+value,0)),Promise.all([...new Set(styleUrls.filter(url=>url.origin===origin).map(String))].map(bytes)).then(values=>values.reduce((sum,value)=>sum+value,0))]);
  return {route,ttfb,html:Buffer.byteLength(html),javascript,css,scripts:scriptUrls.length,images:imageTags.length,imagesWithoutDimensions:imagesWithoutDimensions.length,thirdPartyScripts:thirdPartyScripts.map(String),viewport:/<meta\b[^>]*name=["']viewport["']/i.test(html)};
}

function format(value){return `${(value/1024).toFixed(1)} KB`;}
async function main(){
  if(shouldStart){server=spawn(process.execPath,["node_modules/next/dist/bin/next","start","-p",String(port)],{stdio:["ignore","pipe","pipe"],env:{...process.env,NODE_ENV:"production"}});server.stdout.on("data",()=>{});server.stderr.on("data",()=>{});}
  await waitForServer();
  const results=[];for(const route of routes)results.push(await auditRoute(route));
  const failures=[];
  for(const result of results){
    if(result.javascript>budgets.javascript)failures.push(`${result.route}: JavaScript ${format(result.javascript)} exceeds ${format(budgets.javascript)}`);
    if(result.css>budgets.css)failures.push(`${result.route}: CSS ${format(result.css)} exceeds ${format(budgets.css)}`);
    if(result.html>budgets.html)failures.push(`${result.route}: HTML ${format(result.html)} exceeds ${format(budgets.html)}`);
    if(result.ttfb>budgets.ttfb)failures.push(`${result.route}: local TTFB ${result.ttfb} ms exceeds ${budgets.ttfb} ms`);
    if(!result.viewport)failures.push(`${result.route}: mobile viewport metadata missing`);
    if(result.imagesWithoutDimensions)failures.push(`${result.route}: ${result.imagesWithoutDimensions} image(s) lack explicit dimensions`);
    if(result.thirdPartyScripts.length)failures.push(`${result.route}: third-party scripts ${result.thirdPartyScripts.join(", ")}`);
  }
  console.table(results.map(result=>({route:result.route,ttfb:`${result.ttfb} ms`,html:format(result.html),"js (gzip)":format(result.javascript),"css (gzip)":format(result.css),scripts:result.scripts,images:result.images})));
  if(failures.length){console.error("\nPerformance gate failed:");for(const failure of failures)console.error(`- ${failure}`);process.exitCode=1;}else console.log("\nPerformance delivery budgets passed for all required routes.");
}

try{await main();}finally{if(server&&!server.killed)server.kill();}
