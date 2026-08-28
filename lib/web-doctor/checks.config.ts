import type { DiagnosticStatus } from "./types/analysis";

export const SCORE_STATUS_MULTIPLIERS: Record<DiagnosticStatus, number> = {
  pass: 1,
  warning: 0.5,
  error: 0,
};

export const SCORE_CATEGORIES = [
  {
    id: "discoverability",
    label: "Discoverability",
    maximum: 20,
    checks: { indexing: 8, canonical: 5, "robots-file": 3, "sitemap-file": 4 },
  },
  {
    id: "metadata",
    label: "Metadata",
    maximum: 20,
    checks: { title: 10, description: 10 },
  },
  {
    id: "page-structure",
    label: "Page structure",
    maximum: 20,
    checks: { h1: 12, schema: 5, links: 3 },
  },
  {
    id: "social-sharing",
    label: "Social sharing",
    maximum: 15,
    checks: { social: 10, twitter: 5 },
  },
  {
    id: "accessibility-basics",
    label: "Accessibility basics",
    maximum: 15,
    checks: { images: 7, language: 5, viewport: 3 },
  },
  {
    id: "technical-basics",
    label: "Technical basics",
    maximum: 10,
    checks: { response: 5, charset: 3, favicon: 2 },
  },
] as const;

export const WEB_DOCTOR_SCORE_MAXIMUM = SCORE_CATEGORIES.reduce(
  (total, category) => total + category.maximum,
  0,
);
