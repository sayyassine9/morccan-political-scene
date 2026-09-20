# Ntikhabat — Moroccan political data bank and comparison tool

A cross-sourced data bank of Moroccan political parties, and a static multi-language
site that lets a voter put parties **side by side** — their record, where they stand, and
what they are promising for 2026 — with the sources attached to every figure.

## Structure

| Path | Purpose |
|---|---|
| `data/parties.json` | One record per party: names, founding, ideology, leaders, timeline, achievements (claims vs verification), metrics, sources, confidence |
| `data/elections.json` | Every legislative, communal, regional and House of Councillors election with per-party votes/seats and turnout |
| `data/events.json` | Major events since 1944 with the documented position of each party |
| `data/governments.json` | Every government since 1955 with coalition composition |
| `data/policy-positions.json` | 6 policy dimensions and per-party editorial positions (−2..+2), sourced |
| `data/programmes.json` | 2026 manifesto commitments, earlier promises, parliamentary legislation records and employment outcomes |
| `data/media.json` | Party logos and leader portraits with a license/rights ledger |
| `data/sources.json` | Normalized source registry used by the policy/programme/media data |
| `data/i18n/` | Machine translations of the data bank's prose, keyed by content hash (see below) |
| `data/SCHEMA.md` | Field definitions, confidence rules and the per-field provenance convention |
| `data/raw/` | Research working files, discrepancy notes and the cross-project party-id crosswalk |
| `docs/METHODOLOGY.md` | How figures were gathered and rated |
| `scripts/build.py` | Validates the JSON and bundles it (with translations) into `site/data.js` |
| `scripts/translate.py` | Translates the data bank's prose and the interface into French and Darija via the Gemini API |
| `scripts/export_sqlite.py` | Exports `data/*.json` into a normalized `site/data.sqlite` |
| `PRODUCT.md` / `DESIGN.md` | Durable product truth, and the design system as built |

## The site

Four pages, in English, French or Darija (RTL):

| Page | What it does |
|---|---|
| `site/index.html` | **Compare** — pick two or three parties, see them side by side |
| `site/party.html` | One party in full: origin, positions, commitments, claims-vs-verification, leadership, timeline, event positions |
| `site/record.html` | The archive: elections, governments, and events with per-party positions |
| `site/methodology.html` | How every figure was gathered, rated and sourced |

## Run locally

```
python3 scripts/build.py
python3 -m http.server -d site 8000
```

Then open http://localhost:8000. The pages also work opened directly from disk, because
the data is bundled into `site/data.js` and the fonts are self-hosted.

## Translations

The interface and the data bank's prose are translated by `scripts/translate.py`, which
calls the Gemini API. Translations are content-addressed by a hash of the source string,
so a re-run only sends what changed.

```
export GEMINI_API_KEY=...
python3 scripts/translate.py --dry-run     # what would be sent, sends nothing
python3 scripts/translate.py               # data-bank prose -> data/i18n/{fr,ary}.json
python3 scripts/translate.py --ui          # interface chrome -> site/assets/i18n/{fr,ary}.js
python3 scripts/translate.py --review      # reviewer CSV per language
python3 scripts/build.py                   # bundle the result
```

Output is **machine translation and has not been reviewed by a native speaker.** Strings
with no translation render in their source language with an explicit `EN` marker rather
than being silently shown inside an Arabic page. Run `--review` to produce the CSV a
reviewer can correct.

## Deploy

`.github/workflows/pages.yml` validates the data, exports the SQLite database and
publishes `site/` to GitHub Pages on every push to the default branch (enable Pages with
source "GitHub Actions" in the repository settings).

## Updating after the 23 September 2026 election

Fill in `results` for the `leg-2026` entry in `data/elections.json`, add the new
government to `data/governments.json`, then rerun the build script.
