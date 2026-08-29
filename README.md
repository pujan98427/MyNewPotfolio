# Pujan Chapagain — Portfolio

An editorial portfolio rebuilt with Next.js App Router, TypeScript, and Tailwind CSS.

## Local development

```bash
npm install
npm run dev
```

Quality checks: `npm run typecheck`, `npm run lint`, and `npm run build`.

## Routes

- `/about` — biography, experience, education, and skills
- `/work` and `/work/[slug]` — project index and individual case studies
- `/lab` — SEO checker, metadata generator, contrast checker, and CSS clamp generator
- `/writing` and `/writing/[slug]` — article index and individual notes
- `/contact` — direct contact and social links

Structured content lives in `data/`; shared presentation lives in `components/`.

The previous CRA source remains in `src/` and the older static portfolio remains in `old-portfolio/` until the migration is accepted.

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
