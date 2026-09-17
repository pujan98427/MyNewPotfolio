"use client";

import Link from "next/link";
import Script from "next/script";
import { useEffect, useState, useSyncExternalStore } from "react";

export const CLARITY_CONSENT_STORAGE_KEY = "pujan:analytics-consent:v1";
export const CLARITY_CONSENT_OPEN_EVENT = "pujan:open-analytics-consent";
const CLARITY_CONSENT_CHANGE_EVENT = "pujan:analytics-consent-changed";

type ConsentChoice = "accepted" | "rejected";
type StoredConsent = ConsentChoice | null;
type ClarityFunction = ((...args: unknown[]) => void) & { q?: unknown[][] };

declare global {
  interface Window {
    clarity?: ClarityFunction;
  }
}

function readStoredConsent(): StoredConsent {
  try {
    const value = window.localStorage.getItem(CLARITY_CONSENT_STORAGE_KEY);
    return value === "accepted" || value === "rejected" ? value : null;
  } catch {
    return null;
  }
}

function storeConsent(choice: ConsentChoice) {
  try {
    window.localStorage.setItem(CLARITY_CONSENT_STORAGE_KEY, choice);
  } catch {
    // Storage can be unavailable in strict privacy modes. The current page
    // still honours the visitor's choice without breaking the site.
  }
  window.dispatchEvent(new Event(CLARITY_CONSENT_CHANGE_EVENT));
}

function subscribeToStoredConsent(onChange: () => void) {
  window.addEventListener("storage", onChange);
  window.addEventListener(CLARITY_CONSENT_CHANGE_EVENT, onChange);
  return () => {
    window.removeEventListener("storage", onChange);
    window.removeEventListener(CLARITY_CONSENT_CHANGE_EVENT, onChange);
  };
}

function serverConsentSnapshot(): undefined {
  return undefined;
}

function clarityQueue() {
  if (window.clarity) return window.clarity;
  const queued: ClarityFunction = (...args: unknown[]) => {
    (queued.q ??= []).push(args);
  };
  window.clarity = queued;
  return queued;
}

function signalClarityConsent(choice: ConsentChoice) {
  clarityQueue()("consentv2", {
    ad_Storage: "denied",
    analytics_Storage: choice === "accepted" ? "granted" : "denied",
  });
}

export function ClarityConsent({ projectId }: { projectId: string }) {
  const storedChoice = useSyncExternalStore(subscribeToStoredConsent, readStoredConsent, serverConsentSnapshot);
  const [volatileChoice, setVolatileChoice] = useState<StoredConsent | undefined>(undefined);
  const [preferencesOpen, setPreferencesOpen] = useState(false);
  const choice = storedChoice ?? volatileChoice ?? null;
  const open = storedChoice !== undefined && (choice === null || preferencesOpen);

  useEffect(() => {
    const showPreferences = () => setPreferencesOpen(true);
    window.addEventListener(CLARITY_CONSENT_OPEN_EVENT, showPreferences);
    return () => window.removeEventListener(CLARITY_CONSENT_OPEN_EVENT, showPreferences);
  }, []);

  useEffect(() => {
    if (choice === "accepted") signalClarityConsent(choice);
  }, [choice]);

  const choose = (nextChoice: ConsentChoice) => {
    const wasAccepted = choice === "accepted";
    if (nextChoice === "rejected" && wasAccepted) {
      signalClarityConsent("rejected");
    }
    storeConsent(nextChoice);
    setVolatileChoice(nextChoice);
    setPreferencesOpen(false);

    // Stop an already-running recording immediately after consent is revoked.
    if (nextChoice === "rejected" && wasAccepted) window.location.reload();
  };

  return <>
    {choice === "accepted" && <Script
      id="microsoft-clarity"
      src={`https://www.clarity.ms/tag/${projectId}`}
      strategy="afterInteractive"
      onError={() => console.warn("Microsoft Clarity could not load.")}
    />}

    {open && <aside
      aria-labelledby="analytics-consent-title"
      className="fixed inset-x-4 bottom-4 z-[110] mx-auto grid max-w-[46rem] gap-5 border border-text bg-canvas p-5 shadow-[0_1.5rem_4rem_color-mix(in_srgb,var(--color-text)_20%,transparent)] sm:p-6"
      role="region"
    >
      <div className="grid gap-2">
        <p className="m-0 text-label font-bold tracking-[.13em] uppercase text-brand-strong">Your privacy</p>
        <h2 id="analytics-consent-title" className="m-0 font-display text-[clamp(1.7rem,4vw,2.5rem)] font-normal leading-none tracking-[-.035em]">Optional analytics</h2>
        <p className="m-0 max-w-[60ch] text-sm leading-6 text-muted">
          Microsoft Clarity helps me understand which pages and tools work well by recording interactions such as clicks and scrolling. Sensitive content is masked. Clarity does not load unless you accept. <Link className="underline underline-offset-4" href="/privacy">Privacy details</Link>
        </p>
      </div>
      <div className="flex flex-wrap gap-3">
        <button
          className="min-h-11 border border-text bg-text px-5 py-3 text-sm font-bold text-canvas hover:bg-brand-strong hover:text-canvas"
          type="button"
          onClick={() => choose("accepted")}
        >
          Accept analytics
        </button>
        <button
          className="min-h-11 border border-text bg-transparent px-5 py-3 text-sm font-bold text-text hover:bg-surface hover:text-text"
          type="button"
          onClick={() => choose("rejected")}
        >
          Reject analytics
        </button>
        {choice !== null && choice !== undefined && <button
          className="min-h-11 px-3 py-3 text-sm font-bold text-muted underline underline-offset-4 hover:text-brand-strong"
          type="button"
          onClick={() => setPreferencesOpen(false)}
        >
          Keep current choice
        </button>}
      </div>
    </aside>}
  </>;
}
