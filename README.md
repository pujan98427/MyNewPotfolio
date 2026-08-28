# Pujan Chapagain — Portfolio

An editorial portfolio rebuilt with Next.js App Router, TypeScript, and Tailwind CSS.

## Local development

```bash
npm install
npm run dev
```

Quality checks: `npm run typecheck`, `npm run lint`, and `npm run build`.

## Routes

- `/about` — biography, experience, education, and skills
- `/work` and `/work/[slug]` — project index and individual case studies
- `/lab` — SEO checker, metadata generator, contrast checker, and CSS clamp generator
- `/writing` and `/writing/[slug]` — article index and individual notes
- `/contact` — direct contact and social links

Structured content lives in `data/`; shared presentation lives in `components/`.

The previous CRA source remains in `src/` and the older static portfolio remains in `old-portfolio/` until the migration is accepted.

## Search Console deployment checklist

1. Set `NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION` to the real HTML-tag verification token supplied by Google. Do not include the surrounding meta tag.
2. Add and verify the preferred `https://poojanchapagain.com.np` property (or the corresponding Domain property) in Google Search Console.
3. Submit `https://poojanchapagain.com.np/sitemap.xml`.
4. Inspect the homepage, Web Doctor, Lab, Work, key case studies, and guides with URL Inspection.
5. Request indexing for the most important newly deployed pages and monitor indexing/canonical reports after migration.

The application consistently uses the non-`www` HTTPS hostname. Production DNS/CDN configuration must also redirect HTTP and `www` requests to that origin.
