# DESIGN.md — Product Creator

Visual world: **digital darkroom**. The product is a photography studio tool, so
the interface treats the user as a maker in a controlled workspace, not a
customer in a SaaS landing page. The user's own product image is the artifact;
everything else is the studio that surrounds it.

## Surface modes

- `/` — **Operate** with a Persuade opening (hero proves the mechanism, form does the work).
- `/results/[id]` — **Operate** (review assets and ship them to social).
- `/api/*` — no UI.

## Color strategy

**Committed.** One saturated accent — **darkroom orange** (`#ff5b1f`) — carries
30–50% of the surface. The rest is monochrome paper-and-ink on near-black.

Why dark, not light: darkroom + studio = controlled artificial light; the user
is at a screen with their product in hand. Dark mode is the physical scene,
not a category default.

Tokens:
- `bg`: `#0a0a0a` — paper-black, slightly warmer than pure
- `surface`: `#121212` — print bed (slight lift above bg)
- `surface-2`: `#1a1a1a` — paper card
- `ink`: `#f5f1ea` — warm white (like photo paper, not blue-white)
- `ink-muted`: `rgba(245,241,234,0.62)` — captions / labels
- `ink-dim`: `rgba(245,241,234,0.32)` — disabled / tertiary
- `rule`: `rgba(245,241,234,0.10)` — hairlines, separators
- `accent`: `#ff5b1f` — darkroom safelight orange
- `accent-ink`: `#0a0a0a` — text on accent

Never use gray. Secondary text tints from `ink` toward warm (`rgba(245,241,234,0.62)`),
not toward neutral gray.

## Type

Two families, one decision per role.

- **Display / headings:** `Instrument Serif` (free, Google Fonts). Editorial,
  optical-size aware, italic axis for accents. Sets a studio / print tone without
  being bookish.
- **UI / body:** `Inter` (variable, self-hosted via next/font). Neutral workhorse
  for controls, captions, metadata.

Mono is **only** for technical labels (job IDs, file sizes, prompt fragments, API
status), never as costume. Mono face: `JetBrains Mono`.

Type scale (rem):
- `display-xl`: 4.5rem / 1.0 / -0.04em — hero wordmark
- `display-lg`: 3rem / 1.05 / -0.03em — section headers
- `h-md`: 1.5rem / 1.2 / -0.02em — card titles
- `body`: 1rem / 1.55 — running text
- `caption`: 0.8125rem / 1.4 / +0.02em — labels and metadata
- `micro`: 0.6875rem / 1.3 / +0.08em / uppercase — kickers

## Spacing & layout

- Page max-width: 72rem (≈1152px). Generous gutters on desktop (px-8).
- Mobile gutters: px-5.
- Sections separated by **hairlines** (1px `rule` color) plus generous vertical
  air, not by cards.
- A heading earns **more space above than below** (mt-24 before, mb-6 after).
- Form column = 28rem max; preview column = free up to page max.

## Depth

Three surfaces, no more. **Borders + hairline rules** carry the structure; soft
shadows (offset-y: 1px, blur 12px, opacity 0.08) only under interactive surfaces
(preview card hover, modal-equivalent result panel).

No glass. No gradient text. No neon glow.

## Components

### StudioFrame
Wraps any product image with: thin top + bottom hairlines, a `figcaption` mono
caption ("ORIGINAL · 1240×820 · 312 KB"), corner crop marks. The image is the
artifact; the frame is the studio.

### Button
Two variants:
- **Primary:** `bg: accent`, `text: accent-ink`, hover lifts 1px and shadow appears.
- **Ghost:** `border: rule`, `bg: transparent`, hover fills with `surface-2`.

Both: `rounded-none` (sharp corners, photographic, not toy-like), uppercase
caption-sized label with `tracking +0.04em`.

### Input / Textarea / FileDrop
Border-only on focus (`accent`), no glow. Textarea mono-labels the character
count. FileDrop is a tall dashed frame, not a clickable "browse" link, with
the dropped image rendered at full width inside the frame.

### CategoryChip
A horizontal row, not a grid. Each chip: emoji + label, `border: rule`, hover
fills `surface-2`. Selected: `border: accent`, accent-color emoji.

### StepRail (ProcessingStatus)
Vertical rail of 3 stations with status pills, mono labels, and a single
progress hairline between them. Not bullet circles.

### ResultPair (ResultDisplay)
Side-by-side studio frames for `original` and `marketing` images. Video is a
full-width studio frame with a single play overlay.

## Motion

One authored moment only: **studio lights up** — when a job enters `ready`,
the result panel draws in with a single 600ms ease-out fade + a 4px upward
slide. No per-section entrance animation, no scattered hover lifts.

Loading states use the same mono caption with an animated underscore cursor
("Generando video_"). No spinner.

## Forbidden

- Gradient text
- Glass / blur decoration
- Card-of-icon-plus-heading-plus-text as section structure
- Same-size uniform cards in a grid (the product is a sequence of artifacts, not a catalog)
- Section numbers (01 / 02 / 03)
- Modal for any task
- Emoji as decoration outside CategoryChip
- "Pro / Premium" badges, testimonials, pricing
- Border-left / border-right above 1px on anything
- Sparklines or rings standing in for actual progress text

## Coverage

The brief requires: upload, edit-preserve-product, video generate, social
publish. Every required action must be reachable in ≤2 clicks from the
uploaded state and never hidden behind an extra menu.
