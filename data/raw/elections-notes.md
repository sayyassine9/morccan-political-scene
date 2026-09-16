# elections.json — research notes

Built 2026-09-16 from WebSearch result summaries only (WebFetch/curl blocked). The
session's WebSearch budget (200 calls, shared) ran out before every gap could be
closed; figures that came only from memory of the Wikipedia/IPU tables are marked
`confidence: "low"` inside the JSON and listed under "Gaps" below.

## Slugs created for historical / non-schema actors

| slug | Full name (FR) | Note |
|---|---|---|
| `fdic` | Front pour la défense des institutions constitutionnelles | 1963 palace front (Guedira) |
| `unfp` | Union nationale des forces populaires | 1959 Istiqlal split; USFP precursor |
| `pdc` | (label "PDC" in Wikipedia EN 1970 table) | identity unverified — possibly Parti démocratique constitutionnel |
| `mpdc` | Mouvement populaire démocratique et constitutionnel | Khatib; became PJD in 1998 (`pjd` used from 2002) |
| `pa` | Parti de l'action | |
| `umt` | Union marocaine du travail | union; seats via employees' college (1977) and House of Councillors |
| `pnd` | Parti national démocrate | RNI split, 1981 |
| `oadp` | Organisation de l'action démocratique populaire | precursor of GSU/PSU |
| `mnp` | Mouvement national populaire | Ahardane split from MP, 1991; reabsorbed 2006 |
| `pdi` | Parti démocratique de l'indépendance (Parti de la Choura et de l'Istiqlal) | already in schema list |
| `psd` | Parti socialiste démocratique | OADP split 1996; merged into USFP 2005 |
| `ud` | Union démocratique | Bouazza Ikken, 2001; merged into MP 2006 |
| `adl` | Alliance des libertés | Ali Belhaj, 2002 |
| `gsu` | Gauche socialiste unifiée | 2002; became PSU (`psu`) in 2005 |
| `pfc` | Parti des forces citoyennes | |
| `pt` | Parti travailliste | Benatiq, 2005 |
| `pre` | Parti du renouveau et de l'équité | |
| `pljs` | Parti de la liberté et de la justice sociale | |
| `pnd-al-ahd` | joint PND–Al Ahd lists, 2007 | Wikipedia EN lists 11 seats jointly plus 3 PND alone |
| `ind` | independents / sans appartenance politique (SAP) | |
| `other` | unresolved bundle of minor seats (1970, cons-2021) | see per-entry notes |
| `unions` | aggregate union seats (cons-2015) | per-union split not retrieved |
| `ugtm`, `cdt`, `untm`, `fdt`, `cgem` | Union générale des travailleurs du Maroc; Confédération démocratique du travail; Union nationale du travail au Maroc; Fédération démocratique du travail; Confédération générale des entreprises du Maroc | House of Councillors colleges |
| `yes` / `no` | referendum options | ref-2011 |

Schema slugs used as-is: `rni pam istiqlal usfp mp pps uc pjd mds fgd psu cni al-ahd prv
pedd ffd pud pgvm pdi prd pml`.

## Unresolved discrepancies

- **leg-2021 turnout/votes.** Interior: 8,789,676 voters and 50.35% turnout; but
  8,789,676 / 17,983,490 registered = 48.9%. The project schema example cites
  8,998,585 votes cast, and 17,983,490 × 50.35% = 9,054,687. Basis of the official
  50.35% not established. Also RNI vote share: Wikipedia EN 27.69% vs schema
  example 24.67% (2,147,424 votes) — probably local-ballot vs regional-ballot
  denominators.
- **leg-2016 seats sum to 394**, not 395, across the eleven parties reported by
  Wikipedia EN / IPU / Interior. One seat unaccounted for.
- **leg-2016 turnout**: APCE/IPU 42.29% (6,640,626 of 15,702,592) vs Interior's
  rounded "43%".
- **leg-2011 turnout**: Interior/APCE 45.40% vs Wikipedia EN 45.50%. No official
  per-party vote totals were ever published (Wikipedia EN); PJD 27.08% comes from
  French secondary sources. Registered voters entered as 13.6 M (rounded, bladi/APCE).
- **leg-1993 Istiqlal**: Wikipedia total 52; Encyclopedia.com says 43 direct + 8
  indirect = 51.
- **leg-1984**: Wikipedia EN says 199 direct seats; other accounts 204 (incl. 5
  constituencies for Moroccans abroad) — 204 + 102 = 306 is consistent with the
  seat total. Istiqlal 41 (Wikipedia) vs 43 (one search summary).
- **leg-1977 USFP**: total 15 (Wikipedia EN) vs 16 direct seats cited elsewhere.
- **leg-1970**: Wikipedia EN table labels 10 seats "PPS", anachronistic (PPS founded
  1974); FR summary calls them "social progress / salaried workers". Recorded as
  `other`, low confidence.
- **ref-2011 turnout**: 73.46% (provisional, 2 July, Wikipedia EN table) vs 75.50%
  (final announced 17 July, Wikipedia FR). Yes share 98.49% vs 98.50%.
- **com-2009 total seats**: 27,795 (Wikipedia FR) vs 27,006 (one bladi.net item).
- **com-2015 turnout**: 53.67% final (Interior via aujourdhui.ma) vs 52.36%
  provisional vs "53%" rounded.
- **com-2021 PAM/Istiqlal**: 6,208 / 5,603 (Wikipedia FR) vs 6,210 / 5,600 (ecoactu).
- **leg-2026 electorate**: 15,801,162 (lists closed 31 July 2026; Belpresse, Lebrief)
  vs "approximately 16.5 million" provisional figure attributed to Laftit (Morocco
  World News, Aug 2026). Number of contesting parties: 27 (most outlets) vs "28
  formations" (one MWN item).

## Gaps (not retrieved — search budget exhausted)

- Registered voters / votes cast for 1963, 1970, 1977, 1984, 1993, 1997 (IPU archive
  PDFs and `archive.ipu.org/parline-e/reports/arc/2221_9x.htm` hold them).
- 2002 registered voters (14,041,100) and the 15 minor-party seats (GSU 3, PRD 3,
  PML 3, PFC 2, PED 2, PDI 2) are from memory — low confidence.
- 2007: ~22 seats of minor parties (MDS, PT, PED, ADL, PRD, PML, PS, independents)
  not resolved; MDS 9 / PT 5 / PED 5 from memory. Per-party absolute votes.
- 2016 and 2021 absolute vote counts per party (IPU Parline pages
  `MA-LC01-E20161007` / `MA-LC01-E20210908` and Médias24 27 Sep 2021 have them).
- Per-party direct vs indirect split for 1970, 1977, 1984, 1993 (only Istiqlal and
  USFP 1993 confirmed).
- Communal 2015/2021 and regional 2015/2021: seats for parties below the top 3–8;
  exact official seat totals (31,503 assumed for both years); vote counts.
- House of Councillors 2015: per-union split of the 20 union seats; 2021: names of
  the three parties with one seat each.
- 2026: no published polls found; Akhannouch's status within the RNI ("withdrawal
  from its leadership" per one report) unverified.
