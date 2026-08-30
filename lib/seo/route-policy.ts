/**
 * Search-indexing policy for routes that are not generated from content data.
 *
 * Dynamic project, guide, writing and Lab-tool URLs are added by app/sitemap.ts
 * from their structured data collections. Keeping exclusions here makes the
 * distinction between public content and application state reviewable.
 * Employer and client names belong only in factual Work/Experience history.
 * They must never generate search landing pages, case-study routes or sitemap
 * entries unless a future project is explicitly reclassified as personally owned.
 */
export const INDEXABLE_STATIC_ROUTES = [
  "/",
  "/lab",
  "/writing",
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
