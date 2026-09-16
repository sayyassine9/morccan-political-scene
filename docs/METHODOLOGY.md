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

## Updating the data

1. Edit the JSON files in `data/` following `data/SCHEMA.md`.
2. Run `python3 scripts/build.py` (add `--strict` to fail on unknown party ids). The script validates dates, stances, confidence values and seat totals, then writes `site/data.js`.
3. Open `site/index.html` in a browser, or serve the `site/` folder.
