# Research brief (for all research agents)

Goal: a verified data bank on Moroccan political parties. **Do not copy party
self-claims as facts.** For every figure:

1. Run at least two *different* WebSearch queries (vary language: French, Arabic,
   English; vary source type: Wikipedia, IPU PARLINE, Ministry of Interior
   announcements, Cour des comptes, MAP/Hespress/Le360/Médias24/TelQuel/Le Desk,
   academic papers, Carnegie/Brookings/ECFR/Arab Barometer).
2. Record every source URL you relied on. Record disagreements verbatim in
   `notes` (e.g. "Wikipedia says 102 seats; IPU says 102; Le360 said 97 on
   election night (provisional)").
3. Assign `confidence` per the schema.
4. Prefer official / independent sources over party websites. Mark any
   membership numbers as `claimed` and note whether any independent audit exists.
5. Write neutral, factual prose. No editorialising.

Constraints of this environment: only the WebSearch tool works (WebFetch and
curl are blocked for external sites). Use many targeted queries; the search
result summaries cite URLs — keep those URLs as sources.

Output: write valid JSON matching `data/SCHEMA.md` to the file you were told,
plus a short markdown notes file listing unresolved discrepancies and gaps.
Validate the JSON with `python3 -m json.tool <file>` before finishing.
