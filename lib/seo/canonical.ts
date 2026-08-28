import { SITE_URL } from "@/lib/site-config";

export type CanonicalPath = `/${string}`;

export function assertCanonicalPath(path: string): asserts path is CanonicalPath {
  if(!path.startsWith("/")||path.startsWith("//")||path.includes("?")||path.includes("#")||(path!=="/"&&path.endsWith("/"))){
    throw new Error(`Canonical path must be a clean, leading-slash path without a trailing slash: ${path}`);
  }
}

export function absoluteCanonicalUrl(path: string): string {
  assertCanonicalPath(path);
  return path==="/"?`${SITE_URL}/`:`${SITE_URL}${path}`;
}

