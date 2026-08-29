import { absoluteCanonicalUrl } from "@/lib/seo/canonical";
import { PERSON_NAME, PERSON_ROLE } from "@/lib/identity";

export type JsonLdPrimitive=string|number|boolean|null;
export type JsonLdValue=JsonLdPrimitive|JsonLdNode|readonly JsonLdValue[];
export type JsonLdNode={readonly [key:string]:JsonLdValue|undefined};

const personReference={"@type":"Person",name:PERSON_NAME,url:absoluteCanonicalUrl("/about")} as const;

export function personStructuredData():JsonLdNode{return {"@context":"https://schema.org","@type":"Person",name:PERSON_NAME,url:absoluteCanonicalUrl("/"),jobTitle:PERSON_ROLE,homeLocation:{"@type":"Place",name:"Glasgow, Scotland"}};}
export function websiteStructuredData():JsonLdNode{return {"@context":"https://schema.org","@type":"WebSite",name:PERSON_NAME,url:absoluteCanonicalUrl("/"),description:`Frontend work, practical web writing and free tools built by ${PERSON_NAME}.`,inLanguage:"en-GB",creator:personReference};}
export function breadcrumbStructuredData(items:readonly {label:string;href:string}[]):JsonLdNode{return {"@context":"https://schema.org","@type":"BreadcrumbList",itemListElement:items.map((item,index)=>({"@type":"ListItem",position:index+1,name:item.label,item:absoluteCanonicalUrl(item.href)}))};}
export function webApplicationStructuredData(input:{name:string;description:string;path:string;category:string}):JsonLdNode{return {"@context":"https://schema.org","@type":"WebApplication",name:input.name,description:input.description,url:absoluteCanonicalUrl(input.path),applicationCategory:input.category,isAccessibleForFree:true,creator:personReference,inLanguage:"en-GB"};}
export function articleStructuredData(input:{headline:string;description:string;path:string;datePublished?:string}):JsonLdNode{return {"@context":"https://schema.org","@type":"Article",headline:input.headline,description:input.description,url:absoluteCanonicalUrl(input.path),mainEntityOfPage:absoluteCanonicalUrl(input.path),datePublished:input.datePublished,inLanguage:"en-GB"};}

function assertJsonLdValue(value:JsonLdValue,path:string):void{
  if(value===undefined||typeof value==="function"||typeof value==="symbol"||typeof value==="bigint")throw new Error(`Invalid JSON-LD value at ${path}.`);
  if(Array.isArray(value)){value.forEach((item,index)=>assertJsonLdValue(item,`${path}[${index}]`));return;}
  if(value&&typeof value==="object")for(const [key,item] of Object.entries(value)){if(item!==undefined)assertJsonLdValue(item,`${path}.${key}`);}
}

export function serializeJsonLd(data:JsonLdNode|readonly JsonLdNode[]):string{
  const nodes=Array.isArray(data)?data:[data];
  if(nodes.length===0)throw new Error("JSON-LD requires at least one entity.");
  for(const [index,node] of nodes.entries()){
    if(node["@context"]!=="https://schema.org"||typeof node["@type"]!=="string"||!node["@type"].trim())throw new Error(`JSON-LD entity ${index+1} requires a Schema.org context and type.`);
    assertJsonLdValue(node,`entity[${index}]`);
  }
  const serialized=JSON.stringify(nodes.length===1?nodes[0]:nodes).replace(/</g,"\\u003c");
  JSON.parse(serialized);
  return serialized;
}
