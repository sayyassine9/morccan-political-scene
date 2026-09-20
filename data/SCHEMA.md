# Data schema — Moroccan political scene data bank

All canonical data lives in `data/*.json`. Every numeric or factual claim carries
`sources` (list of URLs or citations) and, where relevant, a `confidence` field:

- `confidence`: `"high"` (2+ independent sources agree), `"medium"` (1 solid
  source, or sources differ slightly and the discrepancy is noted), `"low"`
  (single source, party self-claim, or unresolved conflict). Always record
  disagreements in `notes` rather than silently picking one.

Party IDs (slug, lowercase): `rni`, `pam`, `istiqlal`, `usfp`, `mp`, `pps`, `uc`,
`pjd`, `mds`, `fgd`, `psu`, `pads`, `cni`, `annahj`, `al-ahd`, `prv`, `pedd`,
`ffd`, `pud`, `pgvm`, `pdi`, `prd`, `pml`, `ps`, `unfp`, `oadp`, `fdic`, `pnd`,
`pa`, `pcs`, `ps-um`, `parti-marocain-liberal` ... add as needed (keep stable).

IDs are only ever added, never renamed or reused for a different party — anything
that consumed data cross-references by id. When importing data from another
source that uses different ids for the same party, build a crosswalk (see
`data/raw/crosswalk.json` for the Majlis/morocco-politics import) and translate
every reference at import time rather than introducing a second id for one party.

## Per-field provenance (optional)

Any scalar or object field `X` on a Party may carry an optional sibling key
`X_provenance` recording where a *specific* claim came from, independent of the
party-level `data_quality.confidence` tier above:

```
"founded": 1978,
"founded_provenance": {
  "status": "cross-checked",   // cross-checked | reported | disputed | official-provisional | historical-classification | unknown
  "sources": ["tafra-rni", "directory"],
  "note": ""                    // required when status is disputed or unknown
}
```

This is additive only — existing code that reads `p.founded` etc. as a plain
value keeps working untouched; `_provenance` is opt-in for renderers that want
to surface it. Use it for facts imported with richer per-field sourcing (e.g.
the Majlis import) rather than retrofitting it onto every existing field.

`status` maps onto the coarser `confidence` tier when only one is present:

| status | confidence |
|---|---|
| `cross-checked` | `high` |
| `reported` | `medium` |
| `official-provisional` | `medium` |
| `historical-classification` | `medium` |
| `disputed` | `low` |
| `unknown` | `low` |

## sources.json — dict of Source (optional registry)

For data imported with a normalized source registry (rather than inline URL
strings), `data/sources.json` maps a source id to its metadata. Existing files
(`parties.json`, `elections.json`, `events.json`, `governments.json`) keep
using inline URL/citation strings in their `sources` arrays — this registry is
additive, used only by newly-imported data (policy positions, programmes,
media) that reference sources by id instead:

```
{
  "tafra-rni": {"title": "...", "url": "https://...", "type": "database|news|official|academic", "origin": "tafra", "note": ""}
}
```

`origin` identifies shared source lineage (e.g. two outlets both repeating one
ministry release) so that "N sources agree" doesn't overstate independence.

## policy-positions.json — policy dimensions and party positions

```
{
  "dimensions": [ {"id": "religion-article400", "label": "...", "description": "rubric text for -2..+2", "scope": "Specifically about Family Code Article 400, not general secularism."} ],
  "positions": [ {"party_id": "pjd", "dimension_id": "religion-article400", "score": 2, "date": "2024-01-01", "note": "", "sources": ["..."]} ]
}
```

`score` is ordinal −2..+2; `0` means an explicitly mixed/compromise position.
Missing evidence means the position is omitted, never inferred or defaulted to 0.
`sources` reference `data/sources.json` ids.

## programmes.json — manifesto/programme comparison data

```
{
  "documents": [ {"id": "rni-2026", "party_id": "rni", "year": 2026, "title": "...", "url": "...", "sources": ["..."]} ],
  "claims": [ {"id": "rni-2026-jobs", "party_id": "rni", "year": 2026, "text": "...", "kind": "commitment|historical-promise", "sources": ["..."]} ],
  "legislation": [ {"id": "health-bill-2024", "title": "...", "party_id": null, "status": "...", "vote_for": null, "vote_against": null, "note": "sources disagree on tally, see notes", "sources": ["..."]} ],
  "employment_outcomes": [ {"id": "hcp-net-change-2024", "label": "HCP national net employment change", "year": 2024, "value": null, "unit": "jobs", "note": "national series, not attributable to one party or measure", "sources": ["..."]} ]
}
```

## media.json — image/logo rights ledger

```
{ "id": "logo-rni", "party_id": "rni", "kind": "logo|portrait", "path": "assets/media/logo-rni.png",
  "person_name": null, "title": "...", "source_page": "https://...", "license": "...",
  "license_url": "...", "credit": "...", "restrictions": "", "sha256": "...", "reviewed_at": "2026-09-17" }
```

Every entry's `sha256` must match the file at `path`; `build.py` validates both
existence and hash. `restrictions` is populated (not omitted) when a license
claim is disputed or the image is trademarked rather than freely reusable —
preserve that tension rather than hiding it.

## parties.json — array of Party
```
{
  "id": "rni",
  "names": {"fr": "Rassemblement national des indépendants", "ar": "التجمع الوطني للأحرار", "en": "National Rally of Independents"},
  "abbr": "RNI",
  "founded": "1978-10-06",              // ISO date or year
  "founders": ["Ahmed Osman"],
  "founding_context": "...",            // 2-4 sentences
  "ideology": ["liberalism", "economic liberalism"],
  "position": "centre-right",           // far-left|left|centre-left|centre|centre-right|right|big-tent
  "family": "administrative",           // administrative (palace-aligned) | nationalist | left | islamist | berberist | liberal | other
  "headquarters": "Rabat",
  "colour": "#1E5AA8",                  // party colour hex (approx.)
  "website": "https://...",
  "international_affiliation": ["Liberal International"],
  "status": "parliamentary",           // parliamentary | extra-parliamentary | boycotting | dissolved | merged
  "current_leader": {"name": "Aziz Akhannouch", "since": "2016-10-29", "title": "President"},
  "leaders": [ {"name": "...", "from": "YYYY-MM-DD", "to": "YYYY-MM-DD|null", "note": "..."} ],
  "notable_members": [ {"name": "...", "role": "...", "period": "..."} ],
  "timeline": [ {"date": "YYYY-MM-DD", "title": "...", "description": "...", "type": "founding|leadership|split|merger|government|opposition|scandal|electoral|policy|other", "sources": ["..."]} ],
  "achievements": [ {"year": 2021, "title": "...", "description": "...", "claimed_by_party": true, "verification": "what independent sources say", "confidence": "medium", "sources": ["..."]} ],
  "metrics": {
    "government_participation": [ {"government": "Akhannouch I", "from": "2021-10-07", "to": null, "role": "leads|member", "ministers": 7, "sources": []} ],
    "regional_presidencies": [ {"year": 2021, "count": 6, "regions": ["..."], "sources": []} ],
    "house_of_councillors_seats": [ {"year": 2021, "seats": 27, "sources": []} ],
    "communal_seats": [ {"year": 2021, "seats": 9995, "votes": null, "sources": []} ],
    "public_funding_mad": [ {"year": 2021, "amount": 12345678, "sources": []} ],
    "membership_claims": [ {"year": 2018, "claimed": 100000, "source": "party congress", "verification": "no independent audit", "confidence": "low"} ],
    "women_mps": [ {"year": 2021, "count": 20} ],
    "custom": [ {"name": "...", "series": [{"year": 2016, "value": 1}], "unit": "...", "sources": []} ]
  },
  "sources": ["..."],
  "data_quality": {"confidence": "medium", "notes": "..."}
}
```

## elections.json — array of Election
```
{
  "id": "leg-2021",
  "date": "2021-09-08",
  "type": "legislative",                // legislative | communal | regional | councillors | referendum | professional-chambers
  "chamber": "House of Representatives",
  "seats_total": 395,
  "registered_voters": 17983490,
  "votes_cast": 8998585,
  "turnout_pct": 50.35,
  "valid_votes": null,
  "electoral_system": "closed-list PR, Hare quotient on registered voters (2021 reform), 92 local constituencies + 12 regional lists",
  "results": [ {"party_id": "rni", "votes": 2147424, "pct": 24.67, "seats": 102, "seat_change": +65, "sources": [], "confidence": "high", "notes": ""} ],
  "outcome": "RNI-led coalition with PAM and Istiqlal",
  "notes": "discrepancies between sources...",
  "sources": [],
  "confidence": "high"
}
```

## events.json — array of Event
```
{
  "id": "feb20-2011",
  "date": "2011-02-20",
  "end_date": null,
  "title": "20 February Movement protests",
  "category": "protest|constitutional|foreign-policy|social-policy|economy|security|scandal|electoral|institutional|disaster",
  "description": "3-6 sentences, neutral, sourced",
  "significance": "why it matters for the political scene",
  "positions": [ {"party_id": "pjd", "stance": "support|oppose|conditional|mixed|abstain|silent|boycott|split", "summary": "1-3 sentences", "sources": [], "confidence": "medium"} ],
  "tags": ["...", "..."],
  "sources": [],
  "confidence": "high"
}
```

## governments.json — array of Government
```
{ "id": "akhannouch-1", "name": "Akhannouch government", "pm": "Aziz Akhannouch", "pm_party": "rni",
  "from": "2021-10-07", "to": null, "coalition": ["rni","pam","istiqlal"], "seats_support": 270,
  "notes": "", "sources": [] }
```
