<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

## Styling and visual-parity migration

Tailwind CSS v4 is the primary visual styling system. New components must use
Tailwind utilities directly in JSX and existing `@theme` tokens.
Do not add new CSS Modules or component-level visual selectors to `globals.css`.
Creating a new `.module.css` file requires explicit justification and approval;
it must not be a shortcut around migration. Do not recreate component CSS with
`@apply`. Use exact arbitrary utilities when no existing token matches.

Existing CSS is migration debt, not a pattern for new components. Migrate in
small groups in the agreed phase order; capture baseline screenshots first.
Preserve layout, typography, breakpoints, state styles, motion, accessibility,
SEO and behaviour. Keep runtime geometry in inline styles. Keep semantic hooks
used by scripts, observers, ads and tests. Do not rewrite processing or backend
logic. Isolate and document previously approved bug fixes.

Remove old selectors/imports only after all consumers and meaningful tests are
migrated and visual parity is verified. Run `npm run check:styles` and
`npm run audit:css`. Remove migrated modules from the legacy allowlist; do not
expand it without explicit approval. Keep the Tailwind import, theme and only
justified global base/print behaviour or complex keyframes in `globals.css`.

Run typecheck, lint and tests after each major phase. Final acceptance also
requires a clean install, production build, links/performance audits, applicable
integration tests, desktop/mobile screenshot comparisons and manual interaction
and accessibility checks. Builds alone do not establish visual parity.
