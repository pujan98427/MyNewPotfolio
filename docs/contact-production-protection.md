# Contact form production protection

The contact endpoint uses layered abuse controls:

- Cloudflare Turnstile with mandatory server-side token verification when enabled
- strict server-side field validation and an allowlisted topic
- a 12 KB request-body limit and bounded individual fields
- an assistive-safe honeypot and conservative completion-time signal
- a stable request identifier passed to Resend as an idempotency key
- browser Origin, Host and Fetch Metadata consistency checks as additional signals
- a small per-process request counter as best-effort local protection

The browser payload cannot select the recipient, sender, subject, CC, BCC, headers or template. Unknown fields are rejected. Delivery addressing and the subject are constructed exclusively from server configuration and the fixed topic allowlist. Origin-related headers can be absent or forged outside a browser, so these checks supplement rather than replace validation, Turnstile and the other controls.

Every contact API response is private and non-cacheable. Public responses contain only the application's fixed success or safe error messages; Resend and Turnstile response bodies, credentials, stack traces and internal error messages are never returned to the visitor.

`CONTACT_TO_EMAIL` is read only inside the server-only Resend delivery module. It is not included in the browser payload, widget confirmation, or API response. A separately published contact address elsewhere on the portfolio is independent of this private delivery configuration.

## Development and test delivery

Use `CONTACT_DELIVERY_MODE=disabled` in development and automated-test environments. It is the default outside production when the variable is absent. Production requires the explicit value `live`; a missing or unknown mode fails closed instead of guessing.

The delivery function accepts a narrow Resend email-client dependency for tests. The delivery test injects a mock client and verifies the message envelope without constructing a live SDK client or making a network call. No code silently replaces `CONTACT_TO_EMAIL` with a test recipient.

## Delivery direction

Version one sends exactly one email: the visitor's enquiry to `CONTACT_TO_EMAIL`. The validated visitor address is used only as `replyTo`, so replying from the destination inbox addresses the visitor. No automatic receipt, confirmation, welcome, or follow-up email is sent to the visitor. The in-widget success state is the confirmation.

If an automatic confirmation is ever added, it must be an explicit separately reviewed feature with abuse, quota, consent, content, and deliverability controls. It must not be enabled implicitly by changing the destination address or reusing the current delivery call.

### Future extension boundary

Keep the existing `sendContactEmail` function responsible for the owner-facing enquiry. A future confirmation should use a separate typed message builder and a clearly named, explicitly configured delivery function. That separation makes its recipient, template, quota impact, tests, and failure behavior reviewable without changing the current `replyTo` contract.

The initial contact product intentionally has no conversation database, real-time transport, polling, ticket identifiers, delivery-status UI, CRM integration, or attachment handling. Adding a confirmation email would not justify adding any of those systems; each would require a separate product and privacy decision.

## Attachments

Version one accepts JSON text fields only and does not accept file uploads, multipart bodies, attachment URLs as privileged fields, or email attachments. This keeps request sizes bounded and avoids malware scanning, temporary storage, email-size, and upload-abuse infrastructure. Visitors who need to share supporting material can include an ordinary public link within the validated message text.

Links inside a message remain untrusted visitor text. The contact system does not request them, resolve DNS for them, follow redirects, inspect their content, generate previews, or turn them into application-generated anchor tags. A recipient's email client may independently recognise and link plain URL text according to that client's own behavior; the portfolio does not fetch or endorse the destination.

## Rate-limit boundary

`lib/contact/rate-limit.ts` deliberately uses process memory only. It can reduce accidental bursts reaching one warm process, but it is not a production-grade distributed IP rate limiter. Serverless instances do not share this map, and restarts erase it.

Production should enable the hosting platform, reverse proxy, or WAF rate limit for `POST /api/contact`, alongside Turnstile. The exact rule belongs in the selected hosting infrastructure because this repository does not know which provider will run it.

If a durable application-level IP limiter becomes necessary, it requires shared infrastructure such as a managed rate-limit service or shared key-value store. Do not describe the current map as durable, and do not add a database solely for this contact form.

Suggested operational policy: apply a conservative burst limit to `POST /api/contact`, preserve normal keyboard and assistive-technology use, return HTTP 429 with `Retry-After`, and avoid logging full email addresses or message bodies.

## Performance boundary

The closed contact state renders only the fixed launcher. The dialog markup is mounted after the first deliberate open, and the Turnstile client component is a dynamic import rendered only while the panel is open. Consequently, Cloudflare's challenge script is not requested by the closed launcher.

The browser calls `POST /api/contact` only from the form submit handler. Resend is imported by the server-only delivery module and invoked by the route handler after validation and abuse checks; it is never called during page rendering. The fixed, contained overlay stays outside document flow so opening it does not move page content.

These source-level boundaries protect LCP, INP and CLS, but they are not field measurements. Verify the deployed site with mobile PageSpeed Insights and Core Web Vitals field data after enabling production analytics and Turnstile. Use `npm run audit:performance:production` for the repository's delivery-budget check; do not represent that local check as real-user Core Web Vitals data.
