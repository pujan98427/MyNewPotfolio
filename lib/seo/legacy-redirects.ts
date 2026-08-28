/**
 * Long-lived redirects for legacy URLs with a genuine current equivalent.
 * Do not add broad catch-alls: an unknown retired URL should remain a 404.
 */
export const LEGACY_REDIRECTS = [
  { source: "/home", destination: "/", permanent: true },
  { source: "/index.html", destination: "/", permanent: true },
  { source: "/index.php", destination: "/", permanent: true },
  { source: "/contact.html", destination: "/contact", permanent: true },
  { source: "/external", destination: "/", permanent: true },
  { source: "/external/index.html", destination: "/", permanent: true },
  { source: "/external/index.php", destination: "/", permanent: true },
  { source: "/external/contact.html", destination: "/contact", permanent: true },
  { source: "/old-portfolio", destination: "/", permanent: true },
  { source: "/old-portfolio/index.html", destination: "/", permanent: true },
  { source: "/old-portfolio/index.php", destination: "/", permanent: true },
  { source: "/old-portfolio/contact.html", destination: "/contact", permanent: true },
] as const;

