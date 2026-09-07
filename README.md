# Pujan Chapagain — Portfolio

An editorial portfolio rebuilt with Next.js App Router, TypeScript, and Tailwind CSS.

> PDF compression note: meaningful image-heavy compression needs a separately reviewed Ghostscript/WebAssembly integration. The current local tool performs structural compaction and does not pretend to downsample images. See [the WASM evaluation](docs/PDF_COMPRESSION_WASM_EVALUATION.md) for the licensing, isolation, cleanup, and testing gate.

## Local development

```bash
npm install
npm run dev
```

Quality checks: `npm run typecheck`, `npm run lint`, and `npm run build`.

## Routes

- `/#about`, `/#skills`, `/#experience`, and `/#education` — homepage profile sections
- `/#selected-work` — concise employment contributions with direct external links
- `/lab` — fourteen free tools grouped across website, image, document, developer/design and everyday tasks
- `/writing` and `/writing/[slug]` — Notes from the Lab and one implementation note for every Lab tool
- `/#contact` — homepage contact section with the shared floating message form

Structured content lives in `data/`; shared presentation lives in `components/`.

This repository contains only the production Next.js application and uses npm with `package-lock.json` as its package-manager lockfile. Historical URLs remain covered by permanent redirects even though the retired CRA and static/PHP source trees have been removed.

## Search Console deployment checklist

1. Set `NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION` to the real HTML-tag verification token supplied by Google. Do not include the surrounding meta tag.
2. Add and verify the preferred `https://poojanchapagain.com.np` property (or the corresponding Domain property) in Google Search Console.
3. Submit `https://poojanchapagain.com.np/sitemap.xml`.
4. Inspect the homepage, Web Doctor, Lab, Work, key case studies, and guides with URL Inspection.
5. Request indexing for the most important newly deployed pages and monitor indexing/canonical reports after migration.

The application consistently uses the non-`www` HTTPS hostname. Production DNS/CDN configuration must also redirect HTTP and `www` requests to that origin.

## Resend domain verification

The contact widget sends email through Resend. Complete these owner-controlled steps before enabling it in production:

1. Create or sign in to a Resend account.
2. Add the website domain in Resend.
3. Add the DNS records provided by Resend to the domain's DNS configuration.
4. Wait for Resend to verify the domain.
5. Create a sending address such as `contact@YOUR-DOMAIN` on that verified domain.
6. Create a Resend API key.
7. Add `RESEND_API_KEY` to the production environment variables.
8. Set `CONTACT_FROM_EMAIL` to the verified sending address.
9. Set `CONTACT_TO_EMAIL` to the Gmail address that should receive enquiries.
10. Set `CONTACT_DELIVERY_MODE=live` in production and redeploy the application so the production runtime receives the new variables.

Use the exact DNS records shown in the Resend dashboard. DNS values vary by domain and account, so none are provided or invented in this repository. Keep the API key and destination email server-side; never expose them through `NEXT_PUBLIC_` variables or commit them to source control.

Local development and automated tests should use `CONTACT_DELIVERY_MODE=disabled`, which is also the non-production default when the variable is absent. Production fails closed unless the mode is explicitly `live`. Tests that exercise delivery inject a mocked Resend email client; they never contact Resend or silently substitute a test recipient.

The project currently has no installed E2E framework. The automation-ready contact success and failure scenarios are documented in [`docs/contact-e2e-plan.md`](docs/contact-e2e-plan.md); Playwright or Cypress should be added only when the project adopts a shared browser-testing suite.

## Advertising remains disabled

The repository includes reusable, consent-gated AdSense provider and slot components, reserved below-result placements, and configurable `/ads.txt` support. No advertising script loads with the checked-in defaults.

Do not set `NEXT_PUBLIC_ADSENSE_ENABLED=true` until all of these owner-controlled steps are complete:

1. The site has been approved for AdSense.
2. A real `ca-pub-…` client ID and real slot IDs have been supplied by AdSense.
3. A Google-certified CMP has been integrated and tested for visitors in the UK, EEA and Switzerland. It must expose separate advertising and personalisation decisions through the adapter in `lib/advertising/cmp.ts` and send the corresponding Google consent signals.
4. The Privacy and Cookies pages have been reviewed and updated for the actual advertising setup.
5. The matching server-side `GOOGLE_ADSENSE_PUBLISHER_ID` has been added if an `ads.txt` seller record is required.

After those steps, set `NEXT_PUBLIC_ADSENSE_CLIENT`, only the approved placement variables you intend to use, and finally `NEXT_PUBLIC_ADSENSE_ENABLED=true`, then rebuild and redeploy. A client ID or slot alone cannot enable the provider. Never invent these values.

### Owner action required before advertising

- Choose and configure a Google-certified CMP; do not replace the adapter with a homemade consent banner.
- Configure Accept, Reject and Manage options where required, without preselecting personalisation.
- Map the CMP's actual advertising and personalisation decisions to the typed adapter. A rejected personalisation decision must remain rejected and must be communicated to Google by the CMP.
- Test consent withdrawal and regional behaviour using the CMP and AdSense diagnostic tools.
- Have the final Privacy and Cookies disclosures reviewed for the deployed vendors, purposes and retention.
- Keep `NEXT_PUBLIC_ADSENSE_ENABLED=false` until all setup, review and testing is complete.

### Homepage advertising policy

The portfolio homepage is intentionally ad-free. The hero, Selected Work, employer links and Contact section must never contain advertising inventory. If a future commercial decision requires a homepage placement, add no more than one restrained slot after substantial portfolio and Lab content, and review recruiter/client usability before release. Do not reuse the Lab index slot inside homepage sections.

Lab documentation may use one restrained slot after the third complete section when an article has at least five sections. The slot stays between section units, never inside code, instructions, related links or the tool action. Articles must retain substantially more original content than advertising.
