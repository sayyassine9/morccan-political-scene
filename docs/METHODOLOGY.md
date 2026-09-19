# Methodology

This data bank documents Moroccan political parties, elections, governments and party positions on major events. It was assembled in September 2026, one week before the 23 September 2026 general election, so the "current" parliament is the one elected on 8 September 2021.

## How figures were gathered

- Every figure was researched through multiple independent web searches in French, Arabic and English. The search results cite the underlying pages (Wikipedia in three languages, IPU PARLINE, Ministry of Interior announcements relayed by MAP, Le360, Hespress, Médias24, TelQuel, Le Desk, Cour des comptes reports, academic and think-tank analyses).
- The build environment could not open the source pages directly (only a search index was reachable), so figures rest on the cited search excerpts rather than on full-page reads. Every record keeps the URLs it relied on so a reader can open them.
- Party self-claims (membership, "achievements") are labelled as claims and paired with a `verification` note saying what independent sources support.

## Confidence ratings

- **high**: two or more independent sources agree on the figure.
- **medium**: one solid source, or sources differ slightly and the discrepancy is recorded in `notes`.
- **low**: a single source, a party self-claim, or an unresolved conflict between sources.

Disagreements between sources are recorded verbatim in the `notes` field rather than silently resolved.

## Colours

Chart colours are a fixed, colour-blind-validated categorical palette assigned to the eight largest parties of the 2021 election. They are not the parties' official brand colours. Every chart carries a legend and a table view.

## Known limitations

- Pre-1993 elections included indirectly elected seats; per-party totals in older elections vary between sources and are rated accordingly.
- Communal and regional election figures come from Ministry of Interior announcements as reported in the press; official consolidated tables are not always public.
- Public funding figures come from Cour des comptes annual reports on party finances; years without a published report are absent.
- Membership numbers are party claims and are not independently audited.
- The 2026 general election has no results yet. Update `data/elections.json` (entry `leg-2026`) after 23 September 2026 and rerun `python3 scripts/build.py`.

## Policy positions, programmes and media (from the Majlis merge)

`data/policy-positions.json`, `data/programmes.json`, `data/sources.json` and
`data/media.json` were migrated from a sister project ("Majlis" /
morocco-politics) via `scripts/migrate_majlis.py`, on 2026-09-19. That
project scored 33 current/2026-relevant parties on 6 policy dimensions
(−2..+2, editorial coding from dated statements and programmes), tracked
2026 manifesto commitments against earlier promises and parliamentary
votes, and curated 52 party logos/portraits with a rights ledger (license,
sha256, credit, restrictions).

Party identity was reconciled between the two projects in
`data/raw/crosswalk.json` — matching by French/Arabic name, not by id or
acronym, since acronyms collide across unrelated historical parties (e.g.
Majlis's `psd` and this repo's own pre-existing `psd` are two different
parties; the crosswalk resolves Majlis's `psd` to this repo's
`psd-societe` instead). Two genuinely new parties were added (`umd`,
`al-insaf`); Majlis's four per-election-cycle records for the recurring
left alliance (`fgd2016`, `afg2021`, `fgd2022`, `ag2026`) were folded into
this repo's single `fgd` party as dated timeline entries rather than
kept as separate records.

This imported data uses a richer per-field provenance pattern than the
party-level `confidence` tier above — see "Per-field provenance" in
`data/SCHEMA.md`. It is intentionally narrower in scope than the rest of
this data bank (current parties only, no regions/relationships data —
those were judged too thin to port reliably) and should be treated as a
starting point for further research, not a finished dataset.

## Interface language

The site defaults to English but offers French and Darija (Moroccan
Arabic, right-to-left) via the language picker in the header, using a
phrase-dictionary translator (`site/assets/i18n.js`) ported from the
Majlis project. The dictionaries (`site/assets/i18n/{fr,ary}.js`) cover
navigation and the main dashboard/party-page labels; they are a starting
set, not an exhaustive translation, and chart canvas text (Chart.js
tooltips/axes) is not translated by this mechanism at all. The Darija
dictionary has not been reviewed by a native speaker.

## SQLite export

`scripts/export_sqlite.py` builds `site/data.sqlite`, a normalized export
of every `data/*.json` file (20 tables, with `record_json` columns
preserving each source record in full) for anyone who wants to query the
data bank directly rather than parse the bundled JSON. It runs after
`scripts/build.py` in CI and writes to a temp file first, replacing the
committed database only once SQLite's own foreign-key and integrity
checks pass.

## Updating the data

1. Edit the JSON files in `data/` following `data/SCHEMA.md`.
2. Run `python3 scripts/build.py` (add `--strict` to fail on unknown party ids). The script validates dates, stances, confidence values and seat totals, then writes `site/data.js`.
3. Run `python3 scripts/export_sqlite.py` to refresh `site/data.sqlite` (optional locally; CI runs this on every deploy).
4. Open `site/index.html` in a browser, or serve the `site/` folder.
