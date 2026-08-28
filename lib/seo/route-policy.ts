/**
 * Search-indexing policy for routes that are not generated from content data.
 *
 * Dynamic project, guide, writing and Lab-tool URLs are added by app/sitemap.ts
 * from their structured data collections. Keeping exclusions here makes the
 * distinction between public content and application state reviewable.
 */
export const INDEXABLE_STATIC_ROUTES = [
  "/",
  "/about",
  "/work",
  "/lab",
  "/writing",
  "/contact",
  "/privacy",
  "/cookies",
  "/terms",
  "/lab/web-doctor/changelog",
] as const;

export const NON_INDEXABLE_ROUTE_POLICIES = [
  { pattern: "/api/**", reason: "Machine endpoint, not public editorial content" },
  { pattern: "/lab/seo-checker", reason: "Permanent duplicate redirect to /lab/web-doctor" },
  { pattern: "not-found and error responses", reason: "Unavailable content" },
  { pattern: "Web Doctor report state", reason: "Temporary client state; no standalone result URL" },
  { pattern: "command-navigation search state", reason: "Temporary client state; no search-results route" },
] as const;
