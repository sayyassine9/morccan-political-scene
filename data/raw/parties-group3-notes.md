# parties-group3 — research notes (2026-09-16)

Companion to `data/raw/parties-group3.json` (32 Party objects: UC, MDS, FGD, PSU,
PADS, CNI, Annahj, Al Ahd, PUD, FFD, 19 micro parties, and 3 historical entries).

## IMPORTANT caveat on verification depth

The session-wide WebSearch budget (200 calls, shared with sibling agents) was
exhausted after **22 queries** in this task (mix of Arabic and French). WebFetch
and curl to external sites are blocked (confirmed: proxy returns 403 CONNECT).
Consequently:

- Items backed by captured search results are marked `confidence: high/medium`
  and carry the URLs actually returned.
- Everything else comes from the researcher's background knowledge and is
  flagged **inside the JSON** with the sentence "From the researcher's
  background knowledge; the session's WebSearch budget was exhausted…" and
  `confidence: low` (or `medium` for well-established history such as the UNFP).
  These entries cite the generic registries (Wikipedia fr/ar list pages, Tafra
  encyclopaedia, maroc.ma annuaire) that were returned by search but whose
  content was not read. **They must be re-verified before publication.**
- The brief's "two queries per party" rule was met for UC, MDS, FGD, PSU,
  Annahj, Al Ahd and PUD only. FFD and PML have one captured source each for
  2026 list counts; all other micro parties have none beyond registry listings.

## Official 2026 contesting-parties list — what was found

Two different official-sounding figures circulate and both are correct for
their date:

| Figure | Date / stage | Source |
|---|---|---|
| **27 parties**, 702 lists filed electronically by 14:00 on Mon 31 Aug 2026 (first half-day of filing) | Interior Ministry communiqué relayed by MAP | Le360, La Vie Éco, Aujourd'hui le Maroc, Yabiladi, maroc.ma |
| **27 parties** "associated with the audiovisual campaign dispositif", campaign 10–22 Sept | Le Matin / Linformation (10 Sept 2026) | lematin.ma/nation/…/364364, linformation.ma/…/65586 |
| **28 political bodies plus alliances formed for the election**; final tally 7,288 candidacies on 1,850 lists (1,615 local lists / 5,505 candidates; 235 regional lists / 1,783 candidates); women 36.47 % of candidates; 227 sitting MPs re-standing; only 5 parties cover all 92 local constituencies | Interior Ministry final tally (≈10 Sept 2026) | al3omk.com/1186736, al3omk.com/1186744, 20minutes.ma/politique/171437, alalam.ma (a34862), fr.hespress.com/487958, maroc.ma "1.850 listes" |
| 27 parties, 1,848 lists, 4 parties covering all constituencies | italiatelegraph.com/news-175822 (secondary, slightly different numbers) | — |

**Discrepancy:** 27 vs 28. Most likely explanation: the 28th "political body" is
the *Alliance de la gauche* (PSU + FGD joint lists) or the *Coalition populaire*
(MP + PML + PND) being counted separately, or one party filed only after 31 Aug.
Not resolved. Recorded as-is.

**Named parties with captured 2026 list counts** (Interior tally via 20minutes /
al3omk / Le Brief):

| Party | Local lists (candidates) | Regional lists (candidates) |
|---|---|---|
| PAM, Istiqlal, PPS, PJD | 92 each (all constituencies) | — |
| RNI | 92 | 11 |
| USFP | 90 (301) | 11 (87) |
| MP | 86 | 12 |
| **UC** | 74 (256) | 12 (90) |
| **FFD** | 68 (238) | 8 (67) |
| **MDS** | 68 (234) | 10 (80) |
| **PML (Parti marocain libéral)** | 51 | 9 |
| **Al Ahd Addimocrati** | 1 (3 candidates) | 0 |
| **PSU + FGD** ("Alliance de la gauche", joint symbol candle + letter, announced 3 June 2026) | not captured | not captured |

**The complete list of the 28 names was NOT captured** — the search summaries
only quoted the larger parties. The gap must be filled by reading
al3omk.com/1186744 or 20minutes.ma/politique/171437 directly.

Alliances reported for 2026:
- *Alliance de la gauche / تحالف اليسار*: PSU + FGD party (Hespress, Belpresse, Assahifa, fgd.ma, yassar.ma).
- *Coalition populaire / الائتلاف الشعبي*: Mouvement populaire + Parti marocain libéral + "الحزب الديمقراطي الوطني" (Al Jazeera net, 22 June 2026).

Boycotting: **Annahj Addimocrati Al Oummali** (Central Committee decision 27–28
June 2026; boycott campaign launched September, with reported bans and brief
detentions — tanwer.ma 14 Sept 2026, alhayatalyaoumia.ma, ahewar.org aid=924152).
Al Adl wal Ihsane (not a party) also boycotts, as in 2015/2016/2021.

## Key verified findings (with 2+ sources)

- **UC**: founded 1983 by Maati Bouabid; 1st in 1984 (83/306) and 1993 (54/333);
  leaders Bouabid → (Semlali, unverified) → Abied 2001–2015 → Sajid Apr 2015–Oct 2022
  → **Mohamed Joudar** (6th congress, Casablanca, Oct 2022, elected unopposed after
  Abyaba, Belassal and Bensaidi withdrew). Sources: fr/en Wikipedia, Tafra, Le360
  (267903, 267938), Le Desk, Le Matin, MAP, Aujourd'hui le Maroc, maroc.ma.
- **MDS**: Abdessamad Archane SG, re-elected at 4th congress (Rabat, 13–14 Apr
  2018) and 5th congress (Salé, date not captured). 2026 programme: youth
  employment, rural development (Hespress 1803176, aljareeda).
- **FGD**: alliance since 2014; became a **single party in late 2022** when PADS,
  CNI and "Gauche unitaire" (+ Alternative progressiste) dissolved into it;
  PSU stayed out; 48-member political bureau; top officer's identity described as
  unclear (Al Aoual 333801, 333629; Hespress 1094576; Al Arab; Al Araby; Alyaoum24
  1910536 on PADS dissent). → **PADS and CNI are recorded as `merged`.**
- **PSU**: Jamal El Asri SG since 5 Nov 2023 (5th congress 20–22 Oct 2023);
  Mounib (2012–2023) now deputy SG. Sources: al3omk 885294, ar.le360, Hespress 1261210.
- **Annahj**: renamed "النهج الديمقراطي العمالي" at 5th congress 2022; Jamal Braja
  succeeded Mustapha Brahma; boycotts 2015, 2016, 2021, 2026 each sourced.
- **Al Ahd**: founded March 2002, 5/325 seats 2002, Najib El Ouazzani (b. 1955,
  Nador); 2026: 1 list / 3 candidates; SG runs under another party's colours (Assahifa).
- **PUD**: Ahmed Fitri, Istiqlal split, recognised 2 Jan 2009 (ar.wikipedia, pud.ma).

## Unresolved discrepancies / gaps

1. **27 vs 28 parties** (see above).
2. **FGD party leadership**: no name established. Al Aoual reported "ambiguity
   about the leader of the phase" at the 2022 congress. Needs a query such as
   «فيدرالية اليسار الديمقراطي المنسق الوطني».
3. **FGD status**: recorded `extra-parliamentary` on the reasoning that its 2021
   seat was held by PSU member Nabila Mounib and the PSU did not join the merger.
   If the 2021 FGD MP was someone else, change to `parliamentary`.
4. **FFD**: founding 1997 by Thami El Khyari, government participation 1998,
   Khyari's death (2016) and Mustapha Benali's tenure start are unverified.
5. **UC 1996–2001 leadership** (Abdellatif Semlali) and **UC headquarters** unverified (HQ left `null`).
6. **Parti socialiste (`ps`)**: founder attribution to Abdelmajid Bouzoubaa and
   founding year 2006 are weakly remembered — verify or drop.
7. **PND vs "Parti démocratique national"**: treated as the same party
   (الحزب الوطني الديمقراطي). Al Jazeera's wording "الحزب الديمقراطي الوطني" is
   close but not identical; confirm.
8. **PEDD**: relationship between the 2002 "Parti de l'environnement et du
   développement" (merged into PAM 2008) and the current PEDD unverified.
9. **pgvm vs pvm**: Tafra has a separate "Parti des Verts Marocains" page
   (partis.tafra.ma/partis/pvm); the `pvm` entry is a stub with no data.
10. **Duplicates in the task list**: "Parti de la renaissance et de la vertu" =
    "Annahda wal Fadila" (one entry `prv`); "Parti de l'espoir" = "Parti Al Amal"
    (one entry `al-amal`); "Parti al Wahda wa Addimocratia" = PUD; "Parti de
    l'équité" taken as Parti du renouveau et de l'équité (`pre`).
11. **`pld` (Parti libéral démocrate)**: existence not confirmed; omitted.
12. **`ps-um`**: could not identify what this ID refers to; omitted.
13. **Micro parties with no data beyond a name**: `pvm`, `ennahda`, `pcd`
    (no leader), `pljs`, `neo-democrates`, `al-amal`, `psd`, `pa`, `pcs`, `prd`,
    `prv`, `pedd`, `pgvm`, `pt` (all background knowledge, `confidence: low`).
14. **Public funding**: no Cour des comptes / Interior figures captured for any
    party in this group; `public_funding_mad` left empty everywhere.
15. **Councillors / regional / communal seats**: not captured; arrays empty.
16. **Seat histories** deliberately not duplicated (belong in elections.json);
    where a timeline entry mentions a seat count it is flagged as unverified.
17. Not covered at all (potentially registered): Parti de l'union marocaine pour
    la démocratie, Alliance des libertés (merged into PAM), Initiative citoyenne
    pour le développement (merged), Forces citoyennes, Parti démocratique et
    social, Parti de la justice et du développement rural etc. Check the
    maroc.ma annuaire / Tafra list to close the registry to ~35.

## Suggested follow-up queries (when budget is available)

- «28 حزبا 23 شتنبر لائحة الأحزاب المشاركة أسماء» (al3omk 1186744 full text)
- «فيدرالية اليسار الديمقراطي المنسق الوطني 2025»
- «جبهة القوى الديمقراطية مصطفى بنعلي مؤتمر» / «Front des forces démocratiques Benali congrès»
- «الحزب الاشتراكي المغربي الأمين العام» / «Parti socialiste Maroc secrétaire général»
- «الحزب الوطني الديمقراطي الائتلاف الشعبي 2026»
- «تمويل الأحزاب المجلس الأعلى للحسابات 2024 الاتحاد الدستوري الحركة الديمقراطية الاجتماعية»
- Tafra pages: partis.tafra.ma/partis/{uc,mds,ffd,psu,fgd,pads,cni,pvm,pt,…}
