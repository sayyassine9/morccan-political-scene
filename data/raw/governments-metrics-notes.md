# Notes: governments.json and metrics.json (compiled 2026-09-16)

## Method and limitation

- Only WebSearch was usable; WebFetch/curl are blocked. The session-wide search budget (200
  calls, shared with other agents) ran out after **16 successful queries** for this task, so
  the second and third rounds of cross-checking never ran.
- Everything not confirmed by a search result this session is flagged
  `"unverified_prior_knowledge": true` and/or `"confidence": "low"` in the JSON and listed
  below as a gap. Nothing was invented to fill a slot: where no figure could be sourced the
  value is `null` with a note.
- `data/raw/elections.json` (written by a sibling agent, with its own sources) was used to
  corroborate seat arithmetic. Where it disagrees with what this task's sources said, both
  values are recorded.

## governments.json

27 entries, Bekkai I (7 Dec 1955) to Akhannouch (7 Oct 2021, in office). Reshuffles that
changed the coalition (Benkirane II, El Othmani II) are separate entries; the Oct 2024
Akhannouch reshuffle is kept inside the Akhannouch entry because the coalition did not change.

Cross-checked with two or more sources (MAP chronology, en.wikipedia list, Médias24/SNRT):
Bekkai start date, Balafrej, Ibrahim, Bahnini, Benhima/Laraki, Lamrani 1971, Osman 1972,
Bouabid 1979, Lamrani 1983, Akhannouch 2021 (270-seat majority).

Discrepancies:
- Médias24's "19 Premiers ministres" summary gives Bekkai "Dec 1955 - March 1956" and Balafrej
  "March 1956 - Dec 1958"; MAP and en.wikipedia give Bekkai until 12 May 1958 and Balafrej
  12 May - 16 Dec 1958. The latter is retained (Balafrej was foreign minister before May 1958).
- Ibrahim's end: 20 May 1960 (en.wikipedia, MAP) vs "March 1960" (Médias24). May 1960 retained.
- Lamrani 1971-72 end: "2 Nov 1972" (SNRT/Médias24) vs Osman appointed 20 Nov 1972 (MAP,
  en.wikipedia). 20 Nov retained.
- Lamrani 1983-86: Médias24 lists "Nov 1983 - Apr 1985" (first of two cabinets) while MAP
  numbers a 20th government on 11 Apr 1985; the entry covers both cabinets to 30 Sept 1986.
- Mohammed V as head of government: 20 May 1960 (en.wikipedia) vs 26 May 1960 (cabinet, MAP).

Gaps (prior knowledge, need verification):
- Exact reshuffle days: Youssoufi II (6 Sept 2000), Jettou II (8 June 2004), El Fassi
  (4 Jan 2010), El Othmani II (9 Oct 2019), Akhannouch reshuffle (23 Oct 2024).
- Coalition composition of pre-1998 cabinets (Osman 1977, Bouabid, Lamrani 1985, A. Laraki,
  Filali II) and the date the MP entered the Abbas El Fassi majority.
- `seats_support` for pre-1998 governments left null.
- Benkirane's failed 2016-17 formation ("blocage") and Istiqlal's July 2013 withdrawal are
  described from prior knowledge.

## metrics.json

### 1. public_funding_mad
Retrieved (Cour des comptes reports and press summaries):
- 2023: budget 140 MDH; 60.38 MDH actually granted to 17 parties (43%); +100,813.20 MAD
  women-representation support to one party; total party resources 104.97 MDH (state 58%);
  -25.5% vs 2022.
- 2022: 81.17 MDH granted (derived from the 2023 report's comparison); 18.28 MDH restituted.
- 2021: total resources 499.69 MDH (campaign contribution 348.29, own 92.60, annual support
  ~58.8 derived); 29/34 parties filed; 15 parties had 5.14 MDH of insufficiently justified
  expenses; RNI restituted 13.38 MDH by end-2022; 14 parties owed 21.85 MDH.
- 2020: state-financing shares PAM 81%, PJD 49%, Istiqlal 47%, RNI 22%; 195,000 MAD
  women-representation support; restitutions 7.09 MDH.
- 2019: restitutions 5.06 MDH (nine parties); resource shares PJD 29.43%, RNI 28.82%,
  PAM 14.9%, Istiqlal 9.24% (year attribution per LesEco/Le360 snippets - verify).
Discrepancy: restitutions in 2021 = 7.68 MDH (2021 report) vs 7.34 MDH (2020-report summary).
Gap: **per-party annual amounts in MAD for every year are null** - they sit in the report
annexes (courdescomptes.ma PDFs) which could not be fetched. Names of parties that failed to
justify spending were not in the snippets. 2016-2018 totals not captured.

### 2. regional_presidencies
2021: all 12 presidents and parties verified by four concurring sources (RNI 4, PAM 4, PI 4).
2015: distribution (PAM 5, PJD 2, RNI 2, PI 2, MP 1) verified; presidents of Casablanca-Settat,
TTA, Marrakech-Safi, Béni Mellal-Khénifra, Drâa-Tafilalet, Souss-Massa, Fès-Meknès verified;
Oriental (Bioui), Rabat-Salé-Kénitra (Sekkal), Guelmim (Ben Bouaida, replaced by Mbarka
Bouaida in 2019), Laâyoune (Ould Errachid), Dakhla (Yanja) are prior knowledge for the names.
Mid-term changes 2015-2021 (Guelmim 2019; others) not researched.

### 3. house_of_councillors_seats
2021 verified (Wikipedia, Médias24, L'Economiste, La Relève): RNI 27, PAM 19, PI 17, MP 12,
USFP 8, PJD 3, UC 2, others 3 (1 each, not named), 1 non-affiliated, 28 union/CGEM.
2015: single official source (Maroc.ma): PI 24, PAM 23, PJD 12, MP 10, RNI 8, USFP 5, UC 3,
MDS 3, PPS 2, Al Ahd 1, PRD 1, non-affiliated 8 (+20 union seats). Corroborated by
elections.json. Which parties hold the three "other" 2021 seats is unresolved.

### 4. communal_council_seats and mayors
2021: RNI 9,995; PAM 6,210; PI 5,600; USFP 2,415; MP 2,253 (Le Matin/Wikipedia); PJD 777
(elections.json). Discrepancy: elections.json has PAM 6,208 and PI 5,603. Votes per party not
captured. 2015: PAM 6,655; PI 5,106; PJD 5,021; RNI 4,408; MP 3,007 (verified); USFP 2,656,
PPS 1,766, UC 1,489 (elections.json). Votes only as rounded press figures.
Mayors 2021: Casablanca (Rmili, RNI) and Marrakech (Mansouri, PAM) verified; Rabat (Rhlalou)
name verified, party from prior knowledge; Fès, Tanger, Agadir, Salé, Meknès, Oujda are
prior knowledge (low). Post-2021 changes (Rabat: El Moudni 2023; others) unverified.

### 5. membership_claims
No membership figure was retrieved. Only proxy: RNI's own resources (dues) made it 78%
self-financed in 2020 (Cour des comptes via TelQuel; Médias24 2020). No independent audit of
membership numbers exists for any party.

### 6. parliamentary_groups_2021
Seats won verified (RNI/PAM/PI/PJD by search; the rest via elections.json). Group names and
start-of-legislature sizes (UC+MDS joint group of 23; PJD as a "groupement") are prior
knowledge. **Latest group sizes (2025-26) not captured**; sources only describe the
resignation wave / "transhumance inversée" before the 2026 election, the June 2022
Constitutional Court invalidations and by-elections. Check chambredesrepresentants.ma.

### 7. women_mps_2021 / mps_under_40
Total 96 women (24.3%) is prior knowledge; per-party split null (Médias24's list of names by
party could be tallied). Under-40 counts: not found.

### 8. legislative_activity
Not found. No retrieved source quantifies bills or oral questions per group.

### 9. ministers_by_government
Party counts for Youssoufi I, Jettou I, El Fassi, Benkirane I/II, El Othmani I/II, Akhannouch
are prior knowledge (low), except Akhannouch's 24-member size and three-party composition.
Reshuffled cabinets (Youssoufi II, Jettou II, El Fassi 2010, Akhannouch 2024) not counted.
