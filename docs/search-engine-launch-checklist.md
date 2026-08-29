# Search engine launch checklist

Use this checklist after the production deployment is available on its final HTTPS hostname. These steps require access to the domain, hosting configuration, Google Search Console property, and production monitoring data, so they cannot be completed from the source repository alone.

## OWNER ACTION REQUIRED

- [ ] **1. Add the real production domain.** Set `NEXT_PUBLIC_SITE_URL` to the preferred HTTPS origin without a trailing slash. Use the same hostname in redirects, canonical URLs, internal links, Open Graph metadata, robots.txt and sitemap.xml.
- [ ] **2. Verify Google Search Console.** Add the production property and complete ownership verification. Put the genuine verification value in `NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION`; never use a placeholder or invented token.
- [ ] **3. Submit sitemap.xml.** Submit `https://YOUR-PRODUCTION-DOMAIN/sitemap.xml` in Google Search Console and confirm that it can be fetched successfully.
- [ ] **4. Inspect the homepage in URL Inspection.** Inspect the canonical production homepage and confirm that Google can access the rendered page, canonical, resources and indexing directives.
- [ ] **5. Inspect the Web Doctor page.** Inspect `https://YOUR-PRODUCTION-DOMAIN/lab/web-doctor` and verify its selected canonical, rendered content and indexability.
- [ ] **6. Inspect the SVG Base64 Converter.** Inspect `https://YOUR-PRODUCTION-DOMAIN/lab/svg-base64-converter` and verify its selected canonical, rendered educational content and indexability.
- [ ] **7. Request indexing for the important pages.** After inspection succeeds, request indexing for the homepage, Web Doctor and SVG Base64 Converter. Avoid repeatedly requesting unchanged URLs.
- [ ] **8. Monitor the Page Indexing report.** Review excluded, duplicate, crawled-not-indexed, discovered-not-indexed, redirect and server-error groups. Investigate patterns rather than forcing every intentionally non-indexable URL into the index.
- [ ] **9. Monitor Core Web Vitals.** Review mobile first, then desktop. Investigate failing URL groups for LCP, INP and CLS using field data and reproduce issues with PageSpeed Insights or browser performance tooling.
- [ ] **10. Monitor Search Performance queries and CTR.** Track impressions, clicks, average position and click-through rate by query and page. Improve titles and descriptions only when the page content supports the change; do not chase CTR with misleading copy.

## Required production values

```env
NEXT_PUBLIC_SITE_URL=https://YOUR-PRODUCTION-DOMAIN
NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION=
```

The verification value must come from the owner’s real Google Search Console property. It is intentionally blank in source control.
