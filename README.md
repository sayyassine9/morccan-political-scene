# Moroccan political scene — data bank and dashboard

A cross-sourced data bank of Moroccan political parties (history, leaders, ideology, election results, metrics, positions on major events, policy positions and programme comparisons) with a static, multi-language dashboard.

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
| `data/SCHEMA.md` | Field definitions, confidence rules and the per-field provenance convention |
| `data/raw/` | Research working files, discrepancy notes and the cross-project party-id crosswalk |
| `docs/METHODOLOGY.md` | How figures were gathered and rated |
| `scripts/build.py` | Validates the JSON and bundles it into `site/data.js` |
| `scripts/export_sqlite.py` | Exports `data/*.json` into a normalized `site/data.sqlite` |
| `scripts/migrate_majlis.py` | One-off tool that ported policy/programme/media data from the sister project (see Methodology) |
| `site/` | Static site: dashboard, elections, per-party pages, searchable events, policy map, programme comparison, methodology — in English, French or Darija |

## Run locally

```
python3 scripts/build.py
python3 -m http.server -d site 8000
```

Then open http://localhost:8000. The pages also work when opened directly from disk because the data is bundled into `site/data.js`.

## Deploy

`.github/workflows/pages.yml` validates the data, exports the SQLite database and publishes `site/` to GitHub Pages on every push to the default branch (enable Pages with source "GitHub Actions" in the repository settings).

## Updating after the 23 September 2026 election

Fill in `results` for the `leg-2026` entry in `data/elections.json`, add the new government to `data/governments.json`, then rerun the build script.
