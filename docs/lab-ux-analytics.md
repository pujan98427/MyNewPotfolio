# Lab UX analytics

Tracking is off by default. No GA4 tag or analytics-consent provider is currently
wired into the site. The advertising CMP must not be treated as analytics consent.

The provider integration can call `registerGa4UxAnalytics` from
`lib/analytics/product-events.ts` once it has configured its Google tag. Supply
the GA4 measurement ID, the loaded `gtag` function, and a live
`hasAnalyticsConsent` callback. Call the returned cleanup on teardown. The adapter
checks consent for every event, drops events rather than replaying them later,
and sends only allowlisted tool identifiers and crop ratios. Disable automatic
form/file-download measurement in the provider so it cannot collect filenames or
field contents independently. Do not configure user IDs or user-provided data.

Image and PDF tools emit `file_selected` after acceptance, `tool_processed` after
success, `result_downloaded` on download activation, and `tool_handoff_used` after
the handoff is saved. Download activation is not proof of a completed disk save.
Image batch processing emits a processing event per successful file.
Tool pages already emit `tool_opened`. Crop ratio choices emit
`crop_ratio_selected`; corner/edge resize activity emits `crop_resized` after a
400 ms quiet period (including keyboard resize). These are interaction bursts,
not individual pointer movements. No image contents, filenames, sizes or URLs are
included in these UX payloads. GA4 itself may use consented pseudonymous session
identifiers; these events do not promise absolute anonymity.

Run `node --experimental-strip-types tests/ux-analytics.test.ts` for local
privacy/consent checks. Live GA4 receipt still requires a configured provider.

Compare opened → selected → processed → download activations per tool to identify
drop-off. Handoffs are a separate continuation outcome. Do not mix batch file
counts with single-file session conversion rates.
