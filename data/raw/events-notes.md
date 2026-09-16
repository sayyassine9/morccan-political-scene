# events.json — research notes, gaps and discrepancies

Generated 2026-09-16. 51 events, 289 party positions. Election of 23 September 2026 has not taken place; nothing in the file describes results.

## Method and an important caveat on verification depth

- The research brief asks for two WebSearch queries per event. The session's shared WebSearch budget (200 calls) was exhausted after ~30 queries in this agent, so **only the 2021–2026 block was cross-checked in-session** (queries in French, Arabic and English). Those events carry live press URLs (Médias24, Le Matin, TelQuel, Le Desk, Le360, Hespress, Yabiladi, Jeune Afrique, Al Jazeera, Carnegie, HRW, PJD.ma, PPS.ma, chambredesrepresentants.ma).
- Events **before 2021** (independence manifesto through Pegasus/pardons) were written from established reference knowledge and cite Wikipedia (FR/EN) reference pages as the only sources. They were **not fetched in this session**. Per the schema these are capped at `medium` confidence, and the sub-events whose exact dates or vote breakdowns are from memory are marked `low`. A follow-up agent with search budget should re-verify them first (list below).
- Party IDs: `unfp` used for 1959–1975 (USFP is the 1975 successor); `pps` used for the Moroccan Communist Party / PLS before 1974 (noted in each summary); `psu` used for OADP/PSU before the FGD (2014); `pjd` used for the MPCD before 1998 (noted); `fgd` for the Federation of the Democratic Left from 2014.

## Events verified in-session (search-backed)

electoral-quotient-reform-2021, us-recognition-israel-normalisation-2020 (positions via Yabiladi/MEE/Hespress), amazigh-new-year-holiday-2023, teachers-strikes-unified-statute-2023, al-haouz-earthquake-2023, gaza-war-normalisation-debate-2023, moudawana-revision-2023-2024, penal-code-article-490-abortion-debate-2024, france-recognises-autonomy-plan-2024, strike-law-97-15-2025, penal-procedure-code-2025, censure-motion-dispute-2025, genz212-protests-2025, unsc-resolution-2797-2025, rni-leadership-change-2026, electoral-reform-2025-2026, legislative-campaign-2026.

## Discrepancies found

1. **1962 referendum, Istiqlal stance.** The task brief says "Istiqlal/UNFP boycott". Standard references record a UNFP (and PCM) boycott and an Istiqlal yes vote; Istiqlal moved to opposition only after the 1963 elections. Kept `support` at `low` confidence with the discrepancy noted in the position summary. Needs a source check.
2. **Moudawana revision dates.** The task brief mentions "Sept 2024 royal instructions". Sources found place the royal letter ordering the revision on 26 September 2023, the commission's proposals in March 2024, the Ulema council opinion late 2024 and the public announcement on 24 December 2024. The event uses 2023-09-26 as start date and 2024-12-24 as end date.
3. **GenZ 212 casualty/arrest figures.** Wikipedia: 3 killed, 28 injured, 2,400+ arrested (27 Sep–18 Oct 2025). HRW (15 Oct 2025) reports repression but different arrest counts over time. Government measures announced 19 Oct 2025: +16% health/education budget; Wikipedia phrases it as "$15 billion", Moroccan press as ~140 billion MAD — the file uses the MAD figure with "about".
4. **Akhannouch and the RNI.** One English source (Washington Institute) says Akhannouch "stepped down as party head after the Gen Z 212 protests"; Moroccan press (Le Desk, TelQuel, Médias24, 7–9 Feb 2026) frames it as declining a third term under party statutes. Both recorded; causality left to the "commentators linked" wording. Successor spelled "Chaouki" (Le Desk/TelQuel) vs "Chouki" (Le Matin).
5. **Strike law votes.** Councillors 3 Feb 2025: 41 for / 7 against (Médias24, maroc.ma). Representatives second reading 5 Feb 2025: "large majority" (Jeune Afrique) — exact count not retrieved. Opposition voting against listed as MP, USFP, PPS, PJD (Jeune Afrique).
6. **Penal procedure code.** First reading 20 May 2025: 130–40 (Le Matin); second reading 22 July 2025 (chambredesrepresentants.ma); entry into force 8 Dec 2025 (Le360). One AllAfrica piece dates the controversy in June 2025.
7. **UNSC 2797.** 31 Oct 2025, 11 for, 0 against, 3 abstentions (Le Matin/Hilale). Abstaining members not recorded in the file (believed Russia, China, Pakistan; Algeria did not vote) — verify before use.
8. **Pension reform 2016 date.** Final adoption date given as 2016-07-20 from memory; may be off by days. Vote breakdown by party (opposition Istiqlal/PAM/USFP/UC against) is from memory — `low`.
9. **Framework law 51-17.** Vote 241/4/21 on 22 July 2019 and the identity of the 4 "no" votes (PJD deputies) from memory — `low`; Istiqlal's stance (support vs abstention) uncertain.
10. **Cannabis law 13-21.** Reps vote 119–48 on 26 May 2021 from memory; PJD "no" bloc and Benkirane's membership freeze are well reported but not fetched here.
11. **2015 regional presidencies won by PJD** listed from memory in one position summary; reconcile with elections.json.
12. **Fuel crisis 2022.** Which opposition groups formally filed the inquiry request, and whether an "information mission" was formally rejected, is from memory (`low`). Competition Council settlement of 1.84 bn MAD (Nov 2023) is well documented but not fetched here.

## Gaps (positions not documented; do not invent)

- **france-recognises-autonomy-plan-2024**: no party-specific statements retrieved; `positions` left empty (consensus support is documented under autonomy-plan-2007 and unsc-resolution-2797-2025).
- **electoral-reform-2025-2026**: party-by-party votes on the 2025–26 organic-law amendments not retrieved; PJD marked `silent` (unknown), majority marked `support` at low/medium.
- **genz212-protests-2025**: USFP/MP/PPS/PAM positions rest largely on the movement's own scorecard of parties (kech24) and one round-up on releases (thepress.ma); no primary communiqués retrieved. Annahj, UC, MDS positions not found.
- **unsc-resolution-2797-2025**: Istiqlal/USFP positions rest on a Le Matin round-up headline; PPS, MP, UC, FGD statements not retrieved.
- **teachers-strikes-2023**: PJD position rests on one Le Matin headline (USFP+PJD "fustigent les incohérences").
- **al-haouz-earthquake-2023**: only PJD and government positions found; USFP recorded as `silent` per Le360's "où sont les partis ?".
- **drought-water-crisis** and **world-cup-2030**: party positions thinly sourced (think-tank pieces); treat as `low`.
- **press-freedom-pegasus-pardons**: party reactions to the July 2024 pardons not fetched; positions are `low`.
- Historical events: MDS, UC and MP positions are frequently absent because these parties either did not exist or left no documented stance; omitted rather than invented.
- **Ceuta crisis, August 2026**: a Morocco World News headline ("USFP leader Driss Lachgar says all political actors share responsibility for Ceuta crisis", Aug 2026) surfaced in results but could not be investigated; possibly a significant pre-electoral foreign-policy event — not included.
- **Cannabis, quotient, AMO, 51-17, blocage, Hirak, boycott**: all pre-2021 positions should be re-sourced with Moroccan press URLs when search budget allows.

## Count note

The task asked for 30–40 events; the enumerated list in the task exceeded 40, so all requested items were kept (51 events). Candidates for merging if a shorter file is wanted: pension-reform-2016 into fuel-subsidy-reform-2013-2015; hirak-jerada into hirak-rif; world-cup-2030 into genz212; france-recognises-autonomy-plan into unsc-resolution-2797; rni-leadership-change into legislative-campaign-2026.
