"use client";

import { CLARITY_CONSENT_OPEN_EVENT } from "@/components/analytics/clarity-consent";

export function ClarityPreferencesButton() {
  return <button
    className="mt-5 min-h-11 border border-text bg-transparent px-5 py-3 font-body text-sm font-bold text-text hover:bg-text hover:text-canvas"
    type="button"
    onClick={() => window.dispatchEvent(new Event(CLARITY_CONSENT_OPEN_EVENT))}
  >
    Manage analytics choice
  </button>;
}
