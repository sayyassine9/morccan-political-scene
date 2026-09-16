# Notes — parties-group2.json (USFP, PJD, MP, PPS)

Research date: 2026-09-16 (election of 23 Sept 2026 not yet held). ~40 WebSearch
queries were run (FR/AR/EN) before the session's shared WebSearch budget was
exhausted; a final batch of 16 verification queries could not be executed. Items
marked **[unverified]** below rest on Wikipedia/press recollection and are set to
`confidence: low/medium` in the JSON.

## Confirmed by 2+ independent sources
- USFP: Lachgar re-elected for a 4th term at the 12th congress, Bouznika 17-19 Oct
  2025 (Médias24, Le360, Le Matin, Hespress AR); statutes amended to allow a 4th
  term; 26 delegates voted against; 1,600 delegates approved the reports.
- USFP: UNFP founded 6 Sept 1959 (Kawakib cinema, Casablanca); split 30 July 1972;
  USFP name adopted at the extraordinary congress of Jan 1975 (usfp.ma, Tafra,
  LeBrief, fr.wikipedia).
- USFP: Youssoufi named PM 4 Feb 1998; 41-minister government 14 March 1998 with
  USFP 11 / Istiqlal 6 portfolios (Universalis, fr.wikipedia).
- PJD: Benkirane elected SG 30 Oct 2021 (1,112 votes = 81%; El Omari 231, Bouanou
  15) — TelQuel, MAP, Jeune Afrique. Re-elected 27 Apr 2025 at the 9th congress
  (994/1,402 = 69%; El Azami 394, Bouanou 42), mandate to 2029 — Hespress FR/AR,
  Le Matin, Le360.
- PJD: Benkirane I (3 Jan 2012): 31 portfolios, PJD 11 / PI 6 / MP 4 / PPS 4 /
  independents 5 (La Vie éco, fr.wikipedia). Benkirane II (10 Oct 2013): 39 members,
  PJD 12 / RNI 8 / MP 6 / PPS 5 (fr.wikipedia, Agence Ecofin).
- PJD: El Othmani signed the normalisation declaration 22 Dec 2020; 48 PJD deputies
  voted against the cannabis bill on 26 May 2021 (Médias24, Le360, MEE, Bladi).
- PJD: 13 seats in 2021 (Médias24/Interior); 3 councillor seats it disowned
  (Médias24, Le360).
- MP: founded 1957 (organised 1956-57), leaders arrested Apr 1958, legalised Feb
  1959 (encyclopedia.com); 1967 MPCD split; MNP founded July 1991; MP+MNP+UD
  reunification 24 March 2006 (fr.wikipedia MNP, Aujourd'hui le Maroc); Ouzzine
  elected unanimously 26 Nov 2022 at the 14th congress (Asharq Al-Awsat, SNRT, MAP,
  Alyaoum24); still SG in Sept 2026 (alharaka.ma).
- MP: 28 seats / 7.05% in 2021; in opposition 2021-2026 (fr.wikipedia, alharaka.ma,
  Jeune Afrique).
- PPS: PCM 1943 → PLS 1968 → PPS 1974 under Ali Yata; Yata died Aug 1997 and
  Ismaïl Alaoui succeeded him (fr/en.wikipedia, maroc-realites, Jeune Afrique).
- PPS: left government 1 Oct 2019 by unanimous Political Bureau vote (Jeune
  Afrique, Le Matin, Le360). 11th congress Nov 2022: Benabdallah 4th term, 415/432
  central-committee votes, 1,125/1,474 delegate signatures (MAP, Yabiladi, Elaph).
- PPS: 22 seats in 2021 (Médias24, Le360).
- House of Councillors 2021 (5 Oct 2021): RNI 27, PAM 19, PI 17, MP 12, USFP 8,
  PJD 3, UC 2, others 3 (1 each), 1 non-affiliated (Médias24, L'Economiste).
- Women MPs 2021 (Le360): USFP 11, PPS 10 regional + 1 local = 11, PJD 9, MP 8.
- Governments: Jettou II (2004) USFP 7 / PI 7 / RNI 5 / MP 3 / MNP 2 / PPS 1 (La
  Vie éco); El Fassi (2007) PI 9 / RNI 7 / USFP 5 / PPS 2, MP in opposition
  (fr.wikipedia). El Othmani I coalition agreed 25 Mar 2017, sworn in 5 Apr 2017,
  240 seats (TelQuel, fr.wikipedia); El Othmani II 9 Oct 2019, 23 ministers + SGG,
  PPS out (fr.wikipedia, Jeune Afrique).
- Cour des comptes (2021 accounts, synthesis PDF, March 2023): restitution due —
  PJD 5,785,122.26 MAD (incl. 2,893,000 in 2021-22); MP 1,772,173.99; PPS
  409,829.26; USFP 0. 2020: PJD financed 49% by the State; USFP and MP each got
  50,000 MAD women-representation support (TelQuel Dec 2021). 2022: USFP received
  100,813.20 MAD women-representation support. 2023 (report of 27 May 2025): total
  declared resources USFP 6.18 MDH, PJD 4.98, PPS 4.80, MP 3.24 (EcoActu, Le360);
  PJD's 634,066.64 MAD of public-support spending judged valid (Le360).

## Discrepancies recorded
1. **Cour des comptes 2023 figures are total declared resources** (state support +
   own resources), not state support alone. `public_funding_mad.amount` is therefore
   left `null` and the totals are stored under `metrics.custom`. Per-party state
   support amounts are inside the full PDF reports (courdescomptes.ma) which could
   not be opened (WebFetch blocked). Gap to fill: state-support-only series
   2017-2024 per party.
2. **2021 communal seats**: Le Matin's election-night figures (PAM 6,015; PI 5,292;
   RNI 4,112; USFP 3,226; MP 2,213; PJD 1,513; UC 1,307; PPS 1,102) are provisional
   and inconsistent with the final Interior figures used in the project schema
   example (RNI 9,995). The JSON uses recollected final Interior figures **[unverified]**:
   USFP 2,415; MP 2,110; PPS 1,432; PJD 777. Must be re-checked against the
   Ministry of Interior / Médias24 final tables.
3. **2015 communal seats**: PAM 6,655 / PI 5,106 / PJD 5,021 / RNI 4,408 / MP 3,007
   confirmed (AA, Aujourd'hui le Maroc). USFP 2,656 / PPS 1,766 **[unverified]**.
4. **2015 House of Councillors**: PI 24, PAM 23, PJD 12 confirmed (fr.wikipedia).
   USFP 5, MP 7, PPS 4 **[unverified]**. Note: one search summary returned the 2021
   breakdown (RNI 27...) when asked for 2015 — ignored.
5. **PJD 2016 seats**: one search summary said "107 seats in 2016"; 107 is the 2011
   figure, 2016 = 125 (TelQuel, en.wikipedia). JSON uses 125.
6. **PPS/Benabdallah dismissal**: a search summary said he was "dismissed in
   October 2010 as Housing minister over Rif contestation". Wrong conflation: he was
   elected SG in May 2010 and dismissed as Housing minister on 24 Oct 2017 in the
   Al Hoceima programme sanctions. JSON records 2017.
7. **Aherdane's removal from the MP**: encyclopedia.com says expelled 1985;
   fr.wikipedia (MNP) says removed 1986. JSON uses 1986 with note.
8. **Ali Yata's death**: en.wikipedia 12 Aug 1997; other sources 13 Aug 1997.
9. **USFP founding date**: party gives Jan 1975 extraordinary congress (10-12 Jan);
   JSON uses 1975-01-12 (closing day) — exact day **[unverified]**.
10. **PJD 'founded'**: JSON uses the 1967 MPCD creation (legal continuity); the PJD
    name dates from 1998 (month unverified; often given as the Oct 1998 congress).
11. **MP founding day**: 1957 is agreed; the day (5 Oct, party anniversary) is
    **[unverified]**; legalisation Feb 1959 is confirmed.
12. **Women MPs PJD 2021**: Le360 says 9 of the PJD's "12 deputies who sit" are women
    although 13 were elected; recorded as 9.
13. **PPS councillors 2021**: Médias24 lists "other parties 3 (1 each)" without
    naming them; PPS value left null.

## Gaps (not found before budget ran out)
- Per-party minister counts for Youssoufi II (2000), Jettou I (2002), El Othmani I
  (USFP/MP/PPS/PJD exact counts — JSON uses recollected 2/3/3/12 **[unverified]**)
  and El Othmani II (left null except USFP 1 **[unverified]**).
- Membership claims: no headline figures for any of the four parties surfaced;
  all `membership_claims.claimed` are null (delegate counts recorded instead).
- Regional council seats 2015/2021 per party: USFP 48 / UC 27 / PPS 23 (2015)
  confirmed by search; PJD 174, MP 62 (2015) and all 2021 values (USFP 47, MP 41,
  PPS 28, PJD 18) **[unverified]**.
- 2015 regional presidencies: PAM 5 confirmed; PJD 2 (Rabat-Salé-Kénitra, Drâa-
  Tafilalet) and MP 1 (Fès-Meknès, Laenser) **[unverified]** but widely reported.
- Historical House of Representatives seat series pre-2021 (USFP 57/50/38/39/20;
  PJD 9/42/46/107; MP 40/27/41/32/27; PPS 9/11/17/18/12) are standard Wikipedia
  figures **[unverified by this session]**.
- Women MPs for 2011/2016 per party: not searched.
- Exact dates of USFP congresses 1992/2003/2008 and PPS 8th congress (May 2010):
  approximate (month-level) in JSON.
- Party colours are approximations; international affiliations: USFP (Socialist
  International, Progressive Alliance) from background knowledge, not re-verified;
  PJD/MP/PPS recorded as none.
