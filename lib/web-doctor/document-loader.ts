import { safeFetchHtml } from "./safe-fetch";
import type { AnalysisMode, DocumentLoader } from "./types/analysis";

/**
 * Loads the original HTML response without executing page JavaScript.
 * This is the only Web Doctor loading strategy enabled in version one.
 */
const htmlDocumentLoader: DocumentLoader = {
  mode: "html",
  load: safeFetchHtml,
};

/**
 * Central strategy boundary for document acquisition. A future rendered loader
 * can be added here behind server-side configuration and the same URL safety
 * policy; accepting a mode from an untrusted request is intentionally avoided.
 */
export function getDocumentLoader(mode: AnalysisMode = "html"): DocumentLoader {
  if (mode === "html") return htmlDocumentLoader;
  throw new Error("Rendered analysis is not available.");
}
