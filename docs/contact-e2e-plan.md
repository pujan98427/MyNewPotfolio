# Contact widget end-to-end plan

The repository does not currently install or configure Playwright, Cypress, or another browser E2E framework. The `@playwright/test` name in `package-lock.json` is an optional Next.js peer dependency and is not installed. A browser framework and its binaries have therefore not been added solely for this widget.

When the project adopts a shared E2E runner, add the following two tests. Intercept `POST /api/contact` so neither test can contact Resend.

## Successful submission

1. Open `/`.
2. Activate the `Message Pujan` launcher.
3. Confirm the dialog named `Send a message.` is open and the email field has focus.
4. Enter `visitor@example.com` and a short message.
5. Intercept `POST /api/contact`, assert that the request contains only the expected contact fields, and return `{ "ok": true }`.
6. Submit and confirm `Message sent.` is announced and the panel remains open.
7. Close the dialog, then reopen it.
8. Confirm the email and message draft fields are empty and `sessionStorage` no longer contains `pujan-contact-draft`.

## Failed submission

1. Open the contact dialog and enter a valid email and message.
2. Intercept `POST /api/contact` and return a safe `502` response with `SEND_FAILED`.
3. Submit and confirm the safe error text is announced.
4. Confirm both typed fields retain their original values and the draft remains in `sessionStorage`.
5. Confirm no live Resend request occurred.

## Current lightweight coverage

Until a shared browser runner exists, `npm test` covers the underlying guarantees without network access: client double-submit prevention, success-only form reset, success-only draft removal, failed-input preservation, accessible status messages, dialog focus return, API success/failure behavior, and a mocked Resend envelope. This is not represented as an E2E test; final browser focus, storage, and rendering behavior still requires the future scenarios above.
