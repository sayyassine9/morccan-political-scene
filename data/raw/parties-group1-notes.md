# Notes — parties-group1.json (RNI, PAM, Istiqlal)

Research date: 2026-09-16 (general election of 23 Sept 2026 not yet held).
Method: WebSearch only. About 45 queries (FR/AR/EN) were run before the
session's shared WebSearch budget was exhausted; ~20 planned cross-check
queries could not be run. Items that rest on general knowledge rather than a
URL retrieved in this session are flagged "GK" below and in the JSON.

## Discrepancies found (recorded verbatim)

| Item | Source A | Source B | Chosen |
|---|---|---|---|
| RNI founding date | fr.wikipedia: 6 October 1978 | ar.wikipedia (via search summary): 28 November 1978 (founding congress) | 1978-10-06, both noted |
| RNI 2026 president spelling | Médias24: "Mohamed Chaouki" | Maroc Hebdo / Yabiladi / New Arab: "Mohamed Chouki" | Chouki, variant noted |
| PAM: El Omari end of tenure | TelQuel/MWN/Africanews: resigned 7 Aug 2017; Habib Belkouch interim | en.wikipedia (Ilyas El Omari): SG until 27 May 2018 | 2017-08-07 with Belkouch interim row |
| PAM communal seats 2021 | Challenge.ma (Interior provisional): 6,210 | task brief figure: 6,208 | 6,210 |
| Istiqlal communal seats 2021 | Challenge.ma: 5,600 | task brief figure: 5,603 | 5,600 |
| PAM Councillors 2021 | Médias24/Wikipedia: 19 | task brief hint: 17 (that is Istiqlal's figure) | 19 |
| Allal El Fassi death | Hespress search summary: 1972 | en.wikipedia, Jeune Afrique: 13 May 1974 | 1974 |
| Istiqlal founding | Encyclopedia.com / en.wikipedia: 1943 | party tradition / TAFRA: 11 Jan 1944 Manifesto | 1943-12-10 (day is GK) |
| Cour des comptes totals | Search summaries for the 2021 and 2023 reports both returned "60.48 MDH total support, 99.21% management costs" — probably the 2021 figure mis-attached to 2023 by the search engine | Ecoactu: 2023 support down 25.5% vs 2022 | 60.48 MDH used only for 2021 (RNI share 17.65% -> 10.675 MDH computed) |
| Le360 "Quel parti coûte le plus" figures (PJD 15.8, PAM 12.6, PI 6.32, RNI 5.4 MDH) | Article year not shown in results | Médias24 gives RNI 5.4 MDH for 2017 and 2018 | Assigned to 2018; year uncertain |
| Akhannouch government size | Le Desk / Infomédiaire: 24 ministers, 18 partisan (7 RNI + PM, 7 PAM, 4 PI, 6 SAP) | Le360 pre-appointment: "24 to 27" | 24 |

## Verified with 2+ sources (high confidence)
- RNI leaders 2007/2010/2016/2026 transitions; Akhannouch 11 Jan 2026 announcement; Chouki elected 7 Feb 2026 (El Jadida).
- PAM founding 7 Aug 2008 and 5-party merger; congresses Feb 2009, Feb 2012, Feb 2020, Feb 2024 (collegial leadership Mansouri/Bensaid/Abou El Ghali).
- Istiqlal: Chabat elected 23 Sept 2012 (478-458); 9 July 2013 withdrawal (5 of 6 ministers, El Ouafa stayed); Baraka re-elected 28 April 2024.
- 2015 communal seats (PAM 6,655 / PI 5,106 / RNI 4,408); 2015 regional presidencies (PAM 5, PI 2, RNI 2); 2015 Councillors (PI 24, PAM 23, RNI 8).
- 2021: HoR seats (RNI 102, PAM 87, PI 81); Councillors (27/19/17); regional presidencies 4/4/4 with names; communal (9,995 / 6,210 / 5,600).
- 2016-17 "blocage", 2018 boycott, Nov 2023 Competition Council settlement (1.84 bn MAD), GenZ 212 (27 Sept 2025 onward; resignation call 2-3 Oct 2025), Escobar du Sahara (Bioui 12 yrs, Naciri 10 yrs).

## Items from general knowledge (GK) — need a source in a later pass
- RNI: 1981 PND split; participation in 1979-1998 governments; 1998 Youssoufi and 2007 El Fassi entry; HoR seats 2002 (41), 2007 (39), 2011 (52); Akhannouch election date 29 Oct 2016 (schema example + Jeune Afrique 2016 headline only); Liberal International membership; RNI colour hex.
- PAM: Benaddi's exact dates; 2009 communal figures (~6,000 seats); El Himma's 2011 departure; 2011 seats (47); Benchamach's 13 Oct 2015 election as Councillors president; law 43.22 dates; Socialist International status (left blank); colour hex.
- Istiqlal: founding day (10 Dec 1943); Balafrej 1944-1960 and Allal El Fassi 1960 SG dates (month approximate); Boucetta Feb 1998 resignation month; 1992 Koutla; Baraka's 7 Oct 2017 election date; 2002 seats (48); Benkirane I entry date; website/colour; Rachidi & Kayouh 2024 portfolios.
- Dates of Akhannouch II reshuffle (23 Oct 2024) taken from memory; Médias24 article dated 25 Oct 2024 confirms the reshuffle occurred that week.

## Gaps (not retrieved — search budget exhausted)
1. Public funding per party per year for 2019, 2020, 2022, 2023 (Cour des comptes reports exist: courdescomptes.ma synthesis PDFs 2018, 2020, 2021, 2022, 2023). Only: RNI 2016-2018 (Médias24), all three for "2018" (Le360, year uncertain), RNI 2021 computed from its 17.65% share. Totals declared as *resources* (not subsidy) are in `custom`.
2. Ministers per party in Akhannouch II (Oct 2024), El Othmani II (2019), and all pre-2012 governments.
3. Membership claims: no figure found for any of the three parties; `membership_claims` left empty. The only related datum is the RNI's 4,000-member internal survey (La Vie Éco) and its cotisations series.
4. Women MPs: 2021 only, derived as regional-list women (RNI 16, PAM 13, PI 13) + local-constituency women (PAM 4, PI 1, RNI 0); 2016 and 2011 not retrieved.
5. Transhumance (MPs defecting to/from each party before 2021 and 2026): no figures retrieved.
6. Legislative seat counts 2002/2007/2011 for RNI and PAM 2011: GK only (Istiqlal 2007/2011/2016/2021 sourced via Sénat.fr and L'Opinion).
7. Party positions on the 2025 GenZ protests (PAM/Istiqlal statements) not retrieved.
8. Exact dates: PAM lawyers'-exam scandal (assigned 2022-12), triumvirate dispute (assigned 2025), Escobar sentencing (Hespress EN article, date not shown), PAM 2026 programme launch.
9. International affiliations: only Istiqlal's (CDI, IDU) confirmed via en.wikipedia.

## Source-quality remarks
- L'Opinion is the Istiqlal's own newspaper; its 2021 seat figures match Médias24/Wikipedia.
- pam.ma and rni.ma pages were surfaced by search but used only for HQ/website facts.
- Search-engine summaries occasionally merged facts across articles (see Cour des comptes row); figures were kept only where the summary attached a clear source.

## Cross-check against sibling files (added after writing)
- `data/raw/elections.json` gives RNI 2002=41, 2007=39, 2011=52 and PAM 2011=47,
  Istiqlal 2002=48 — identical to the GK figures above, so those are now
  medium confidence. Earlier series (RNI 1984=61, 1993=41, 1997=46; Istiqlal
  1963=41, 1970=8, 1977=51, 1984=41, 1993=52, 1997=32) were copied from that
  file into `metrics.custom` with a reference to it.
- `data/raw/governments.json` lists Istiqlal in the Osman government from 1977
  and RNI in Osman/Bouabid/Lamrani/Laraki/Filali cabinets, consistent with the
  timeline; it does not split Akhannouch I / II (Oct 2024 reshuffle), whereas
  parties-group1.json does. Reconcile when merging.
