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
