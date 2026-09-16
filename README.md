# Moroccan political scene — data bank and dashboard

A cross-sourced data bank of Moroccan political parties (history, leaders, ideology, election results, metrics, positions on major events) with a static dashboard.

## Structure

| Path | Purpose |
|---|---|
| `data/parties.json` | One record per party: names, founding, ideology, leaders, timeline, achievements (claims vs verification), metrics, sources, confidence |
| `data/elections.json` | Every legislative, communal, regional and House of Councillors election with per-party votes/seats and turnout |
| `data/events.json` | Major events since 1944 with the documented position of each party |
| `data/governments.json` | Every government since 1955 with coalition composition |
| `data/SCHEMA.md` | Field definitions and confidence rules |
| `data/raw/` | Research working files and discrepancy notes per topic |
| `docs/METHODOLOGY.md` | How figures were gathered and rated |
| `scripts/build.py` | Validates the JSON and bundles it into `site/data.js` |
| `site/` | Static site: dashboard, elections, per-party pages, searchable events with party positions, methodology |

## Run locally

```
python3 scripts/build.py
python3 -m http.server -d site 8000
```

Then open http://localhost:8000. The pages also work when opened directly from disk because the data is bundled into `site/data.js`.

## Deploy

`.github/workflows/pages.yml` validates the data and publishes `site/` to GitHub Pages on every push to the default branch (enable Pages with source "GitHub Actions" in the repository settings).

## Updating after the 23 September 2026 election

Fill in `results` for the `leg-2026` entry in `data/elections.json`, add the new government to `data/governments.json`, then rerun the build script.
