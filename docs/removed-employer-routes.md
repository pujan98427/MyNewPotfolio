# Removed employer and client work routes

These former internal case-study URLs have no equivalent first-party page and are intentionally absent from navigation, internal links, Open Graph routing, structured data and `sitemap.xml`:

- `/work/tripcart`
- `/work/coachpodium`
- `/work/travelbee`
- `/work/rishi`
- `/work/floral`
- `/work/magazine`
- `/work/wellness`
- `/work/seva`

No redirect has been configured. In the current application each path returns the normal `404` response. Redirecting these pages to the homepage or `/work` would imply an equivalent destination that does not exist.

## Deployment-history decision

The repository cannot establish whether these URLs were previously deployed, indexed or linked externally. Before production release, the owner should inspect hosting history, analytics, backlinks and Google Search Console:

- If a URL was never publicly available or indexed, retain the current `404`.
- If a removed URL was deliberately retired and should be stated as permanently gone, consider a `410` after checking hosting support and external links.
- Add a permanent redirect only when a genuinely equivalent, owner-controlled replacement exists. Do not redirect these paths merely to preserve an SEO signal.

## Asset audit

The eight files in `public/projects/` are retained because the concise homepage/work overview still renders each image. No duplicate detail-only project image remains in that directory.

OWNER ACTION REQUIRED: determine the public/indexing history of every URL above before choosing between the existing `404`, a deliberate `410`, or a relevant future redirect.
