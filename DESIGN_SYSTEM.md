# Visual system

The visual system is defined in Tailwind v4’s CSS-first `@theme` block at the top of `app/globals.css`. Components should consume these tokens or the small semantic utilities defined beside them; avoid adding one-off colours, breakpoints, or easing curves.

## Visual direction

The site uses a warm editorial canvas, near-black type, Pujan's coral-red brand colour, and quiet neutral surfaces. Playfair Display carries expressive headings; Manrope carries interface labels and body copy. The hierarchy remains clear with animation disabled: scale, alignment, rules, image proportion, and whitespace do the visual work.

## Type

| Token | Intended use |
| --- | --- |
| `font-display` | Hero statements, page titles, project titles |
| `font-body` | Navigation, prose, controls, metadata |
| `text-micro` | Index numbers and secondary metadata |
| `text-label` | Uppercase eyebrows and categories |
| `text-body` | Default prose and controls |
| `text-lead` | Introductions and standfirsts |
| `text-title` | Section and article headings |
| `text-display` | Route titles |
| `text-display-xl` | Homepage hero |

Display sizes use `clamp()` so hierarchy scales continuously without fragile breakpoint jumps. Body copy stays within the `--measure-copy` line length.

## Spacing and containers

- `spacing-gutter`: fluid page edge from 16px to 36px.
- `spacing-section`: fluid vertical section rhythm from 80px to 160px.
- `spacing-page-top`: route-introduction breathing room.
- `spacing-block`: separation between related content groups.
- `container-editorial`: centred maximum-width layout with standard gutters.
- `grid-editorial`: asymmetric three-column composition for label, primary content, and supporting copy.

Smaller gaps should use Tailwind’s default spacing scale. New arbitrary spacing values require a layout-specific reason.

## Colour

| Token | Value | Role |
| --- | --- | --- |
| `canvas` | `#f0eee8` | Primary warm background |
| `ink` | `#151515` | Main type and inverted section background |
| `brand` | `#e45447` | Permanent brand colour on dark surfaces and larger accents |
| `accent` | `var(--color-brand)` | Semantic alias for the base brand colour |
| `brand-soft` | 14% brand mix | Quiet tinted surfaces and hover backgrounds |
| `brand-medium` | 32% brand mix | Focus halo and stronger translucent emphasis |
| `brand-strong` | `#b43d33` | Contrast-safe small text and links on the warm canvas |
| `muted` | `#5b5a56` | Secondary text |
| `subtle` | `#bbb9b2` | Text on dark sections |
| `surface` | `#d9d6cf` | Image loading and quiet surfaces |
| `positive` | `#4b8700` | Semantic success and availability indication |

Rules use a 22% mix of ink rather than another colour. The base brand colour reaches 4.92:1 against ink, while the strong variant reaches 4.95:1 against the canvas. Semantic success and error colours remain independent where their meaning matters.

## Borders and grid

Most divisions are one-pixel hairlines. Full-contrast rules establish major page boundaries; translucent rules separate related items. Default editorial grids are asymmetric rather than equal-card layouts. At the `md` boundary they become a deliberate single-column edit, not a scaled-down desktop composition.

## Motion

| Token | Value | Role |
| --- | --- | --- |
| `duration-fast` | 180ms | Immediate control feedback |
| `duration-base` | 280ms | Links and small transitions |
| `duration-slow` | 700ms | Large image movement |
| `ease-out-editorial` | `.2, .7, .2, 1` | Calm visual transitions |
| `ease-snap` | `.16, 1, .3, 1` | Direct interface feedback |

Only opacity and transforms should animate in content-heavy areas. The global `prefers-reduced-motion` rule removes non-essential transitions and smooth scrolling.

The homepage hero is the one expressive interaction: pointer position shifts its typographic and abstract layers by 3–8px, while scroll progress moves the headline and featured-work canvas using transforms. Updates are scheduled with `requestAnimationFrame` and written directly to CSS variables, avoiding React rerenders. Coarse pointers receive a static mobile composition.

## Responsive rules

- `sm` 480px: narrow-phone enhancement point.
- `md` 760px: primary composition change; editorial grids collapse and navigation condenses.
- `lg` 1024px: wide reading and multi-column layouts.
- `xl` 1280px: large editorial canvas.

Mobile decides sequence and emphasis independently. Touch targets remain generous, labels remain legible, and no information depends on hover.
