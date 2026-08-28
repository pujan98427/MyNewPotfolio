import Link from "next/link";
import { JsonLd } from "@/components/seo/json-ld";
import { breadcrumbStructuredData } from "@/lib/seo/structured-data";

export type BreadcrumbItem={label:string;href:string};

export function Breadcrumbs({items}:{items:readonly BreadcrumbItem[]}){
  const trail=[{label:"Home",href:"/"},...items];
  return <><nav className="breadcrumbs" aria-label="Breadcrumb"><ol>{trail.map((item,index)=>{const current=index===trail.length-1;return <li key={item.href}>{current?<span aria-current="page">{item.label}</span>:<Link href={item.href}>{item.label}</Link>}</li>;})}</ol></nav><JsonLd data={breadcrumbStructuredData(trail)} /></>;
}
