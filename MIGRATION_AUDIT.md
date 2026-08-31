# Portfolio migration audit

## What was found

- **Architecture found during migration:** Create React App with a single large `Home.js`, React Router routes that pointed to hashes, and a Bootstrap-based layout. A separate static/PHP portfolio was also audited.
- **Dependencies:** React 18.1, CRA 5, Bootstrap, React Bootstrap, React Router, Swiper 8, EmailJS, React Scroll, Font Awesome, and multiple unused testing/runtime packages. The application relies on old generated CSS and bundled third-party JavaScript.
- **Reusable content:** Biography, Kathmandu location, résumé link, education, employment, skills, seven project links, phone/email, and three social profiles.
- **Assets:** Seven good 1180–1200px project screenshots, a portrait, logo/favicons, skill logos, and duplicate legacy imagery. The project screenshots are suitable for migration with `next/image`.
- **Contact:** EmailJS runs in the browser with service/template IDs and a public token embedded in source. It shows success before delivery is confirmed and only logs failures.
- **Routing:** The site is effectively a one-page document. Hash sections were incorrectly declared as Router paths; the catch-all route also uses the obsolete React Router API.
- **SEO:** Useful description and Person schema exist, but the name/domain spelling is inconsistent, canonical uses HTTP, social images use invalid relative paths, manifest/favicons point to missing public paths, and there is no sitemap or robust metadata API.
- **Accessibility:** Missing/descriptive alt text is inconsistent; invalid list markup and `class` attributes exist; empty overlay links have no accessible names; links opening new tabs omit `rel`; the loader blocks non-JS rendering; focus styling and reduced-motion handling are absent.
- **Performance:** Bootstrap JS/CSS, Swiper, Font Awesome, React Router, React Scroll, EmailJS, analytics, Hotjar, generated CSS, and the whole single-page client tree load up front. Images are not responsively optimized.
- **Retired code:** The CRA runtime, Bootstrap stack, Swiper carousel, Font Awesome bundle/fonts, generated CSS maps, duplicate images, legacy jQuery/PHP, loader markup, and unused components were removed after migration verification.

## Migration decision

Rewrite the presentation and runtime while preserving the factual content and original project imagery. The new `app/` uses the Next.js App Router, typed content data, server-rendered sections, `next/image`, metadata routes, local security headers, semantic landmarks, visible focus states, and a reduced-motion mode. CSS handles the small amount of motion, so no animation runtime is shipped. Direct email and phone links replace the insecure EmailJS form until a private server-side mail provider is configured.

The previous CRA and static/PHP implementations were removed after the Next.js build, migrated assets and permanent legacy redirects were verified. This file remains as a record of the migration audit, not as documentation of current source directories.

## Phase 2 architecture

The portfolio now uses real App Router URLs for About, Work, individual case studies, Lab utilities, Writing, individual articles, and Contact. Project, career, skills, education, and article content is stored in typed modules under `data/`. Shared navigation, sections, work cards, interactions, lab tools, and small UI primitives live under `components/`.

## Phase 3 visual system

Tailwind v4 theme tokens now control the restrained warm-paper palette, display/body typography, fluid type and spacing scales, editorial grid, content measures, breakpoints, border rules, and motion timings. Shared styles consume semantic tokens rather than introducing page-specific palettes. The system is documented in `DESIGN_SYSTEM.md`; its composition remains legible and visually intentional with motion disabled.

## Phase 4 homepage

The homepage opens with a dedicated cinematic hero island instead of a biography or conventional portfolio introduction. Oversized typography, a restrained CSS-generated art layer, direct Work/Lab paths, and a real featured-project canvas form the first scene. Pointer and scroll updates use passive listeners, `requestAnimationFrame`, CSS variables, and transform/opacity only. Navigation compacts after initial scroll. Coarse pointers and reduced-motion preferences receive a stable, animation-free composition.

## Phase 5 project story

Homepage projects now form a native-scrolling narrative. On desktop, a sticky canvas crossfades and gently scales the active project image while an independent rolling number and project metadata update beside overlapping chapter panels. Intersection Observer identifies the active chapter without intercepting scrolling. Mobile removes the sticky behaviour and presents all seven projects as a simple, image-first vertical sequence. Every chapter links to its canonical `/work/[slug]` case study.

## Profile and portfolio corrections

The preserved Pujan wordmark and original hero portrait are now used in the new interface. Current location is Glasgow, Scotland; Kathmandu remains only on historical Nepal-based employment and education records. Codewing Solutions employment ends on 14 August 2025. Education includes the MSc Information Technology with Web Development course at the University of the West of Scotland, Paisley Campus, without an invented date. Microsoft Word, Excel, PowerPoint, Outlook, and Teams are included as skills. TripCart is now the first project, followed by CoachPodium and the existing WordPress projects.

## Phase 7 Lab

The Lab is driven by a typed tool registry so its index, sitemap entries, and cross-tool navigation scale together. SEO Checker, Meta Tag Generator, Colour Contrast Checker, and CSS Clamp Generator each have a permanent URL and a full-width product workspace rather than a generic card form. All computation remains local in the browser with no account or server request.

## Animated identity

The original Pujan vector paths now render through an accessible animated SVG component. On initial load, the slash, arrow, and letter contours draw in sequence before the brand fill settles. Hover and keyboard focus add only a small arrow movement and one highlight trace. The animation does not loop, uses no JavaScript runtime, and resolves immediately to the finished mark under reduced-motion preferences.

## WEB DOCTOR

The original manual SEO fields have been replaced by a URL-first website diagnostic. WEB DOCTOR normalises bare domains, fetches public HTML server-side, and reports real metadata, headings, language, canonical, viewport, indexing, Open Graph, image-alt, structured-data, response-status, and response-time signals. Each issue includes an explanation and copyable fix. Server safeguards block private/local targets and credentials, validate redirects, cap redirects, time, and response size, disable caching, and rate-limit checks. Manual HTML remains available only under Advanced options.
