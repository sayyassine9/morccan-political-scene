---
name: Ntikhabat
description: A comparison instrument in the grammar of a Moroccan match-day page — ruled rows, form guides, heavy names, and the evidence beside every figure.
colors:
  newsprint: "#f2efe6"
  page-stock: "#fbf9f3"
  trough: "#e7e3d6"
  ink: "#15181c"
  ink-secondary: "#4a4f56"
  muted: "#61646a"
  rule: "#d8d3c4"
  rule-strong: "#b9b3a1"
  signal-amber: "#e8a13a"
  slate: "#33607e"
  slate-soft: "#eaeff3"
  slot-1: "#2a6fb0"
  slot-2: "#c5541f"
  slot-3: "#17876a"
  slot-4: "#b07d00"
  slot-5: "#a14f78"
  slot-6: "#4b6b23"
  slot-7: "#4a3aa7"
  slot-8: "#a83a38"
  slot-none: "#8b8677"
  evidence-corroborated: "#1b7247"
  evidence-single: "#7a6111"
  evidence-disputed: "#a14b1c"
  evidence-absent: "#61646a"
  on-slot: "#ffffff"
typography:
  display:
    fontFamily: "Tajawal, system-ui, -apple-system, Segoe UI, Roboto, sans-serif"
    fontSize: "clamp(28px, 6vw, 40px)"
    fontWeight: 800
    lineHeight: 1.1
    letterSpacing: "-0.02em"
  headline:
    fontFamily: "Tajawal, system-ui, sans-serif"
    fontSize: "clamp(20px, 3.4vw, 25px)"
    fontWeight: 800
    lineHeight: 1.2
    letterSpacing: "-0.02em"
  party-name:
    fontFamily: "Tajawal, system-ui, sans-serif"
    fontSize: "clamp(19px, 3.6vw, 27px)"
    fontWeight: 800
    lineHeight: 1.1
    letterSpacing: "-0.03em"
  title:
    fontFamily: "Tajawal, system-ui, sans-serif"
    fontSize: "17px"
    fontWeight: 700
  figure:
    fontFamily: "Tajawal, system-ui, sans-serif"
    fontSize: "19px"
    fontWeight: 800
    letterSpacing: "-0.02em"
    fontFeature: "tabular-nums"
  lede:
    fontFamily: "Tajawal, system-ui, sans-serif"
    fontSize: "17px"
    fontWeight: 400
    lineHeight: 1.55
  body:
    fontFamily: "Tajawal, system-ui, sans-serif"
    fontSize: "16px"
    fontWeight: 400
    lineHeight: 1.55
  small:
    fontFamily: "Tajawal, system-ui, sans-serif"
    fontSize: "14px"
    fontWeight: 400
  micro:
    fontFamily: "Tajawal, system-ui, sans-serif"
    fontSize: "12.5px"
    fontWeight: 400
  label:
    fontFamily: "Tajawal, system-ui, sans-serif"
    fontSize: "12.5px"
    fontWeight: 800
    letterSpacing: "0.06em"
  tag:
    fontFamily: "Tajawal, system-ui, sans-serif"
    fontSize: "12px"
    fontWeight: 700
  nav:
    fontFamily: "Tajawal, system-ui, sans-serif"
    fontSize: "15px"
    fontWeight: 700
  fine:
    fontFamily: "Tajawal, system-ui, sans-serif"
    fontSize: "11px"
    fontWeight: 400
  fine-caps:
    fontFamily: "Tajawal, system-ui, sans-serif"
    fontSize: "10.5px"
    fontWeight: 700
    letterSpacing: "0.06em"
rounded:
  bar: "3px"
  tag: "4px"
  mark: "7px"
  tile: "8px"
  box: "10px"
  card: "14px"
  pill: "999px"
spacing:
  hair: "2px"
  xs: "4px"
  sm: "6px"
  md: "8px"
  lg: "10px"
  xl: "12px"
  gap: "14px"
  gutter: "16px"
  section: "22px"
  major: "38px"
components:
  card:
    backgroundColor: "{colors.page-stock}"
    textColor: "{colors.ink}"
    rounded: "{rounded.card}"
    padding: "16px"
  comparison-cell:
    backgroundColor: "{colors.page-stock}"
    textColor: "{colors.ink}"
    typography: "{typography.figure}"
    padding: "12px 14px"
  comparison-label:
    backgroundColor: "{colors.trough}"
    textColor: "{colors.ink}"
    typography: "{typography.small}"
    padding: "12px 14px"
  group-header:
    backgroundColor: "{colors.ink}"
    textColor: "{colors.page-stock}"
    typography: "{typography.label}"
    padding: "12px 14px"
  party-slot:
    backgroundColor: "{colors.newsprint}"
    textColor: "{colors.ink}"
    rounded: "{rounded.box}"
    padding: "11px 12px"
    height: "68px"
  button:
    backgroundColor: "{colors.page-stock}"
    textColor: "{colors.ink-secondary}"
    typography: "{typography.small}"
    rounded: "{rounded.pill}"
    padding: "7px 13px"
  button-active:
    backgroundColor: "{colors.signal-amber}"
    textColor: "{colors.ink}"
    rounded: "{rounded.pill}"
    padding: "7px 13px"
  nav-link:
    textColor: "{colors.ink-secondary}"
    rounded: "{rounded.pill}"
    padding: "7px 11px"
  nav-link-active:
    backgroundColor: "{colors.ink}"
    textColor: "{colors.page-stock}"
    rounded: "{rounded.pill}"
    padding: "7px 11px"
  field:
    backgroundColor: "{colors.page-stock}"
    textColor: "{colors.ink}"
    rounded: "{rounded.box}"
    padding: "10px 12px"
  chip:
    backgroundColor: "{colors.trough}"
    textColor: "{colors.ink-secondary}"
    typography: "{typography.micro}"
    rounded: "{rounded.pill}"
    padding: "3px 10px"
  counter-block:
    backgroundColor: "{colors.trough}"
    textColor: "{colors.ink-secondary}"
    rounded: "{rounded.box}"
    padding: "8px 10px"
  form-mark:
    backgroundColor: "{colors.trough}"
    textColor: "{colors.ink-secondary}"
    rounded: "{rounded.mark}"
    width: "26px"
    height: "26px"
---

# Design System: Ntikhabat

## Overview

**Creative North Star: "The Match-Day Table"**

Ntikhabat is a comparison instrument. Its grammar is the one every Moroccan already
reads fluently every week — the match-day page, with its ruled rows, its form guide,
its heavy names and its tabular figures. A reader who has never seen this site before
has read this layout a thousand times, and that fluency is the whole point: a voter
with days to decide should not have to learn an interface first.

It borrows that page's **comparison** language and refuses its **ranking** language.
There is no standings position, no points column, no merit order, and no "top party".
Parties are ordered by the reader's own choice or alphabetically, never by performance.
Winning an election is a fact and appears as one; being *better* is never encoded
anywhere in this system. On a site bound to strict editorial neutrality, that refusal
is not a detail — it is the reason the form was allowed in at all.

The ground is warm newsprint (`#f2efe6`) under ink (`#15181c`), with one interface
colour — a signal amber (`#e8a13a`) reserved exclusively for the reader's own choices —
and a slate (`#33607e`) carrying structure and links. Light is not a preference here but
the use scene: the reader is on a cheap phone, outdoors, in Moroccan September sunlight.
Dark exists for night reading and inverts the same token set.

Type is **Tajawal**, carrying Arabic and Latin in one family. That is not a stylistic
choice but a structural one: a trilingual interface where Darija sits in a different
typeface from French is three designs pretending to be one. Self-hosted and subset to
76KB for all six files.

**Key Characteristics:**
- Comparison grammar without ranking grammar — the central discipline of the system
- A party owns a full colour field down its whole column, never a dot
- One magnitude variable: the signed −2…+2 meter, identical everywhere a score appears
- Four visually distinct evidence states, judging the source and never the party
- Every claim carries its counter-evidence in the same field
- Absence is withheld and counted, never rendered as rows of empty cells
- Arabic set at display scale, not as metadata beneath French

## Colors

Warm newsprint neutrals under one reserved signal, with two strictly separated
categorical systems: party identity and evidence strength.

### Primary
- **Signal Amber** (`#e8a13a`): The reader's own choices, and nothing else. Selected
  filters, active toggles, the row under the cursor, text selection, focus rings. It
  never marks a party, a score, or an outcome. If amber is on screen, the reader put it
  there.

### Secondary
- **Slate** (`#33607e`): Structure and navigation — links, the caret, the turnout line,
  chart axes. The system's only other non-neutral interface colour.

### Neutral
- **Newsprint** (`#f2efe6`): The page ground. Warm, never white.
- **Page Stock** (`#fbf9f3`): Cards, comparison cells, the sticky header — one step up.
- **Trough** (`#e7e3d6`): Recessed. Row labels, chips, counter-evidence blocks, form marks.
- **Ink** (`#15181c`): Primary text, group-header fills, the 2px rules that divide sections.
- **Ink Secondary** (`#4a4f56`): Secondary prose, summaries, nav links at rest.
- **Muted** (`#61646a`): Dates, qualifiers, source lists. Darkened from its first draft
  to clear 4.5:1 on all three light grounds.
- **Rule** (`#d8d3c4`) / **Rule Strong** (`#b9b3a1`): Hairlines, and the heavier rule
  under a table head.

### Tertiary — party slots
Eight fixed slots (`slot-1` … `slot-8`), colour-blind validated, assigned by the `SLOT`
map in `app.js` to the eight largest parties of 2021; every other party takes
**Slot None** (`#8b8677`). A slot follows its party across every surface.

### Evidence colours
**Corroborated** (`#1b7247`), **Single source** (`#7a6111`), **Disputed** (`#a14b1c`),
**Absent** (`#61646a`). All four clear 4.5:1 on every light ground. They rate the
*source*, never the party.

### On-colour
- **On Slot** (`#ffffff`): The only pure white in the system. It is text or a glyph
  sitting on a party's own slot colour — a seat-bar segment, a logo-tile fallback, a
  first-place form mark. It never appears as a background.

### Named Rules
**The Not-Their-Colour Rule.** No party's real brand colour appears anywhere in this
interface. A party rendered in its own livery reads as affiliation rather than as a
series, and the eight-slot palette is validated as a set. The only place a party's own
colours legitimately appear is inside a logo or portrait from `data/media.json`, which
is content, not chrome.

**The Reader's Colour Rule.** Signal Amber marks only what the reader chose. It is never
spent on emphasis, on a party, or on a value the data supplies.

**The Two-Systems Rule.** Party colour and evidence colour never mix. A party is never
tinted by how well sourced it is, and evidence is never tinted by whose it is.

## Typography

**One family: Tajawal** (400 / 700 / 800), self-hosted, Arabic and Latin subsets,
`font-display: swap`, 700 weights preloaded.

**Character:** A geometric Arabic-first workhorse. Arabic is the design's first script,
not an afterthought bolted to a Latin face — which is what a Darija-first product
requires. Numerals run `tabular-nums` wherever they can be compared.

### Hierarchy
- **Display** (800, `clamp(28px, 6vw, 40px)`, `-0.02em`): Page title, one per page.
- **Headline** (800, `clamp(20px, 3.4vw, 25px)`): Section heads, over a 2px ink rule.
- **Party Name** (800, `clamp(19px, 3.6vw, 27px)`, `-0.03em`): A party at the head of
  its comparison column. The heaviest type in the system — the match-day page sets the
  competitors' names big, and so does this.
- **Figure** (800, 19px, tabular): Any compared value.
- **Title** (700, 17px) · **Lede** (400, 17px, ≤62ch) · **Body** (400, 16px/1.55, ≤68ch)
- **Small** (400, 14px) · **Micro** (400, 12.5px) · **Tag** (700, 12px)
- **Label** (800, 12.5px, uppercase, `0.06em`): Table heads and group headers only.
- **Nav** (700, 15px): Header links.
- **Fine** (400, 11px) / **Fine Caps** (700, 10.5px, `0.06em`): Meter pole names, form-mark
  years, the source-language tag. 10px is the floor, reached only by the meter scale at
  phone width.

### Named Rules
**The Aligned-Figure Rule.** Every value a reader might compare down a column is
tabular.

**The Isolation Rule.** Numerals and mixed number-and-word phrases are wrapped in
`<bdi>`, and negatives use U+2212. Without it, `−1` renders as `1-` under `dir="rtl"`
and "27.7% of the vote" reverses. Any new numeric string is isolated the same way.

## Layout

A single centred column, `max-width: 1180px`, 16px gutter, under a sticky 58px header
closed by a 2px ink rule. No sidebar, no dashboard chrome.

**The comparison grid is one grid.** The head row and every comparison row share the
same `grid-template-columns: minmax(118px, 0.78fr) repeat(var(--cols), minmax(0, 1fr))`,
with a spacer cell holding the label column open under the party heads. A head row on
its own grid was the first defect this build produced; they are bound together now.

**Responsive.** Two breakpoints. At **760px** the header wraps so the nav takes its own
row and nothing clips. At **560px** the comparison restructures: the row label becomes a
full-width uppercase header and the party cells sit side by side beneath it, because
three columns at 390px is unreadable. Tables scroll rather than reflow.

**RTL.** Every directional property in the system is logical — `border-inline-start`,
`padding-inline`, `inset-inline-start`, `margin-inline`. There are no physical `left` or
`right` properties in the stylesheet. The layout mirrors wholesale under `dir="rtl"`,
including the comparison grid, the meters and the colour fields.

## Elevation & Depth

**No shadows.** The stylesheet contains no `box-shadow`. Depth is a three-step tonal
ladder plus rules of two weights:

- **Ground** — Newsprint · **Raised** — Page Stock with a 1px Rule border · **Recessed** — Trough
- **1px Rule** separates rows and cells; **2px Ink** separates sections, closes the
  header, and underlines a table head.

The ladder inverts cleanly in dark mode (`#14161a` → `#1c1f24` → `#23272d`), which is
why one token set carries both themes.

### Named Rules
**The Two-Rules Rule.** A divider is either a 1px hairline or a 2px ink rule. The
hairline separates peers; the ink rule separates sections. There is no third weight, and
nothing casts a shadow.

## Shapes

Seven radii, each with one job: **3px** the meter bar and the party swatch, **4px** the
source-language tag, **7px** the small identity mark (logo tile, form mark), **8px** the
larger logo tile on a party column, **10px** inset boxes, fields and counter-blocks,
**14px** cards and the comparison frame, and **999px** small controls only — buttons,
chips, pills, nav links.

Borders are always 1px Rule or 2px Ink. The colour field at the head of a party column
is a 6px bar; on a party card it is 4px. Everything is a soft rectangle: no diagonals,
no clipping, no asymmetric radii.

## Components

### Party Picker
Up to three slots in an auto-fit grid. A filled slot carries a 5px colour field on its
leading edge, the logo at 40px, the abbreviation at 800, the full name in the reader's
language, and a remove control. An empty slot is dashed and says "Add a party"; it is
the primary action on the page. Selecting opens a modal `<dialog>` search that lists
parties **with positions on file first**, then the rest under an explicit heading —
because only 9 of 50 parties carry policy or programme evidence, and the picker should
not pretend otherwise.

### Head-to-Head Column
A 6px colour field across the top, the logo at 46px, the party name at display weight,
the full name beneath, and the form guide. Shares the comparison grid exactly.

### Form Guide
The last five general elections as 26px marks, each showing the two-digit year, with
the finishing position encoded by fill: solid party colour for first, a 26% tint for a
top-three finish, trough for ran, muted for absent. **It reports what happened. It does
not say who was better,** and it carries no points, no positions table, and no ordering.

### Comparison Row
A trough-filled label cell and one cell per party. Group headers are full-width ink
bands in Label type. Rows where no selected party has evidence are removed and reported
in a single counted line beneath the group.

### The Meter
The system's one magnitude variable: a signed −2…+2 track with a centre axis and a bar
in the party's own colour, with the dimension's two poles named beneath it. Identical in
the comparison, on the party page, and anywhere a score is shown. A second magnitude
encoding would break the reader's calibration.

### Evidence Tag
Four states with an authored icon each (one 20-unit box, 1.75 stroke): corroborated
(double check), single source (dotted circle), disputed (split circle), absent (dashed
circle). Never colour alone — each state carries its own glyph and its own words.

### Counter-Evidence Block
A trough-filled block introduced by an uppercase micro-label — "What this does not mean",
"Independent verification" — carrying what qualifies or contradicts the figure above it.
It sits in the same cell as the claim, never in a footnote.

### Untranslated Marker
Prose with no translation in the reader's language ships with an inline `EN` tag and a
leading rule. The interface states the source language rather than presenting English
inside an Arabic page.

### Buttons, Fields, Chips, Nav
Pills at 999px. Buttons are 1px-bordered and transparent, filling Signal Amber when
active. Fields are 10px with a Page Stock fill, focusing to a Slate border plus the
amber ring. Nav links are pills; the current page fills Ink. Chips are static labels and
are never interactive — that is the button's job.

### Charts
Chart.js styled from the CSS custom properties at render time and fully re-rendered on
theme change. **Every axis carries a title**; an unlabelled axis is a defect. Legends
are authored HTML, never Chart.js's own.

## Do's and Don'ts

### Do:
- **Do** show what happened, and let the reader decide what it means.
- **Do** give a party a full colour field down its column.
- **Do** use the meter for every signed score, unchanged.
- **Do** put counter-evidence in the same cell as the claim.
- **Do** withhold and count empty rows rather than rendering them.
- **Do** wrap numerals and mixed phrases in `<bdi>`, and use U+2212 for negatives.
- **Do** use logical properties for anything directional.
- **Do** title every chart axis.
- **Do** measure contrast against the real ground; light mode is the tight one.

### Don't:
- **Don't** rank parties, anywhere, by anything. No standings, no points, no "top".
- **Don't** give a party its real brand colour.
- **Don't** spend Signal Amber on anything the reader did not choose.
- **Don't** tint a party by evidence strength, or evidence by whose it is.
- **Don't** add a `box-shadow`, or a third divider weight.
- **Don't** introduce a second typeface; Arabic and Latin share one family by design.
- **Don't** use a physical `left`/`right` property.
- **Don't** convey a state by colour alone — every evidence state has a glyph and words.
- **Don't** present untranslated prose without its source-language marker.
