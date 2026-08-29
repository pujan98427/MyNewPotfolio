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

## Rate-limit boundary

`lib/contact/rate-limit.ts` deliberately uses process memory only. It can reduce accidental bursts reaching one warm process, but it is not a production-grade distributed IP rate limiter. Serverless instances do not share this map, and restarts erase it.

Production should enable the hosting platform, reverse proxy, or WAF rate limit for `POST /api/contact`, alongside Turnstile. The exact rule belongs in the selected hosting infrastructure because this repository does not know which provider will run it.

If a durable application-level IP limiter becomes necessary, it requires shared infrastructure such as a managed rate-limit service or shared key-value store. Do not describe the current map as durable, and do not add a database solely for this contact form.

Suggested operational policy: apply a conservative burst limit to `POST /api/contact`, preserve normal keyboard and assistive-technology use, return HTTP 429 with `Retry-After`, and avoid logging full email addresses or message bodies.
