# Public route SEO audit

Audit date: 2026-08-27  
Preferred origin: `https://poojanchapagain.com.np`  
Scope: App Router source, structured content collections, sitemap generation and discoverable internal links.

## Audit conventions

- All relative canonicals below resolve against `metadataBase` to the preferred HTTPS origin.
- Static page titles use the root `— Pujan Chapagain` title template. The homepage uses the root default title.
- `Global Person` means the truthful `Person` JSON-LD emitted by the root layout. Page-specific schema is identified separately.
- `Default (wrong URL)` means the route currently inherits homepage Open Graph metadata, including the homepage `og:url`. This is not release-ready.
- `Missing` in the OG image column means a child `openGraph` object replaces the parent object without declaring an image.
- Internal-link coverage is based on links rendered by the application, not external backlinks.

## Route inventory

| URL | Page type | Indexable? | Title | Description | Canonical | H1 | OG image | Structured data | Sitemap? | Internal links pointing to it? | Status |
|---|---|---:|---|---|---|---|---|---|---:|---|---|
| `/` | Homepage | Yes | Pujan Chapagain — Frontend Developer | Frontend developer in Glasgow crafting fast, thoughtful digital experiences across React, Vue, Next.js, and WordPress. | `/` | I turn ideas into interfaces. | `/og-image.png` | Global Person | Yes | Logo/command navigation | Ready |
| `/about` | Profile | Yes | About | About Pujan Chapagain’s frontend practice, experience, education, and technical skills. | `/about` | A frontend practice built on curiosity. | Default (wrong URL) | Global Person | Yes | Primary navigation, homepage | Fix OG metadata |
| `/work` | Work listing | Yes | Work | Selected frontend product, publishing, commerce, and WordPress work by Pujan Chapagain. | `/work` | Selected work, considered in context. | Default (wrong URL) | Global Person | Yes | Primary navigation, homepage, case studies | Fix OG metadata |
| `/work/tripcart` | Case study | Yes | TripCart | Tour booking software for operators to build websites, manage itineraries, take bookings, and accept payments. | `/work/tripcart` | TripCart | `/projects/tripcart.png` | Global Person | Yes | Work listing, homepage story, previous/next project navigation | Improve page-specific OG fields/schema |
| `/work/coachpodium` | Case study | Yes | CoachPodium | A focused coaching platform shaped around clear workflows and day-to-day usability. | `/work/coachpodium` | CoachPodium | `/projects/coachpodium.png` | Global Person | Yes | Work listing, homepage story, previous/next project navigation | Improve page-specific OG fields/schema |
| `/work/travelbee` | Case study | Yes | Travelbee Pro | A travel publishing experience balancing dense stories, discovery, and responsive composition. | `/work/travelbee` | Travelbee Pro | `/projects/travelbee-pro.png` | Global Person | Yes | Work listing, homepage story, previous/next project navigation | Improve page-specific OG fields/schema |
| `/work/rishi` | Case study | Yes | Rishi Starter Sites | A flexible collection of starter experiences designed for reuse without losing character. | `/work/rishi` | Rishi Starter Sites | `/projects/rishi.png` | Global Person | Yes | Work listing, homepage story, previous/next project navigation | Improve page-specific OG fields/schema |
| `/work/floral` | Case study | Yes | Blossom Floral Pro | A soft, image-led storefront with a strong editorial rhythm and accessible browsing. | `/work/floral` | Blossom Floral Pro | `/projects/floralpro.png` | Global Person | Yes | Work listing, homepage story, previous/next project navigation | Improve page-specific OG fields/schema |
| `/work/magazine` | Case study | Yes | Blossom Magazine Pro | A modular magazine system built to make large content libraries easy to scan. | `/work/magazine` | Blossom Magazine Pro | `/projects/blossom-magazine-pro.png` | Global Person | Yes | Work listing, homepage story, previous/next project navigation | Improve page-specific OG fields/schema |
| `/work/wellness` | Case study | Yes | Wellness Coach | A calm conversion journey for independent wellness professionals and their clients. | `/work/wellness` | Wellness Coach | `/projects/wellness-coach.png` | Global Person | Yes | Work listing, homepage story, previous/next project navigation | Improve page-specific OG fields/schema |
| `/work/seva` | Case study | Yes | Seva | A direct, human portfolio for creators and service-led personal brands. | `/work/seva` | Seva | `/projects/seva.png` | Global Person | Yes | Work listing, homepage story, previous/next project navigation | Improve page-specific OG fields/schema |
| `/lab` | Tool listing | Yes | Lab | Small, useful frontend and SEO tools made by Pujan Chapagain. | `/lab` | Useful things for the web. | Default (wrong URL) | Global Person | Yes | Primary navigation, homepage, every tool back-link | Fix OG metadata |
| `/lab/web-doctor` | Web application | Yes | Free Website SEO Checker — Web Doctor | Enter a public URL to inspect page metadata, headings, indexability and social sharing, with clear fixes and no signup required. | `/lab/web-doctor` | **Missing** | Missing | Global Person; WebApplication; WebSite; BreadcrumbList | Yes | Lab listing, homepage, command navigation, tool switcher, guides | **Release blocker: add H1 and OG image** |
| `/lab/web-doctor/changelog` | Product changelog | Yes | Changelog — Web Doctor | Product updates and improvements to Web Doctor, the free website diagnostic tool. | `/lab/web-doctor/changelog` | Web Doctor changelog. | Default (wrong URL) | Global Person | Yes | Web Doctor educational content | Fix OG metadata |
| `/lab/meta-generator` | Web application | Yes | Meta Generator | Draft a page title and description with a live search result preview. | `/lab/meta-generator` | Meta generator | Default (wrong URL) | Global Person | Yes | Lab listing, homepage, command navigation, tool switcher, Web Doctor related tools | Fix OG metadata; consider WebApplication schema |
| `/lab/contrast-checker` | Web application | Yes | Contrast Checker | Check colour contrast ratios against WCAG AA and AAA thresholds. | `/lab/contrast-checker` | Contrast checker | Default (wrong URL) | Global Person | Yes | Lab listing, homepage, command navigation, tool switcher, Web Doctor related tools | Fix OG metadata; consider WebApplication schema |
| `/lab/clamp-generator` | Web application | Yes | CSS Clamp Generator | Generate accessible fluid CSS clamp values with a responsive live preview. | `/lab/clamp-generator` | CSS clamp generator | Default (wrong URL) | Global Person | Yes | Lab listing, homepage, command navigation, tool switcher, Web Doctor related tools | Fix OG metadata; consider WebApplication schema |
| `/lab/open-graph-preview` | Web application | Yes | Open Graph Preview | Draft Open Graph metadata and preview how a shared page card could appear. | `/lab/open-graph-preview` | Open Graph preview | Default (wrong URL) | Global Person | Yes | Lab listing, command navigation, tool switcher, Web Doctor related tools | Fix OG metadata; consider WebApplication schema |
| `/lab/seo-checker` | Permanent redirect | No | N/A | N/A | Redirects to `/lab/web-doctor` | N/A | N/A | N/A | No | Legacy/external URLs only | Correctly excluded |
| `/guides/title-tags` | Educational article | Yes | Title tags that identify the right page | How to write, implement and review useful HTML title tags without relying on arbitrary length myths. | `/guides/title-tags` | Title tags that identify the right page | Missing | Global Person | Yes | Web Doctor findings/education and related-guide links | Add OG image and Article schema |
| `/guides/meta-descriptions` | Educational article | Yes | Meta descriptions as honest invitations | Write useful page summaries while understanding when search engines may generate a different snippet. | `/guides/meta-descriptions` | Meta descriptions as honest invitations | Missing | Global Person | Yes | Web Doctor findings/education and related-guide links | Add OG image and Article schema |
| `/guides/canonical-urls` | Educational article | Yes | Canonical URLs without mixed signals | Understand canonical hints, duplicate URL variants, and the signals that should agree with the preferred URL. | `/guides/canonical-urls` | Canonical URLs without mixed signals | Missing | Global Person | Yes | Web Doctor findings/education and related-guide links | Add OG image and Article schema |
| `/guides/robots-txt` | Educational article | Yes | robots.txt as a crawl boundary | Use robots.txt accurately without confusing crawl control with search-result removal or access security. | `/guides/robots-txt` | robots.txt as a crawl boundary | Missing | Global Person | Yes | Web Doctor findings/education and related-guide links | Add OG image and Article schema |
| `/guides/open-graph` | Educational article | Yes | Open Graph previews people can trust | Create robust social-sharing metadata with clear titles, descriptions and safely accessible images. | `/guides/open-graph` | Open Graph previews people can trust | Missing | Global Person | Yes | Web Doctor findings/education and related-guide links | Add OG image and Article schema |
| `/guides/structured-data` | Educational article | Yes | Structured data grounded in visible truth | Add JSON-LD that accurately describes page entities without promising rich-result eligibility. | `/guides/structured-data` | Structured data grounded in visible truth | Missing | Global Person | Yes | Web Doctor findings/education and related-guide links | Add OG image and Article schema |
| `/writing` | Article listing | Yes | Writing | Notes by Pujan Chapagain on frontend craft, interaction, editorial design, and performance. | `/writing` | Notes from the workbench. | Default (wrong URL) | Global Person | Yes | Primary/command navigation, article back-links | Fix OG metadata |
| `/writing/interfaces-that-feel-fast` | Article | Yes | Interfaces that feel fast | Performance is measured in milliseconds, but perceived speed is shaped by hierarchy, feedback, and restraint. | `/writing/interfaces-that-feel-fast` | Interfaces that feel fast | Missing | Global Person | Yes | Writing listing | Add OG image and Article schema |
| `/writing/editorial-grids-for-the-web` | Article | Yes | Editorial grids for the web | A grid is not a cage. Used well, it creates enough order for asymmetry to feel deliberate. | `/writing/editorial-grids-for-the-web` | Editorial grids for the web | Missing | Global Person | Yes | Writing listing | Add OG image and Article schema |
| `/contact` | Contact | Yes | Contact | Contact frontend developer Pujan Chapagain in Glasgow, Scotland. | `/contact` | Have something interesting in mind? | Default (wrong URL) | Global Person | Yes | Primary navigation, availability CTA, footer, legal pages | Fix OG metadata |
| `/privacy` | Legal | Yes | Privacy | How this portfolio and Web Doctor handle submitted URLs, temporary reports, browser storage, logs, analytics, advertising and third-party services. | `/privacy` | Privacy, stated plainly. | Default (wrong URL) | Global Person | Yes | Footer, Web Doctor, cookies, terms | Fix OG metadata; owner/legal review remains |
| `/cookies` | Legal | Yes | Cookies | The current cookie and browser-storage use on Pujan Chapagain’s portfolio and Web Doctor. | `/cookies` | A small, honest storage inventory. | Default (wrong URL) | Global Person | Yes | Footer, privacy, terms | Fix OG metadata; deployment review remains |
| `/terms` | Legal | Yes | Terms | Draft terms for using this portfolio, its educational content and the free Web Doctor diagnostic tool. | `/terms` | Terms for using this site. | Default (wrong URL) | Global Person | Yes | Footer, privacy, cookies | Fix OG metadata; owner/legal review remains |

## Non-page public and private routes

| URL | Type | Indexing treatment | Audit result |
|---|---|---|---|
| `/sitemap.xml` | Discovery file | Not a content page | Generated from static routes plus project, Lab tool, guide and writing data; 31 canonical content URLs expected. |
| `/robots.txt` | Crawl policy | Not a content page | Allows public crawling, disallows `/api/`, and declares the canonical sitemap URL. |
| `/ads.txt` | Advertising declaration | Not a content page | Configuration-backed; must not publish a fabricated seller entry. |
| `/api/web-doctor` | API | No | Excluded from sitemap and disallowed in robots.txt. |
| `/api/web-doctor/analyse` | API | No | Excluded from sitemap and disallowed in robots.txt. |
| Unknown dynamic slugs / 404 | Error response | No | `notFound()` used by project, guide and writing dynamic routes; correctly absent from sitemap. |

## Release findings

### Blocking

1. `/lab/web-doctor` has no H1 because `ToolFrame` suppresses its header in immersive mode and the intake starts at H2.
2. Site-wide Open Graph metadata is not route-safe. Static routes inherit the homepage `og:url`; routes that define partial Open Graph objects can lose the default image because Next.js replaces nested metadata objects.

### Important improvements

1. Add a shared metadata builder so canonical, Open Graph URL/title/description/image and Twitter fields remain aligned on every indexable route.
2. Add truthful `Article` JSON-LD to writing and guide detail pages, using existing authored titles/descriptions and real writing dates only.
3. Add truthful `WebApplication` JSON-LD to the standalone Lab tools where it describes the visible product.
4. Keep the current sitemap data-driven and add the SVG/Base64 tool to `labTools`; that will make listing links, tool-switcher links and sitemap inclusion derive from the same record.
5. Re-run the rendered audit after implementation to verify final HTML, status codes, canonical URLs, sitemap URLs, headings and social tags rather than relying only on source declarations.

## Baseline summary

- Public indexable URLs: **31**
- Permanent redirect routes: **1**
- Private API routes: **2**
- Indexable URLs represented by sitemap generation: **31 / 31**
- Pages with a source-level canonical: **31 / 31**
- Pages with an H1: **30 / 31**
- Pages with route-correct complete Open Graph metadata: **1 / 31 confirmed complete**; 8 project pages have route-specific images/URLs but incomplete page-specific Open Graph fields
- Orphaned indexable pages found: **0**

This is the pre-hardening baseline. A route is not considered release-ready until the blocking findings are corrected and the final production HTML is re-audited.

### A3 metadata hardening update

Implemented after the baseline audit:

- `lib/seo/metadata.ts` now creates a complete metadata object for every indexable child page: unique authored title and description, self-referencing canonical, explicit `index, follow`, route-correct Open Graph fields and a large-image Twitter card.
- Static pages provide their own accurate copy through `createPageMetadata()`.
- Project, guide and writing detail routes use `generateMetadata()` with their structured content records.
- Project case studies use their own project imagery; other routes use the site share image with route-specific alternative text.
- The homepage metadata now identifies both the frontend portfolio and its free web tools.
- Web Doctor uses the exact absolute title `Free Website SEO Checker — Web Doctor` rather than receiving the site title suffix.

The earlier Open Graph statuses in the baseline table record the state found during A1. They are retained as audit history and superseded by this implementation note, pending rendered production verification.

### A4 canonical origin update

- `NEXT_PUBLIC_SITE_URL` is the single deployment setting for the canonical public origin.
- `lib/site-config.ts` rejects missing, malformed, non-HTTPS and path-bearing values before metadata or discovery files can be generated.
- Root `metadataBase`, sitemap URLs, robots host/sitemap declarations, Web Doctor structured data, crawler identification and hostname redirects consume the validated origin.
- The former static `public/robots.txt` was replaced with `app/robots.ts` so its host and sitemap cannot drift away from the configured origin.
- `.env.example` documents the real production setting; `.env.local` supplies it for local build verification and remains outside committed deployment configuration.

### A5 canonical signal alignment

- `lib/seo/canonical.ts` is the shared invariant for absolute canonical URLs and rejects query strings, fragments, protocol-relative paths and non-root trailing slashes.
- Every indexable page metadata object uses the same clean path for both `rel=canonical` and `og:url`.
- The homepage is consistently emitted as the origin with `/`; sitemap entries use the same canonical URL builder as structured data.
- `trailingSlash: false` selects the no-trailing-slash form for all non-root routes.
- Permanent redirect rules derive the alternate `www`/non-`www` hostname from the configured preferred hostname and redirect it to `NEXT_PUBLIC_SITE_URL`.
- Requests reported by the deployment proxy as HTTP redirect permanently to the same configured HTTPS origin.
- Internal application links remain root-relative, so they inherit the preferred hostname and HTTPS scheme rather than encoding a competing origin.

### A6 legacy URL preservation

Legacy sources inspected: current `src/` CRA routing and navigation, `public/index.html`, retained `old-portfolio/` HTML/PHP files, migration notes and Git path history (including the historical `external/` copy).

| Old URL | Permanent destination | Evidence / equivalence |
|---|---|---|
| `/home` | `/` | Explicit CRA home route |
| `/index.html` | `/` | Static portfolio home document |
| `/index.php` | `/` | PHP portfolio home document |
| `/contact.html` | `/contact` | Static contact page |
| `/external` | `/` | Historical copy of portfolio home |
| `/external/index.html` | `/` | Historical static home document |
| `/external/index.php` | `/` | Historical PHP home document |
| `/external/contact.html` | `/contact` | Historical contact page |
| `/old-portfolio` | `/` | Retained copy of portfolio home |
| `/old-portfolio/index.html` | `/` | Retained static home document |
| `/old-portfolio/index.php` | `/` | Retained PHP home document |
| `/old-portfolio/contact.html` | `/contact` | Retained contact page |

Intentionally not redirected:

- `/portfolio-details.html`: linked generically from several old projects but no page exists and no unique project destination can be inferred.
- `/threeJsAnimation.html`: standalone legacy experiment with no equivalent current content.
- `/mail.php`: form-processing endpoint, not a public content page.
- Unknown files or paths: no global missing-page redirect exists; they return the explicit 404 response.

Old `#about`, `#job-history`, `#skill`, `#latest-work` and `#contact` values were fragments within the homepage, not independent request paths. Browsers do not send fragments to the server, so they cannot participate in HTTP redirect rules.

### A7 dynamic sitemap

The installed Next.js 16 `sitemap.ts` metadata-route convention is used. `app/sitemap.ts` composes its canonical URL set from:

- the reviewed static indexability policy;
- every structured Lab tool;
- every structured project case study;
- every authored Web Doctor guide; and
- every authored writing article.

This keeps future additions—such as the SVG/Base64 converter—discoverable when their public route is added to the corresponding structured collection.

Safeguards:

- every URL passes through the shared HTTPS canonical builder;
- duplicate canonical URLs fail sitemap generation instead of being published silently;
- APIs, redirects, 404s, temporary reports and query variants have no sitemap source;
- only writing entries receive `lastModified`, using their real stored publication date;
- other routes omit `lastModified` rather than generating a false current timestamp on each request.

### A8 robots.txt

`app/robots.ts` follows the installed Next.js 16 metadata-route contract and emits one public production policy:

```text
User-Agent: *
Allow: /
Disallow: /api/

Host: https://configured-production-origin
Sitemap: https://configured-production-origin/sitemap.xml
```

The host and sitemap derive from `NEXT_PUBLIC_SITE_URL`. There is no competing static `public/robots.txt`. No rule blocks `/_next/`, images, stylesheets, scripts, Lab pages, Work pages or guides. Indexing decisions remain in page metadata; robots.txt contains no `noindex` directive and is not used as a substitute for one.

### A9 Search Console verification

The root layout reads `NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION`, trims it and adds `metadata.verification.google` only when a real non-empty value exists. The example environment value remains blank, so no fabricated verification tag is published. Deployment and post-migration actions are recorded in `docs/search-console-launch-checklist.md`.

### A10–A11 rendered content and heading audit

All App Router pages remain Server Components unless browser state or event handling is required. Shared server-rendered shells provide visible introductions around interactive Lab clients. Web Doctor’s page composes its interactive analyser with the server-rendered `WebDoctorEducation` content covering its checks and limitations; useful explanatory text exists before any analysis is started.

Heading patterns reviewed:

| Route family | H1 source | Following structure | Result |
|---|---|---|---|
| Homepage | `HeroStage`: “I turn ideas into interfaces.” | Homepage sections use H2; project chapters use H3 | Pass |
| About, Work, Lab, Writing, Contact, legal | `PageIntro` | Content sections use H2 and nested groups use H3 | Pass |
| Project case studies | `CaseStudy`: project title | Narrative chapters use H2 | Pass |
| Guides and writing details | Authored title | Article sections use H2 | Pass |
| Standard Lab tools | `ToolFrame`: tool name | Interactive labels are not headings; related tool navigation is not promoted to a heading | Pass |
| Web Doctor | Analyser intake: “Check your website.” | Stable educational/report sections use H2 and nested topics use H3 | Fixed |
| Changelog | “Web Doctor changelog.” | Releases use H2 | Pass |
| 404 | “This page isn’t here.” | No artificial headings | Pass |

The future `/lab/svg-base64-converter` route must not be published as an empty placeholder. Its Server Component page is required to render the H1, concise explanation, supported formats, instructions, privacy statement, related tools, educational sections and ordered H2 outline alongside the isolated interactive converter client. Adding its structured Lab record will then expose it through internal links and the sitemap in the same release.

Rendered verification is available through `npm run test:headings`. It discovers every structured project, Lab tool, guide and writing slug, adds the static public routes, fetches their generated HTML, isolates `<main>`, and verifies exactly one non-empty H1 followed by a hierarchy with no skipped levels. Global navigation and dialog headings are intentionally outside the page-main outline.

### A12 semantic HTML

The component audit confirms native controls are used throughout: anchors/Next Links navigate, buttons perform actions, forms contain labelled controls, and no `div`, `span`, paragraph, list item, section or article is made clickable as a substitute control. Every button declares `type` and no navigation anchor uses an empty or JavaScript URL.

Landmark refinements made during the audit:

- the homepage free-tool links are a labelled `nav`, not a generic section;
- contact information uses `address`, with the browser’s default italic presentation neutralised by the existing layout class;
- social profiles form a labelled `nav`;
- the generated Open Graph preview is a self-contained `article`;
- global identity/navigation remain in `header`, page content in `main`, contextual content in `aside`, and legal navigation in `footer`.

## A2 indexing classification

The enforceable source policy lives in `lib/seo/route-policy.ts`. The sitemap consumes its static indexable list directly; dynamic public URLs continue to come from the project, Lab tool, guide and writing collections.

### Indexable

- Homepage, About, Work listing and all valid project case studies
- Lab listing and every useful standalone Lab tool
- Web Doctor and its public changelog
- Writing listing and all valid authored articles
- Every valid educational guide
- Contact, Privacy, Cookies and Terms
- The future SVG/Base64 converter once its structured Lab-tool record and public route exist

The Open Graph Preview route is a useful standalone tool, not a temporary preview-result URL, so it remains indexable.

### Non-indexable or excluded from content discovery

- `/lab/seo-checker`: permanent duplicate redirect to `/lab/web-doctor`
- `/api/**`: machine endpoints, disallowed in robots.txt and absent from the sitemap
- Invalid dynamic slugs and other 404 responses: explicit `noindex, nofollow`
- Web Doctor reports: temporary state rendered within `/lab/web-doctor`; there is no separate results URL to index
- Command-navigation searches: temporary in-browser state; there is no search-results route
- Framework development routes and assets: not content routes and absent from the sitemap

### Verification guard

The unit/security test suite now verifies that:

1. root metadata explicitly remains `index: true, follow: true`;
2. the 404 page explicitly emits `noindex, nofollow`;
3. the sitemap consumes the reviewed indexable route policy;
4. APIs and the legacy redirect cannot enter the sitemap; and
5. robots.txt permits public pages while excluding `/api/`.

Run `npm test` before the production build. A rendered production audit is still required after metadata hardening because source-level intent alone cannot prove the final response tags and status codes.

## A13 internal linking

The public content graph is intentional and uses descriptive anchors rather than repeated keyword-heavy boilerplate:

| Source | Primary destination | Supporting destinations |
|---|---|---|
| Homepage | Lab listing | Selected individual tools |
| Lab listing | Every published tool from `labTools` | Web Doctor and the other utility routes |
| Web Doctor findings | The guide matching the diagnosed signal | Related free tools after the useful report content |
| Web Doctor education | Title, description, canonical, robots, Open Graph and structured-data guides | Web Doctor changelog |
| Educational guides | Related guides | Web Doctor for a practical website check |
| Standard Lab tools | Every other published Lab tool through the shared tool navigation | Lab listing through global navigation |

Finding-to-guide links are contextual: for example, a canonical finding links to “How canonical URLs work” and a social metadata finding links to “How Open Graph works.” Links remain normal crawlable anchors rendered by Next.js `Link`; analytics only observes the optional interaction and does not replace navigation.

The future SVG/Base64 converter remains excluded until its useful page and converter are complete. Its release gate includes descriptive links to the Meta Tag Generator, Web Doctor, Contrast Checker, CSS Clamp Generator and a relevant educational guide. Once its structured `labTools` entry is added, the existing Lab listing, shared tool navigation and sitemap will expose it without a separate hand-maintained link list.

The unit suite protects the core graph: homepage to Lab, Lab collection to tools, findings and educational content to guides, guides back to Web Doctor, and Web Doctor to related tools. It also rejects vague “click here” or “learn more” anchor copy in these paths.

## A14 breadcrumbs

One shared server-rendered breadcrumb component now covers every deeper public route family:

- `Home / Work / [case study]`
- `Home / Lab / [tool]`
- `Home / Lab / Web Doctor / Changelog`
- `Home / Writing / [article]`
- `Home / Web Doctor / [guide]`

The visible trail is an ordered list inside `<nav aria-label="Breadcrumb">`; the final item is plain text with `aria-current="page"`, while ancestors remain crawlable links. Long current-page labels truncate visually without changing their accessible text.

The same typed item array produces a `BreadcrumbList` JSON-LD block with one-based positions and absolute URLs from the shared canonical HTTPS builder. JSON is serialized in a native script element and `<` characters are escaped according to the installed Next.js JSON-LD guidance. Web Doctor's older hand-authored breadcrumb schema was removed so the page emits only the shared trail rather than two competing BreadcrumbList blocks.

## A15 structured data

All first-party structured data now passes through one typed server renderer and a small set of explicit builders in `lib/seo/structured-data.ts`. The renderer rejects empty entity collections, missing Schema.org contexts, missing types and non-JSON values; it escapes `<` before output and parses the serialized result as a final syntax assertion.

Published mappings are deliberately narrow:

| Page | Structured data |
|---|---|
| Homepage | `Person`, `WebSite` |
| Project case study | `CreativeWork`, `BreadcrumbList` |
| Individual Lab tool | `WebApplication`, `BreadcrumbList` |
| Writing article | `Article`, `BreadcrumbList` |
| Web Doctor guide | `Article`, `BreadcrumbList` |
| Web Doctor changelog | `BreadcrumbList` only |

Values come from the same project, Lab, writing and guide records used to render each page. Writing publication dates are included because they are visibly rendered from stored dates; guides do not receive fabricated publication dates. Project authorship is not overstated: Pujan is described as a contributor, matching the visible role and responsibilities. The site does not emit ratings, reviews, prices, offers or invented organisation data.

The rendered route audit parses every JSON-LD script as JSON, verifies its context and type, checks the expected entity types by route family and rejects unsupported commercial or review properties.

## A16 site identity consistency

The public personal name is **Pujan Chapagain**. A small identity module now provides that canonical spelling to root titles, title templates, Open Graph metadata, Twitter metadata, structured data and the homepage hero. Existing visible headings, portrait alternatives, navigation accessible name, footer, About copy, Contact metadata and article/listing descriptions were audited against the same spelling.

The obsolete `public/index.html` was removed. It was a pre-migration document containing the alternate “Poojan” title, outdated Kathmandu copy, an HTTP canonical and legacy metadata; keeping it in the public asset tree risked exposing contradictory identity and location information outside the App Router.

Two lowercase URL identifiers intentionally retain their established spelling and are not presented as personal-name aliases:

- the configured production hostname, `poojanchapagain.com.np`;
- the existing Facebook profile path, `/poojan.chapagain`.

The OG image was inspected directly and contains photography rather than embedded name text. Its Open Graph and Twitter alternative text uses the canonical `Pujan Chapagain` spelling. Automated checks reject `Poojan Chapagain` and `alternateName` in public application sources while confirming the canonical spelling across metadata, structured data, visible identity components and social-profile navigation.

## A17 Open Graph system

Important public pages now use a contextual server-generated sharing-card system rather than inheriting the homepage screenshot. One bounded resolver accepts only known canonical routes and derives card copy from the same static page definitions or structured project, Lab tool, guide and writing records used by the page. Unknown paths return 404, preventing arbitrary user text and unlimited cache variants.

Coverage includes the homepage, About, Work, every project, Lab, every published tool, every guide, Writing, every article, Contact, legal pages and the Web Doctor changelog. The future SVG/Base64 converter will enter the system automatically when its published `labTools` record and route are added.

Every metadata result declares:

- an absolute HTTPS image URL on the preferred production origin;
- PNG content;
- 1200 × 630 dimensions;
- contextual alternative text;
- the same image for Open Graph and Twitter cards.

The generated editorial card uses large high-contrast text, a restrained palette and a small decorative layer. Responses are cached for one hour in browsers and one day at shared caches with stale revalidation. The rendered audit checks every page's image URL and dimensions, renders representative Web Doctor, project and guide cards, verifies PNG responses remain below 1 MB, and confirms unknown paths return 404.

## A18 social metadata

The shared metadata builder produces a complete route-specific social set for every indexable page that uses it: `og:title`, `og:description`, `og:url`, `og:type`, `og:image`, image dimensions/type/alternative text, and the corresponding Twitter/X `summary_large_image` card values. Writing entries and guides declare the supported `article` Open Graph type; tools, listings, projects and static informational pages use `website` because Open Graph does not define a more accurate supported project/tool page type.

Both `og:url` and image URLs are constructed explicitly as absolute HTTPS URLs on the configured production origin. Canonical paths still remain the single route input, preventing social URLs from diverging through hostname, protocol, query-string or trailing-slash variants. Twitter/X uses the same contextual image and truthful copy; no account handle is declared because no verified site-wide X profile has been provided.

## A19 image SEO

All rendered portfolio imagery uses `next/image`, explicit source dimensions and responsive `sizes`. Next.js serves WebP when the browser supports it and falls back safely to the source PNG. Source files remain modest—the largest project screenshot is under 250 KB—and Next.js generates appropriately sized responses instead of shipping one full-width source to every viewport.

The project data model now stores the real pixel dimensions and one factual visual description beside each screenshot. This fixed incorrect 1200 × 900 declarations for the 902 × 768 TripCart image and 1180 × 713 CoachPodium image, and replaces generic “website interface” alternatives with descriptions of the visible page content. Listing cards, mobile project stories and case-study hero figures all consume this single record so their dimensions and alternatives cannot drift.

The desktop sticky project canvas sits inside `aria-hidden="true"` because the same project name, context and screenshot are presented in the adjacent chapter; its images correctly keep `alt=""`. The repeated cropped screenshot later in each case study also uses an empty alternative and a visible caption, avoiding duplicate announcements. Portrait alternatives describe the person and visible presentation without stuffing role or location keywords.

Used assets were renamed for clarity, including `pujan-chapagain-portrait.png`, `pujan-chapagain-hero.png`, `rishi-starter-sites.png`, `blossom-floral-pro.png` and `seva-personal-brand-theme.png`. Automated checks read each PNG header and compare its actual dimensions with the structured record, require `alt`, dimensions and `sizes` on every Next Image instance, verify unique restrained project alternatives, and ensure obsolete generic filenames are gone.

## A20 performance audit

Lighthouse 13.4.1 was run in its default mobile configuration against a local optimized Next.js production server using Microsoft Edge. These are synthetic lab measurements, not field Core Web Vitals. In particular, Lighthouse reports Total Blocking Time as a responsiveness proxy; it cannot certify real-user INP without field interaction data.

The final representative run produced:

| Route | Performance | Accessibility | Best practices | SEO | LCP | TBT | CLS |
|---|---:|---:|---:|---:|---:|---:|---:|
| `/` | 66 | 100 | 100 | 100 | 3.50 s | 1,071 ms | 0 |
| `/lab/web-doctor` | 65 | 100 | 100 | 100 | 3.28 s | 1,521 ms | 0.001 |
| `/work` | 85 | 100 | 100 | 100 | 3.68 s | 200 ms | 0 |
| `/work/tripcart` | 86 | 100 | 100 | 100 | 3.23 s | 225 ms | 0 |
| `/guides/title-tags` | 65 | 100 | 100 | 100 | 3.41 s | 1,268 ms | 0 |

The local Windows results showed substantial run-to-run CPU variance: for example, a supported webpack comparison measured Web Doctor at 88 but Work at 67, while the preceding Turbopack run measured the same pages at 65 and 85. The scores above are therefore retained as an honest reproducible snapshot, not presented as guaranteed production scores. Accessibility, Best Practices and SEO meet the requested thresholds across all tested routes; CLS is comfortably within target. Performance and LCP do not yet meet the release target consistently.

Implemented improvements supported by the reports:

- removed the global React client boundary from navigation;
- kept the command palette and compact header as a small progressively enhanced script;
- limited the desktop homepage story canvas to its current image instead of rendering all eight images concurrently;
- fixed Work card accessible-name mismatches;
- fixed the case-study caption contrast failure;
- retained optimized local fonts, responsive Next images, fixed image dimensions, reduced-motion rules, and disabled advertising/analytics by default.

`/lab/svg-base64-converter` was added after this measurement set, so it still requires its own production Lighthouse run before the six-route performance matrix is complete. No score has been fabricated from its earlier missing-route state.

Production Core Web Vitals must be verified after deployment with field data (for example Search Console's Core Web Vitals report or a privacy-reviewed `useReportWebVitals` endpoint). The real-user target remains LCP ≤ 2.5 s, INP ≤ 200 ms and CLS ≤ 0.1.

## A21 JavaScript architecture

The root layout remains a Server Component. Navigation, footer, breadcrumbs, page introductions, projects, case-study narratives, Lab descriptions, guide bodies, legal copy and structured data are rendered as HTML on the server. None of that important text is created in `useEffect`.

Client Components are confined to functionality that requires browser state: the homepage pointer/scroll treatment, sticky project-story state, Web Doctor, generators/checkers, copy controls and the disabled advertisement placeholder. The former site-wide navigation Client Component was converted to server-rendered markup with a small enhancement script, so static content routes no longer inherit a React boundary merely to support compact-on-scroll and command navigation.

## A22 HTTP status codes

Status codes were checked against an optimized local production server without following redirects:

| Route class | Representative routes | Result |
|---|---|---:|
| Valid static pages | `/`, `/about`, `/work`, `/lab/web-doctor` | 200 |
| Valid generated pages | `/work/tripcart`, `/guides/title-tags` | 200 |
| Legacy permanent redirects | `/home`, `/contact.html` | 308 |
| Superseded tool redirect | `/lab/seo-checker` | 308 |
| Unknown route | `/does-not-exist-a22` | 404 |
| Unknown project | `/work/not-a-real-project` | 404 |
| Unknown guide | `/guides/not-a-real-guide` | 404 |
| Unknown article | `/writing/not-a-real-article` | 404 |

The root `app/not-found.tsx` remains a useful server-rendered page with a clear 404 label, explanation and route back to the homepage. Next.js serves it with a genuine 404 for unmatched and synchronously rejected dynamic routes and adds `robots: noindex`; it is not a visually disguised 200 response. No catch-all redirect sends missing URLs to the homepage.

`npm run test:status` repeats the HTTP assertions against `TEST_ORIGIN` (default `http://127.0.0.1:3100`) while a production server is running. It also verifies redirect destinations and confirms the custom error content and `noindex` metadata are present on 404 responses.

## A23 SEO myths and content integrity

The public application contains no `meta name="keywords"` tag or Metadata API `keywords` field. Titles and descriptions remain route-specific summaries written for people rather than lists of repeated search phrases.

The CSS audit found only functional hiding: responsive presentation, filtered diagnostic results, reserved advertising before consent, print exclusions, decorative layers and the conventional screen-reader-only utility. There is no off-screen keyword block, zero-sized keyword text or SEO-specific hidden content.

Public route collections are deliberately bounded and source-controlled: projects, Lab tools, six substantial Web Doctor guides and two original writing entries. There is no location-driven dynamic route, doorway-page generator, bulk page factory or catch-all content route. Geographic references are limited to truthful identity, contact, education and employment context; they are not repeated across pages as ranking phrases.

Content records do not carry minimum-word-count targets. The Web Doctor recommendations explicitly reject universal word-count rules and ranking guarantees. A regression test now rejects keywords metadata, suspicious text-hiding patterns, geographic dynamic-route names, word-count myths, excessive geographic repetition, duplicate slugs and unexpectedly large generated content collections.

## A24 original tool-page content

Each published Lab tool now pairs its interactive client component with original server-rendered guidance. Meta Generator, Colour Contrast Checker, CSS Clamp Generator and Open Graph Preview share a semantic editorial component while drawing from separate tool-specific content records. Every record explains the tool’s purpose, intended audience, calculation or transformation, four-step workflow, privacy behaviour, three common mistakes and three genuinely relevant internal links.

The guidance is specific rather than interchangeable filler. For example, the contrast page explains composited backgrounds and the scope of large-text thresholds; the clamp page describes slope, intercept and bounded viewport scaling; the Open Graph page distinguishes a neutral preview from a platform guarantee; and the metadata page treats length as presentation guidance rather than a ranking rule.

Web Doctor retains its deeper bespoke education system. Its server-rendered content covers the public-request workflow, privacy link, manual fallback, ten diagnostic topics, practical limitations, ranking disclaimers, guide library and related tools. Important explanations do not wait for an analysis result or exist only in client state.

Automated coverage requires every standard-tool record to retain substantial unique fields, at least four usage steps, three common-problem explanations and three related resources. It also verifies that the education renderer is a Server Component and that every published tool page composes the matching content.

## Part B — SVG ↔ Base64 Converter

`/lab/svg-base64-converter` is now a complete public Lab route and structured tool record. It is automatically linked from the Lab index and every shared tool switcher, included in the dynamic sitemap, resolved by the contextual Open Graph endpoint and represented by truthful `WebApplication` and breadcrumb structured data.

The converter supports SVG markup to plain Base64, SVG markup to a complete `data:image/svg+xml;base64` URI, and either Base64 format back to readable SVG. UTF-8 byte conversion preserves Unicode rather than passing JavaScript strings directly to `btoa`. Inputs are limited to 1 MB, malformed Base64 is rejected, decoded content must contain a complete SVG root, and local file selection accepts SVG files only.

Conversion, file reading and output generation happen in the browser. Nothing is submitted to an API. Users can copy each output with local “Copied” feedback or download decoded markup as an `.svg` file. The page does not iframe or execute supplied SVG markup.

The surrounding Server Component renders the H1, description, privacy statement, supported workflows, technical explanation, common failure cases and related internal links before the converter hydrates. Automated tests cover Unicode round trips, data-URI decoding, invalid payload rejection, size enforcement, metadata, file input, copy/download controls and Lab collection registration.

### B2 zero-hassle input

SVG-to-Base64 input has one obvious markup field and one file drop target—there is no input-type selector. Users can paste a complete `<svg>` document, choose a local `.svg` file, or drag and drop the file. Paste events inspect their plain-text payload; when it contains an SVG root, the converter validates and encodes it immediately. File selection and drop use the same validator and also generate output immediately.

All three paths enforce a complete opening and closing SVG root, UTF-8 byte measurement and the shared 1 MB limit. A non-SVG paste remains editable instead of being unexpectedly intercepted, while invalid uploaded or dropped content receives the same visible error treatment as manual conversion.

### B3 SVG to Base64 output

Encoded output uses two explicit tabs: **Base64** for the raw payload and **Data URI** for the complete `data:image/svg+xml;base64,…` value. The controls expose tab, tablist and tabpanel relationships with matching IDs, selection state and controls metadata. Both tabs remain keyboard-focusable.

Each panel owns a specifically labelled Copy button. Copying changes only that button’s adjacent live text from “Copy” to “Copied” for a short interval; changing tabs does not trigger a global message. No toast or overlay is used. Decoded SVG copy and download controls remain in a separate markup section so they cannot be confused with the two encoded formats.

### B4 Unicode-safe conversion

Encoding never calls `btoa(svg)`. The source string is converted to UTF-8 bytes with `TextEncoder`, processed in bounded chunks, and only then converted from a binary byte string to Base64. Decoding reverses the payload into a `Uint8Array` and uses a fatal UTF-8 `TextDecoder`, so malformed byte sequences fail clearly rather than silently replacing characters.

Round trips preserve the supplied SVG string rather than trimming it. Automated fixtures independently cover ASCII paths, accented Unicode text, emoji, Devanagari/Japanese/Arabic text, XML entities and symbols including copyright, trademark, currency, checkmark, infinity and arrow characters. Every fixture is checked through both raw Base64 and complete data-URI decoding for exact string equality, including surrounding whitespace.

### B5 Base64 to SVG

The decoder accepts either the raw Base64 payload or a complete `data:image/svg+xml;base64,…` value. It detects and removes the data-URI prefix before validating the remaining alphabet, decoding bytes and requiring a complete SVG document.

The output area presents an indented, readable SVG preview while retaining the exact decoded source for the **COPY SVG** and **DOWNLOAD .SVG** actions. This distinction avoids altering meaningful source whitespace merely to improve visual presentation. **CLEAR** resets both conversion directions, output, errors, copy feedback and the selected local file without reloading the page.

### B6 automatic direction detection

The converter exposes two direction tabs while retaining separate state for both inputs. Pasting a document that confidently begins with an SVG root selects **SVG → Base64** and encodes it. Pasting a complete `data:image/svg+xml;base64,` value selects **Base64 → SVG** and decodes it. The optional XML declaration before an SVG root is recognised.

Raw Base64 and ordinary text are deliberately treated as uncertain by the direction detector. They remain in the field and mode where the user pasted them, so detection never guesses based on a short Base64-looking string. Switching either manually or automatically does not clear the other input; deletion happens only through the explicit **CLEAR** action.

### B7 live preview

A dedicated preview region renders the current SVG in an image context with an accessible alternative and busy state. The preview is never an iframe, `srcDoc`, `dangerouslySetInnerHTML` or direct injection of submitted markup into the page.

Before rendering, a browser XML parser requires a valid SVG root. The preview copy removes scripts, embedded HTML/documents, external images, `<use>` references, style elements, event-handler attributes, external href values and URL-based inline styles. The original editor and downloadable source remain unchanged; sanitisation applies only to the visual preview.

Preview work is delayed by 180 ms and cancelled whenever another keystroke arrives. This keeps textarea input responsive instead of parsing and serialising a large document for every character. The shared 1 MB byte limit is checked before parsing, and invalid or incomplete markup produces a quiet preview placeholder rather than blocking the editor.

### B8 SVG preview security

All supplied SVG is treated as untrusted. Conversion is a text/byte operation and preserves the submitted source; previewing is a separate pipeline. Raw markup is never assigned through `dangerouslySetInnerHTML`, `srcDoc`, an iframe or direct DOM insertion.

The preview parser rejects document type/entity declarations and malformed XML. Its preview-only copy removes scripts, `foreignObject`, embedded document/object elements, images, `<use>`, styles and links. It also removes every event-handler attribute, external href, `javascript:` value and URL-based attribute. Only the resulting serialized SVG is encoded into an image data URI and rendered through an image element.

The interface labels this area **Preview-safe version**. When sanitization removes content it reports the exact number of removed elements or attributes and states that the change affects the preview only. **COPY SVG**, **DOWNLOAD .SVG**, raw Base64 and data-URI output continue to use the original conversion source, never the sanitized or formatted representation.
