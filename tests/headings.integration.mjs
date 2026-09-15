import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {spawn} from "node:child_process";

const port=3223;
const origin=`http://127.0.0.1:${port}`;

function slugs(file){
  return [...readFileSync(file,"utf8").matchAll(/slug:\s*"([^"]+)"/g)].map(match=>match[1]);
}

const routes=[
  "/","/lab","/writing","/privacy","/cookies","/terms","/lab/web-doctor/changelog",
  ...slugs("data/lab-tools.ts").map(slug=>`/lab/${slug}`),
  ...slugs("data/web-guides.ts").map(slug=>`/guides/${slug}`),
  ...slugs("data/writing.ts").map(slug=>`/writing/${slug}`),
];

function textContent(value){
  return value.replace(/<[^>]+>/g," ").replace(/&(?:#\d+|#x[\da-f]+|[a-z]+);/gi," ").replace(/\s+/g," ").trim();
}

function mainHeadings(html){
  const main=html.match(/<main\b[^>]*>[\s\S]*?<\/main>/i)?.[0]??"";
  return [...main.matchAll(/<h([1-6])\b[^>]*>([\s\S]*?)<\/h\1>/gi)].map(match=>({level:Number(match[1]),text:textContent(match[2])}));
}

function jsonLdEntities(html){
  return [...html.matchAll(/<script\b[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi)].flatMap(match=>{const parsed=JSON.parse(match[1]);return Array.isArray(parsed)?parsed:[parsed];});
}

function metaContent(html,attribute,value){
  const tag=[...html.matchAll(/<meta\b[^>]*>/gi)].map(match=>match[0]).find(item=>new RegExp(`${attribute}=["']${value}["']`,"i").test(item));
  return tag?.match(/content=["']([^"']+)["']/i)?.[1].replace(/&amp;/g,"&");
}

async function waitForServer(){
  for(let attempt=0;attempt<240;attempt++){
    try{if((await fetch(origin,{signal:AbortSignal.timeout(1500)})).ok)return;}catch{}
    await new Promise(resolve=>setTimeout(resolve,500));
  }
  throw new Error("Heading-audit server did not become ready.");
}

const server=spawn(process.execPath,["node_modules/next/dist/bin/next","dev","--webpack","-p",String(port)],{
  cwd:process.cwd(),env:{...process.env,NODE_ENV:"development"},stdio:"inherit",windowsHide:true,
});

try{
  await waitForServer();
  const uniqueRoutes=[...new Set(routes)];
  for(const route of uniqueRoutes){
    const response=await fetch(`${origin}${route}`);
    assert.equal(response.status,200,`${route} should render successfully`);
    const html=await response.text();
    const headings=mainHeadings(html);
    assert.equal(headings.filter(item=>item.level===1).length,1,`${route} must have exactly one H1: ${JSON.stringify(headings)}`);
    assert.ok(headings[0]?.level===1,`${route} must begin its main heading outline with H1: ${JSON.stringify(headings)}`);
    assert.ok(headings.every(item=>item.text.length>0),`${route} must not contain empty headings`);
    for(let index=1;index<headings.length;index++){
      assert.ok(headings[index].level<=headings[index-1].level+1,`${route} skips from H${headings[index-1].level} to H${headings[index].level}`);
    }
    const entities=jsonLdEntities(html),types=entities.map(entity=>entity?.["@type"]);
    for(const entity of entities){assert.equal(entity?.["@context"],"https://schema.org",`${route} has a non-Schema.org JSON-LD context`);assert.equal(typeof entity?.["@type"],"string",`${route} has an untyped JSON-LD entity`);assert.doesNotMatch(JSON.stringify(entity),/aggregateRating|reviewCount|priceCurrency|offers/i,`${route} contains unsupported commercial or review claims`);}
    if(route==="/"){assert.ok(types.includes("Person"));assert.ok(types.includes("WebSite"));}
    if(route.startsWith("/lab/")&&route!=="/lab/web-doctor/changelog"){assert.ok(types.includes("WebApplication"),`${route} needs WebApplication data`);assert.ok(types.includes("BreadcrumbList"),`${route} needs breadcrumb data`);}
    if(route.startsWith("/guides/")||route.startsWith("/writing/")){assert.ok(types.includes("Article"),`${route} needs Article data`);assert.ok(types.includes("BreadcrumbList"),`${route} needs breadcrumb data`);}
    const ogImage=metaContent(html,"property","og:image"),twitterImage=metaContent(html,"name","twitter:image");
    assert.ok(ogImage?.startsWith("https://"),`${route} needs an absolute Open Graph image URL`);
    assert.equal(ogImage,twitterImage,`${route} should use the same contextual image for Open Graph and Twitter`);
    const imageUrl=new URL(ogImage);assert.equal(imageUrl.pathname,"/api/og",`${route} should use the contextual image generator`);assert.equal(imageUrl.searchParams.get("path"),route,`${route} image must describe that route`);
    assert.equal(metaContent(html,"property","og:image:width"),"1200");assert.equal(metaContent(html,"property","og:image:height"),"630");
    process.stdout.write(`✓ ${route} — ${headings.map(item=>`H${item.level} ${item.text}`).join(" | ")}\n`);
  }
  for(const path of ["/","/lab/web-doctor","/guides/open-graph"]){const response=await fetch(`${origin}/api/og?path=${encodeURIComponent(path)}`);assert.equal(response.status,200,`${path} sharing image should render`);assert.equal(response.headers.get("content-type"),"image/png");const bytes=(await response.arrayBuffer()).byteLength;assert.ok(bytes>1_000&&bytes<1_000_000,`${path} sharing image should remain lightweight: ${bytes} bytes`);}
  assert.equal((await fetch(`${origin}/api/og?path=${encodeURIComponent("/unknown")}`)).status,404,"unknown image paths must not create arbitrary cards");
  process.stdout.write(`\n${uniqueRoutes.length} public routes passed the rendered heading and JSON-LD audit.\n`);
}finally{
  if(!server.killed)server.kill();
}
