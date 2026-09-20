---
version: 1
slug: "site-index-html"
primary_target: "site/index.html"
related_targets: ["site/party.html","site/record.html","site/methodology.html"]
---

# Surface brief — Ntikhabat (Compare, Party, Record, Method)

Scope: the whole app, four pages. Visitor mode: **Operate**.
Audience: a Moroccan voter on a cheap phone, in sunlight, days before 23 September 2026, deciding how to vote with no assumed prior knowledge.
Task: put two or three parties beside each other and see a real difference, with the evidence attached.
Constraint that outranks expression: strict editorial neutrality.

## Direction contract

**THESIS.** Ntikhabat is a comparison instrument, not an archive with a search box. It owns the side-by-side reading every Moroccan already does fluently every week on a match-day page. It refuses the category default — the civic-tech dashboard of white cards, blue accent and a party grid — and it refuses its own form's ranking grammar: no standings position, no points column, no ordering by merit. Comparison, never league.

**OWN-WORLD.** Warm newsprint ground (#f2efe6), ink (#15181c), signal amber (#e8a13a) for the active state, slate (#33607e) for structure. Each compared party owns a full colour field down its entire column, drawn from the fixed eight-slot colour-blind palette — colour follows the entity, never rank. Ruled sports-page tables, form-guide chips, heavy party names, tabular numerals everywhere. Tajawal 400/700/800 carrying Arabic and Latin in one family. Light, because the reader is outdoors.

**STORY.** The visitor understands that parties differ in ways they can actually see; believes it because every cell carries its provenance and its counter-evidence; and leaves having compared two or three parties against the issues they care about.

**FIRST VIEWPORT.** A party picker across the top — logos at real size, not dots — with two slots filled and a third empty and inviting. Below it, immediately, the head-to-head: party names heavy at display scale over their colour fields, a form guide of the last five elections as result chips, then ruled comparison rows (seats, government participation, the six policy dimensions, 2026 promises). The primary action is the third party slot. No hero, no chart, no history above the fold.

**FORM.** The Match-Day Table — Botola standings, head-to-head cards and form guides. Candidate 1 of my ordered grounded list; the roll assigned candidate 6 (The Verification Sheet) and the user took the pick over the roll. Seed key 08bb483f, scope direction, mode operate, code-led.

**FINISH.** unreviewed and undocumented is unfinished; this build ends with the finish review, the verdict, DESIGN.md, and every shipping raster carrying its provenance

## Raises carried from declined challengers

- **Counter-evidence in the same field** (from Tensegrity Column): every figure shows what opposes it; corroborated / single-source / disputed / absent are four visually distinct states, not one grey tag.
- **Darija as primary material** (from Alphabet Storm): Arabic set at real display scale, never as metadata beneath French.
- **Colour committed at region scale** (from Capsules on a Green Field): a party owns a whole column field, not a 10px dot.
- **One magnitude variable** (from ASCII Scene Render): a single visual variable carries magnitude everywhere it appears.

## Unresolved

- Gemini API key not yet supplied; translation pipeline ships runnable and unrun.
- Darija translation has never had a native review; the pipeline emits a review CSV rather than presenting unreviewed output as verified.
