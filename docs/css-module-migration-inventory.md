# CSS Module migration inventory

Repository scan: 2026-09-13. Excludes installed dependencies, build output and Git internals.

| CSS Module | Component consumers | Test consumers |
| --- | --- | --- |
| `components/lab/simple-tools.module.css` | `image-tool.tsx`, `pdf-tool.tsx`, `qr-code-tool.tsx`, `random-picker-tool.tsx` | `tests/lab-tools.test.mjs` |
| `components/lab/file-drop-zone.module.css` | `components/lab/file-drop-zone.tsx` | No direct references found |
| `components/contact/contact-chat.module.css` | `contact-chat.tsx`, `contact-chat-boundary.tsx` | `tests/web-doctor.unit.mjs` |
| `components/contact/contact-panel.module.css` | `contact-panel.tsx`, `contact-form.tsx` | `tests/web-doctor.unit.mjs` |

Four source modules found. None migrated or deleted yet.

Pre-migration `app/globals.css` measurement (2026-09-13): 166,432 bytes
(166.432 decimal KB), 1,096 newline-split entries (including a trailing empty
entry if present). Use the same counting convention for the final comparison.
No CSS reduction is claimed yet.

## Repeatable audit

Run `npm run audit:css` for the JSON inventory of CSS files, style imports,
module member accesses, global class candidates, literal JSX classes and source
reference locations. Missing local CSS imports cause a nonzero exit code.

Run `npm run audit:css -- --baseline=docs/css-migration-baseline.json` to flag
removed global class candidates still present in literal JSX. The checked-in
selector snapshot is an audit aid, not the required screenshot baseline.
Investigate all flags: behaviour-only hooks can remain, but their visual styling
must have a verified replacement. Computed class names, unused module exports,
CSS escapes and dynamic selectors still require manual reference checks.

## Migration gates

1. Capture the current visual baseline before changing styles.
2. Map each consumer's computed styles, responsive boundaries, pseudo-elements,
   interaction states, motion and print behaviour.
3. Convert each consumer to direct JSX Tailwind utilities using existing theme
   tokens and exact arbitrary values where necessary. Do not replace selectors
   with `@apply` wrappers.
4. Compare against the baseline at all six requested viewport sizes and relevant
   interaction states. Include uploaded images/results, drop-zone drag/focus,
   and contact open/closed, validation and submission states.
5. Update tests that read module files to retain their behaviour/accessibility
   coverage against the migrated implementation. Move meaningful pseudo-element
   copy into JSX where required; do not silently discard it.
6. Search the entire source/test tree again for imports, module paths and legacy
   selector references. Delete a module only after every consumer is migrated,
   the references are removed and visual parity is verified.

The shared Lab module must remain until all four utility consumers pass.
Contact panel styles must remain until both the panel and form pass; contact
chat styles must remain until both the chat and its loading boundary pass.

## Current blocker

Baseline screenshots have not been captured. The in-app browser connection has
failed with `missing sandboxPolicy`. No visual parity is claimed. Existing CSS
must remain until this verification gate can be satisfied.
