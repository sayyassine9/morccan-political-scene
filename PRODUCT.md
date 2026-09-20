# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

Primary: **Moroccan voters in the days before the 23 September 2026 general
election** — citizens deciding how to vote, with no assumed prior knowledge of
party history, coalition arithmetic or the difference between a party's claims
and its record. They arrive with a question about a specific party or a specific
issue, not with an appetite for an archive.

Secondary audiences exist and are served by the same data but do not set the
brief: journalists and analysts who need a sourced figure quickly, researchers
and students who use the full record since 1944 and the SQLite export, and
diaspora or international readers working in English or French.

## Product Purpose

Ntikhabat is a cross-sourced data bank of the Moroccan political scene with a
static dashboard on top of it. Its purpose is to let a voter **decide who to
vote for** on the evidence: what each party actually did, what it actually
promised, and how well any of it is corroborated.

Success is a visitor who leaves with a clearer, better-grounded voting choice —
not one who leaves impressed by the depth of the archive. The archive and the
accountability material (claims vs. verification, promises vs. parliamentary
votes) exist to support that decision, in that order.

## Positioning

The differentiating mechanism is **published uncertainty**. Every figure carries
its sources and a confidence rating (`high` / `medium` / `low`), disagreements
between sources are recorded verbatim in `notes` rather than silently resolved,
and party self-claims are labelled as claims and paired with a `verification`
note saying what independent sources support. A party site, a press summary or
a neighbouring tracker can restate the same numbers; none of them can truthfully
restate the provenance and the doubt attached to each one.

The second mechanism is **breadth across time**: 50 parties, 20 elections back
to the 1960s, 27 governments since 1955 and 51 major events since 1944, each
event carrying the documented position of each party — so a 2026 promise can be
read against a fifty-year record rather than against the last news cycle.

## Operating Context

- The site is consulted in a **compressed pre-election window**, against a fixed
  date (23 September 2026). Sessions are short and question-driven.
- The "current" parliament throughout is the one elected on **8 September 2021**;
  `leg-2026` in `data/elections.json` is a results-less placeholder to be filled
  after election day, followed by a new `data/governments.json` entry and a
  rebuild.
- Data was assembled in September 2026 from search-result excerpts rather than
  full-page reads of the cited sources (the research environment could only
  reach a search index). Every record keeps the URLs it relied on.
- Three interface languages: English, French and Darija (`ary`, RTL).
- Delivery is GitHub Pages at ntikhabat.com, rebuilt by
  `.github/workflows/pages.yml` on every push to the default branch.

## Capabilities and Constraints

**Capabilities**

- Dashboard (`index.html`): seat balance, historical seats and vote share,
  turnout, government track since independence, regional power, party cards.
- Elections, events-and-positions (searchable), policy map (6 dimensions scored
  −2..+2 per party), programme comparison (2026 manifesto commitments against
  earlier promises, parliamentary legislation and employment outcomes),
  per-party pages with logos and leader portraits, methodology and sources.
- `data/*.json` is the single source of truth; `scripts/build.py` validates it
  and bundles it into `site/data.js`; `scripts/export_sqlite.py` emits a
  normalized `site/data.sqlite` for downstream use.

**Constraints**

- **Strict editorial neutrality.** No party is favoured; no editorialising.
  Claims are always labelled as claims and paired with verification. This is
  binding on copy, on visual emphasis and on any ranking or ordering choice.
- Fully static: no backend, no API, no build step beyond the Python bundler.
  Pages must keep working when opened directly from disk (`file://`), which is
  why data is bundled into `site/data.js` rather than fetched. Vendored
  Chart.js; no CDN dependency.
- Chart colours are a fixed, colour-blind-validated categorical palette assigned
  to the eight largest parties of 2021. **They are not the parties' official
  brand colours**, and must not be presented as such. Every chart carries a
  legend and a table view.
- Media assets carry a rights ledger (license, sha256, credit, restrictions) in
  `data/media.json`; usage must respect it.

**Open / undecided**

- The site currently defaults to **English**; the intended primary language is
  **Darija**. Changing the default is agreed in principle but not implemented,
  and it is not merely a config flip — see Evidence on Hand.
- Whether the site is maintained past the 2026 election, and by whom, is not
  decided.
- No confirmed position on low-bandwidth or older-device targets. The audience
  makes this likely to matter, but it has not been established as a requirement
  and must not be asserted as one.

## Brand Commitments

- Name: **Ntikhabat** (adopted for the ntikhabat.com deployment; the repository
  and earlier commits use "Moroccan political scene").
- Voice: neutral, factual, non-editorialising prose — carried over from the
  research brief that governs the data and applying equally to interface copy.

## Evidence on Hand

Real, in-repo, and not to be fabricated or embellished:

- `data/parties.json` — 50 parties with names (fr/ar/en), founding, ideology,
  leaders, timeline, achievements as claims-plus-verification, metrics, sources,
  confidence.
- `data/elections.json` — 20 elections; `data/governments.json` — 27 governments;
  `data/events.json` — 51 events with per-party documented positions.
- `data/policy-positions.json`, `data/programmes.json`, `data/sources.json`
  (161 registered sources), `data/media.json` (52 logos and portraits with a
  rights ledger) — migrated from the sister "Majlis" project on 2026-09-19 via
  `scripts/migrate_majlis.py`, reconciled by name through
  `data/raw/crosswalk.json`. This subset covers current/2026-relevant parties
  only, carries per-field provenance, and is explicitly **a starting point, not
  a finished dataset**.
- `docs/METHODOLOGY.md` and `docs/RESEARCH_BRIEF.md` — how figures were gathered
  and rated, and the known limitations.

Absences future work must not paper over:

- **No 2026 election results exist yet.**
- Pre-1993 per-party totals vary between sources; communal and regional figures
  come from press-relayed ministry announcements; public funding figures exist
  only for years with a published Cour des comptes report; membership numbers
  are unaudited party claims.
- **Translation is partial.** The i18n layer (`site/assets/i18n.js` plus
  `fr.js` / `ary.js`, ~105 entries each) translates interface chrome only.
  Party names carry fr/ar/en, but the prose in the data bank — founding context,
  timeline entries, achievements, verification notes, event descriptions — is
  English-only. A Darija-first default would currently present a Darija shell
  around English content.
- No analytics, no testimonials, no usage figures, no press coverage.

## Product Principles

1. **The voter's question comes first.** Depth exists to answer it, not to be
   admired. A visitor with one party or one issue in mind should reach an
   answer without touring the archive.
2. **Never state a figure without its provenance.** Confidence and sources
   travel with the number into the interface; they are not relegated to the
   methodology page.
3. **A claim is never dressed as a fact.** Party self-claims stay visibly
   labelled and paired with what independent sources do and don't support.
4. **Neutrality is structural, not just editorial.** Ordering, emphasis, colour
   and prominence are neutrality decisions as much as wording is.
5. **Absence is reported, not filled.** Missing results, unresolved source
   conflicts and untranslated content are shown as such rather than smoothed
   over or invented.

## Accessibility & Inclusion

- Trilingual with full RTL support for Darija; layout, charts, tables and
  navigation must hold under `dir="rtl"`.
- Colour is never the sole carrier of meaning: the categorical palette is
  colour-blind-validated and every chart is paired with a legend and a table
  view. Preserve this pairing in any new data display.
- Light and dark themes are both supported, with an explicit override on top of
  `prefers-color-scheme`.
