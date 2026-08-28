export type RecommendationId="title"|"description"|"canonical"|"indexing"|"viewport"|"language"|"charset"|"social"|"twitter"|"images"|"schema"|"robots-file"|"sitemap-file"|"favicon"|"h1"|"hreflang"|"links"|"response"|"security-basics";

type RecommendationFactory=(value?:string)=>string;

const RECOMMENDATIONS={
  title:()=>"<title>[Your Page Title]</title>",
  description:()=>'<meta name="description" content="[Describe this page clearly for the people it is intended to help]" />',
  canonical:(url="[Canonical URL]")=>`<link rel="canonical" href="${url}" />`,
  indexing:()=>'<meta name="robots" content="index, follow" />\n<!-- Also remove noindex/none from any X-Robots-Tag response header. -->',
  viewport:()=>'<meta name="viewport" content="width=device-width, initial-scale=1" />',
  language:()=>'<html lang="en">',
  charset:()=>'<meta charset="utf-8" />',
  social:()=>'<meta property="og:title" content="[Page title]" />\n<meta property="og:description" content="[Page description]" />\n<meta property="og:image" content="https://example.com/[social-image].jpg" />',
  twitter:()=>'<meta name="twitter:card" content="summary_large_image" />\n<meta name="twitter:title" content="[Page title]" />\n<meta name="twitter:description" content="[Page description]" />\n<meta name="twitter:image" content="https://example.com/[social-image].jpg" />',
  images:()=>'<img src="[image-file].jpg" alt="[Describe the image purpose]" />',
  schema:()=>'<script type="application/ld+json">{"@context":"https://schema.org","@type":"WebPage","name":"[Page title]","url":"[Canonical URL]"}</script>',
  "robots-file":()=>"User-agent: *\nAllow: /\n\nSitemap: https://example.com/sitemap.xml",
  "sitemap-file":()=>'<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n  <url><loc>https://example.com/[page-path]</loc></url>\n</urlset>',
  favicon:()=>'<link rel="icon" href="/favicon.ico" />',
  h1:()=>"<h1>Clear primary page heading</h1>\n<h2>Major section</h2>\n<h3>Section detail</h3>",
  hreflang:()=>'<link rel="alternate" hreflang="en-GB" href="https://example.com/gb/page" />',
  links:()=>'<a href="/useful-destination">Descriptive link text</a>',
  response:()=>"Configure this route to return HTTP 200 after rendering the requested page.",
  "security-basics":()=>"Content-Security-Policy: default-src 'self'; frame-ancestors 'self'\nStrict-Transport-Security: max-age=31536000; includeSubDomains\nX-Content-Type-Options: nosniff\nReferrer-Policy: strict-origin-when-cross-origin\nPermissions-Policy: camera=(), microphone=(), geolocation=()",
} satisfies Record<RecommendationId,RecommendationFactory>;

export function recommendation<Id extends RecommendationId>(id:Id,value?:string){return RECOMMENDATIONS[id](value);}
