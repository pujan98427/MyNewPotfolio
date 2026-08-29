# Performance quality gate

Measured against the local optimized Next.js production server on 28 August 2026. Asset sizes are gzip-equivalent bytes calculated from the exact JavaScript and CSS files referenced by each page. Local response time is a regression signal, not a substitute for field TTFB or Core Web Vitals.

| Route | Local response | HTML | JS gzip | CSS gzip |
| --- | ---: | ---: | ---: | ---: |
| `/` | 15 ms | 66.2 KB | 180.7 KB | 22.0 KB |
| `/lab` | 6 ms | 40.0 KB | 173.7 KB | 22.0 KB |
| `/lab/web-doctor` | 5 ms | 60.9 KB | 190.8 KB | 22.0 KB |
| `/lab/svg-base64-converter` | 7 ms | 60.1 KB | 184.1 KB | 22.0 KB |
| `/work` | 5 ms | 56.4 KB | 178.9 KB | 22.0 KB |
| `/work/tripcart` | 4 ms | 47.4 KB | 178.9 KB | 22.0 KB |
| `/guides/title-tags` | 4 ms | 45.3 KB | 173.7 KB | 22.0 KB |

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

This environment did not provide a working instrumented browser or local Lighthouse executable. Therefore no Lighthouse score, LCP, INP or CLS value is claimed here. Run mobile Lighthouse or deployed PageSpeed Insights before release to measure rendering, main-thread tasks and Core Web Vitals under throttled browser conditions.

Run the repeatable gate with:

```bash
npm run audit:performance:production
```
