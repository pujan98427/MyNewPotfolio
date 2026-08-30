# Performance quality gate

Measured against the local optimized Next.js production server on 30 August 2026 after the portfolio motion refinements. Asset sizes are gzip-equivalent bytes calculated from the exact JavaScript and CSS files referenced by each page. Local response time is a regression signal, not a substitute for field TTFB or Core Web Vitals.

| Route | Local response | HTML | JS gzip | CSS gzip |
| --- | ---: | ---: | ---: | ---: |
| `/` | 37 ms | 83.2 KB | 187.8 KB | 26.9 KB |
| `/lab` | 24 ms | 35.0 KB | 179.9 KB | 26.9 KB |
| `/lab/web-doctor` | 25 ms | 56.2 KB | 196.9 KB | 26.9 KB |
| `/lab/svg-base64-converter` | 36 ms | 55.4 KB | 190.5 KB | 26.9 KB |
| `/work` | 19 ms | 59.9 KB | 185.4 KB | 26.9 KB |
| `/about` | 16 ms | 42.7 KB | 185.4 KB | 26.9 KB |
| `/guides/title-tags` | 52 ms | 40.3 KB | 179.9 KB | 26.9 KB |

## Enforced delivery checks

- JavaScript stays below 220 KB gzip per audited route.
- CSS stays below 40 KB gzip per audited route.
- Server-rendered HTML stays below 250 KB.
- Local response time stays below 1,000 ms.
- Every audited page includes mobile viewport metadata.
- Rendered image markup includes explicit dimensions.
- No third-party scripts are loaded.
- Every required route returns HTTP 200.

The SVG converter adds approximately 10.4 KB gzip of route JavaScript compared with the non-interactive Lab index. Encoding, decoding, sanitisation and file measurements execute in the browser; the conversion path does not call an application API.

## Source review

- Fonts use self-hosted `next/font/local` WOFF2 files with `display: swap`.
- Meaningful raster images use `next/image`, explicit intrinsic dimensions and responsive `sizes` values.
- Important explanatory content remains in Server Components. Client boundaries are limited to interactive tools, homepage motion and the scrolling project story.
- No analytics, advertising or other third-party runtime scripts are enabled.
- Reduced-motion CSS disables decorative motion, and pointer/scroll animation code batches visual updates through `requestAnimationFrame`.

## Browser-only follow-up

Microsoft Edge is installed in this environment, but no Lighthouse runner is installed in the project. Therefore no new Lighthouse score, LCP, INP or CLS value is claimed from this delivery audit. Before release, run mobile Lighthouse or deployed PageSpeed Insights and require Performance 90+, Accessibility 95+, Best Practices 95+ and SEO 100. Validate the field targets LCP ≤ 2.5 s, INP ≤ 200 ms and CLS ≤ 0.1 after deployment. If motion is implicated in a regression, remove pointer/parallax work first and retain the static composition.

Run the repeatable gate with:

```bash
npm run audit:performance:production
```
