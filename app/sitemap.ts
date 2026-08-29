import type { MetadataRoute } from "next";
import { articles } from "@/data/writing";
import { labTools } from "@/data/lab-tools";
import { webGuides } from "@/data/web-guides";
import { INDEXABLE_STATIC_ROUTES } from "@/lib/seo/route-policy";
import { absoluteCanonicalUrl } from "@/lib/seo/canonical";

const entry=(path:string,options:Omit<MetadataRoute.Sitemap[number],"url">={}):MetadataRoute.Sitemap[number]=>({url:absoluteCanonicalUrl(path),...options});

export default function sitemap():MetadataRoute.Sitemap{
  const entries:MetadataRoute.Sitemap=[
    ...INDEXABLE_STATIC_ROUTES.map(path=>entry(path,{changeFrequency:path==="/"?"monthly":"yearly",priority:path==="/"?1:.7})),
    ...labTools.map(tool=>entry(`/lab/${tool.slug}`,{changeFrequency:"monthly",priority:.8})),
    ...webGuides.map(guide=>entry(`/guides/${guide.slug}`,{changeFrequency:"yearly",priority:.7})),
    // Writing records contain real authored publication dates. Other entries
    // deliberately omit lastModified until an authoritative date is stored.
    ...articles.map(article=>entry(`/writing/${article.slug}`,{lastModified:new Date(article.date),changeFrequency:"yearly",priority:.6})),
  ];

  if(new Set(entries.map(item=>item.url)).size!==entries.length){
    throw new Error("The sitemap contains duplicate canonical URLs.");
  }

  return entries;
}
