/* Ntikhabat — data bank front-end (vanilla JS + Chart.js) */
(function () {
  'use strict';
  const D = window.DATA || { parties: [], elections: [], events: [], governments: [], meta: {} };
  const $ = (sel, root) => (root || document).querySelector(sel);
  const $$ = (sel, root) => Array.from((root || document).querySelectorAll(sel));
  const css = (name) => getComputedStyle(document.documentElement).getPropertyValue(name).trim();

  // ---------- theme ----------
  function initTheme() {
    try { const t = localStorage.getItem('theme'); if (t) document.documentElement.dataset.theme = t; } catch (e) {}
    const btn = $('#theme-toggle');
    if (btn) btn.addEventListener('click', () => {
      const cur = document.documentElement.dataset.theme || (matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
      const next = cur === 'dark' ? 'light' : 'dark';
      document.documentElement.dataset.theme = next;
      try { localStorage.setItem('theme', next); } catch (e) {}
      rerenderCharts();
    });
  }

  // ---------- data helpers ----------
  const partyById = {}; D.parties.forEach(p => partyById[p.id] = p);
  const mediaByParty = {}; (D.media || []).forEach(m => { (mediaByParty[m.party_id] = mediaByParty[m.party_id] || []).push(m); });
  const partyLogo = (id) => (mediaByParty[id] || []).find(m => m.kind === 'logo');
  // Portraits carry a person_name but no party_id in the source data (the link is only
  // implicit via a party's leadership list), so match on name across all media, not per-party.
  const portraitFor = (id, name) => (D.media || []).find(m => m.kind === 'portrait' && m.person_name === name);
  const mediaCredit = (m) => `<details class="sources" style="margin-top:4px"><summary>Image credit</summary><p class="small muted" style="margin:4px 0 0">${esc(m.title || '')}${m.credit ? ' · ' + esc(m.credit) : ''}${m.license ? ' · ' + esc(m.license) : ''}${m.restrictions ? ' · ' + esc(m.restrictions) : ''}</p>${m.source_page ? `<p class="small"><a href="${esc(m.source_page)}" target="_blank" rel="noopener">Source</a></p>` : ''}</details>`;
  const legs = D.elections.filter(e => e.type === 'legislative' && e.results && e.results.length).sort((a, b) => a.date.localeCompare(b.date));
  const latestLeg = legs[legs.length - 1];
  const LABELS = D.labels || {};
  const partyName = (id) => (partyById[id] && (partyById[id].abbr || partyById[id].names.fr)) || LABELS[id] || (id === 'other' ? 'Other' : id === 'independents' ? 'Independents' : id);
  const partyFull = (id) => (partyById[id] && partyById[id].names.fr) || partyName(id);
  const partyLabel = (id) => partyById[id] ? partyLink(id) : `<span class="badge-party"><span class="swatch" style="background:${partyColor(id)}"></span>${esc(partyName(id))}</span>`;
  // Fixed categorical slot per party (colour follows the entity, never rank). Top 8 by 2021 seats.
  const SLOT = { rni: 1, pam: 2, istiqlal: 3, usfp: 4, mp: 5, pps: 6, uc: 7, pjd: 8 };
  const partyColor = (id) => SLOT[id] ? css('--s' + SLOT[id]) : css('--gray-series');
  const isMajor = (id) => !!SLOT[id];
  const fmt = (n) => (n == null || isNaN(n)) ? '—' : Number(n).toLocaleString('en-US');
  const fmtPct = (n) => (n == null || isNaN(n)) ? '—' : Number(n).toFixed(1) + '%';
  const fmtMAD = (n) => (n == null) ? '—' : (n >= 1e6 ? (n / 1e6).toFixed(1) + ' M MAD' : fmt(n) + ' MAD');
  const esc = (s) => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const qs = (k) => new URLSearchParams(location.search).get(k);
  const confChip = (c) => c ? `<span class="conf ${esc(c)}" title="Confidence: ${esc(c)}">${esc(c)}</span>` : '';
  const sourcesHtml = (srcs) => {
    if (!srcs || !srcs.length) return '';
    return `<details class="sources"><summary>Sources (${srcs.length})</summary><ol>${srcs.map(s => /^https?:/.test(s) ? `<li><a href="${esc(s)}" target="_blank" rel="noopener">${esc(s)}</a></li>` : `<li>${esc(s)}</li>`).join('')}</ol></details>`;
  };
  const partyLink = (id) => `<a class="badge-party" href="party.html?id=${esc(id)}"><span class="swatch" style="background:${partyColor(id)}"></span>${esc(partyName(id))}</a>`;
  const yearOf = (d) => d ? String(d).slice(0, 4) : '';

  // seats history for a party across legislative elections
  function seatSeries(pid) { return legs.map(e => { const r = (e.results || []).find(r => r.party_id === pid); return { year: yearOf(e.date), seats: r ? r.seats : 0, pct: r ? r.pct : null, votes: r ? r.votes : null, total: e.seats_total }; }); }

  // ---------- charts ----------
  const charts = [];
  function chartDefaults() {
    if (!window.Chart) return;
    Chart.defaults.font.family = css('--font') || 'system-ui, sans-serif';
    Chart.defaults.font.size = 12;
    Chart.defaults.color = css('--muted');
    Chart.defaults.borderColor = css('--grid');
    Chart.defaults.plugins.legend.display = false;
    Chart.defaults.plugins.tooltip.backgroundColor = css('--surface');
    Chart.defaults.plugins.tooltip.titleColor = css('--ink');
    Chart.defaults.plugins.tooltip.bodyColor = css('--ink-2');
    Chart.defaults.plugins.tooltip.borderColor = css('--border');
    Chart.defaults.plugins.tooltip.borderWidth = 1;
    Chart.defaults.elements.line.borderWidth = 2;
    Chart.defaults.elements.line.borderJoinStyle = 'round';
    Chart.defaults.elements.point.radius = 3;
    Chart.defaults.elements.point.hoverRadius = 6;
    Chart.defaults.elements.point.borderWidth = 2;
    Chart.defaults.elements.point.borderColor = css('--surface');
    Chart.defaults.elements.bar.borderRadius = { topLeft: 4, topRight: 4 };
    Chart.defaults.elements.bar.borderSkipped = 'start';
    Chart.defaults.maxBarThickness = 24;
    Chart.defaults.interaction = { mode: 'index', intersect: false };
  }
  const axisOpts = (extra) => Object.assign({ grid: { color: css('--grid'), lineWidth: 1 }, border: { color: css('--axis') }, ticks: { color: css('--muted') } }, extra || {});
  function makeChart(canvasId, build) {
    const el = document.getElementById(canvasId); if (!el || !window.Chart) return;
    const entry = { el, build, chart: null };
    charts.push(entry); renderChart(entry);
  }
  function renderChart(entry) {
    if (entry.chart) entry.chart.destroy();
    chartDefaults();
    entry.chart = new Chart(entry.el.getContext('2d'), entry.build());
  }
  function rerenderCharts() { charts.forEach(renderChart); }
  function legendHtml(items) { return `<div class="legend">${items.map(i => `<span class="key"><span class="swatch" style="background:${i.color}"></span>${esc(i.label)}</span>`).join('')}</div>`; }
  function tableHtml(head, rows) {
    return `<details class="table-view"><summary>Table view</summary><div class="table-scroll"><table><thead><tr>${head.map(h => `<th class="${typeof h === 'object' && h.num ? 'num' : ''}">${esc(typeof h === 'object' ? h.label : h)}</th>`).join('')}</tr></thead><tbody>${rows.map(r => `<tr>${r.map((c, i) => `<td class="${typeof head[i] === 'object' && head[i].num ? 'num' : ''}">${c}</td>`).join('')}</tr>`).join('')}</tbody></table></div></details>`;
  }

  // ---------- shared components ----------
  function seatBar(results, total, container) {
    const isReal = (r) => !!partyById[r.party_id];
    const sorted = results.slice().sort((a, b) => (isReal(b) - isReal(a)) || b.seats - a.seats);
    let html = '<div class="seatbar">';
    sorted.forEach(r => { if (!r.seats) return; const w = (r.seats / total * 100).toFixed(2); html += `<div class="seg" style="width:${w}%;background:${partyColor(r.party_id)}" title="${esc(partyFull(r.party_id))}: ${r.seats}">${r.seats / total > 0.06 ? `<span>${esc(partyName(r.party_id))} ${r.seats}</span>` : ''}</div>`; });
    html += '</div><div class="seatbar-legend">' + sorted.filter(r => r.seats).map(r => `<span class="key"><span class="swatch" style="background:${partyColor(r.party_id)}"></span>${esc(partyName(r.party_id))} <b>${r.seats}</b></span>`).join('') + '</div>';
    container.innerHTML = html;
  }

  // ---------- DASHBOARD ----------
  function pageDashboard() {
    const meta = D.meta || {};
    // hero: countdown to next election
    const next = D.elections.find(e => e.id === 'leg-2026');
    const heroEl = $('#hero');
    if (heroEl) {
      const today = new Date(meta.generated_at || Date.now());
      let html = '';
      if (next) {
        const days = Math.round((new Date(next.date) - today) / 86400000);
        const label = days > 0 ? `days until the ${next.date} general election` : days === 0 ? 'the general election is today' : `days since the ${next.date} general election (results pending in this data bank)`;
        html += `<div><div class="big">${Math.abs(days)}</div><div class="big-label">${esc(label)}</div></div>`;
      }
      if (latestLeg) html += `<div class="muted small">Current House of Representatives composition is from the ${latestLeg.date} election (${latestLeg.seats_total} seats). Data snapshot: ${esc(meta.generated_at || '')}.</div>`;
      heroEl.innerHTML = html;
    }
    // KPI tiles
    const gov = D.governments.slice().sort((a, b) => a.from.localeCompare(b.from)).filter(g => !g.to).pop() || D.governments[D.governments.length - 1];
    const coalitionSeats = gov && latestLeg ? latestLeg.results.filter(r => gov.coalition.includes(r.party_id)).reduce((s, r) => s + r.seats, 0) : null;
    const partiesInParl = latestLeg ? latestLeg.results.filter(r => r.seats > 0).length : 0;
    const tiles = [
      { label: 'Parties with seats (House of Reps)', value: partiesInParl, delta: latestLeg ? `${latestLeg.seats_total} seats, ${yearOf(latestLeg.date)} election` : '' },
      { label: 'Governing coalition seats', value: coalitionSeats != null ? coalitionSeats : '—', delta: gov ? `${gov.coalition.map(partyName).join(' + ')} (${fmtPct(coalitionSeats / latestLeg.seats_total * 100)})` : '' },
      { label: 'Opposition seats', value: coalitionSeats != null ? latestLeg.seats_total - coalitionSeats : '—', delta: latestLeg ? latestLeg.results.filter(r => r.seats && !gov.coalition.includes(r.party_id)).map(r => partyName(r.party_id)).join(', ') : '' },
      { label: 'Turnout, last general election', value: latestLeg ? fmtPct(latestLeg.turnout_pct) : '—', delta: latestLeg ? `${fmt(latestLeg.registered_voters)} registered` : '' },
      { label: 'Registered parties in data bank', value: D.parties.length, delta: `${D.parties.filter(p => p.status === 'parliamentary').length} parliamentary` },
      { label: 'Events documented', value: D.events.length, delta: `${D.events.reduce((s, e) => s + (e.positions || []).length, 0)} party positions` }
    ];
    $('#kpis').innerHTML = tiles.map(t => `<div class="card tile"><div class="label">${esc(t.label)}</div><div class="value">${esc(t.value)}</div><div class="delta">${esc(t.delta)}</div></div>`).join('');

    // seat bar
    if (latestLeg) seatBar(latestLeg.results, latestLeg.seats_total, $('#seatbar'));
    if (gov) $('#gov-summary').innerHTML = `<b>${esc(gov.name)}</b> — Prime minister ${esc(gov.pm)} (${partyLink(gov.pm_party)}), in office since ${esc(gov.from)}. Coalition: ${gov.coalition.map(partyLink).join(', ')}. ${esc(gov.notes || '')}`;

    // seats over time (stacked columns, top 8 + other)
    const majors = Object.keys(SLOT);
    makeChart('chart-seats', () => ({
      type: 'bar',
      data: { labels: legs.map(e => yearOf(e.date)), datasets: majors.map(pid => ({ label: partyName(pid), data: seatSeries(pid).map(s => s.seats), backgroundColor: partyColor(pid), stack: 's', borderWidth: 0 })).concat([{ label: 'Other / independents', data: legs.map(e => e.results.filter(r => !SLOT[r.party_id]).reduce((s, r) => s + r.seats, 0)), backgroundColor: css('--gray-series'), stack: 's', borderWidth: 0 }]) },
      options: { responsive: true, maintainAspectRatio: false, datasets: { bar: { categoryPercentage: 0.6, barPercentage: 1 } }, scales: { x: axisOpts({ stacked: true, grid: { display: false } }), y: axisOpts({ stacked: true, title: { display: true, text: 'Seats', color: css('--muted') } }) }, plugins: { tooltip: { callbacks: { footer: (items) => 'Total: ' + items.reduce((s, i) => s + i.parsed.y, 0) } } } }
    }));
    $('#legend-seats').innerHTML = legendHtml(majors.map(pid => ({ label: partyName(pid), color: partyColor(pid) })).concat([{ label: 'Other / independents', color: css('--gray-series') }]));
    $('#table-seats').innerHTML = tableHtml(['Election'].concat(majors.map(partyName)).concat(['Other', 'Total']).map((h, i) => i ? { label: h, num: true } : h), legs.map(e => [yearOf(e.date)].concat(majors.map(pid => { const r = e.results.find(r => r.party_id === pid); return r ? fmt(r.seats) : '0'; })).concat([fmt(e.results.filter(r => !SLOT[r.party_id]).reduce((s, r) => s + r.seats, 0)), fmt(e.seats_total)])));

    // vote share over time (lines, only elections with pct data)
    const legsPct = legs.filter(e => e.results.some(r => r.pct != null));
    makeChart('chart-votes', () => ({
      type: 'line',
      data: { labels: legsPct.map(e => yearOf(e.date)), datasets: majors.map(pid => ({ label: partyName(pid), data: legsPct.map(e => { const r = e.results.find(r => r.party_id === pid); return r && r.pct != null ? r.pct : null; }), borderColor: partyColor(pid), backgroundColor: partyColor(pid), spanGaps: true, tension: 0.2 })) },
      options: { responsive: true, maintainAspectRatio: false, scales: { x: axisOpts({ grid: { display: false } }), y: axisOpts({ title: { display: true, text: 'Vote share (%)', color: css('--muted') }, beginAtZero: true }) }, plugins: { tooltip: { callbacks: { label: (i) => `${i.dataset.label}: ${i.parsed.y != null ? i.parsed.y.toFixed(1) + '%' : '—'}` } } } }
    }));
    $('#legend-votes').innerHTML = legendHtml(majors.map(pid => ({ label: partyName(pid), color: partyColor(pid) })));
    $('#table-votes').innerHTML = tableHtml(['Election'].concat(majors.map(p => ({ label: partyName(p), num: true }))), legsPct.map(e => [yearOf(e.date)].concat(majors.map(pid => { const r = e.results.find(r => r.party_id === pid); return r && r.pct != null ? fmtPct(r.pct) : '—'; }))));

    // turnout
    makeChart('chart-turnout', () => ({
      type: 'line',
      data: { labels: legs.map(e => yearOf(e.date)), datasets: [{ label: 'Turnout', data: legs.map(e => e.turnout_pct), borderColor: css('--s1'), backgroundColor: css('--s1') + '1a', fill: true, tension: 0.2 }] },
      options: { responsive: true, maintainAspectRatio: false, scales: { x: axisOpts({ grid: { display: false } }), y: axisOpts({ min: 0, max: 100, title: { display: true, text: 'Turnout (%)', color: css('--muted') } }) } }
    }));
    $('#table-turnout').innerHTML = tableHtml(['Election', { label: 'Registered', num: true }, { label: 'Turnout', num: true }], legs.map(e => [e.date, fmt(e.registered_voters), fmtPct(e.turnout_pct)]));

    // domination: who came first in each election
    const dom = legs.map(e => { const top = e.results.filter(r => partyById[r.party_id]).slice().sort((a, b) => b.seats - a.seats)[0]; return { year: yearOf(e.date), top, total: e.seats_total }; });
    $('#domination').innerHTML = `<div class="table-scroll"><table><thead><tr><th>Election</th><th>Largest party</th><th class="num">Seats</th><th class="num">Share of seats</th><th>Government formed</th></tr></thead><tbody>${dom.map(d => { const ed = legs.find(e => yearOf(e.date) === d.year).date; const lim = new Date(new Date(ed).getTime() + 400 * 86400000).toISOString().slice(0, 10); const g = D.governments.slice().sort((a, b) => a.from.localeCompare(b.from)).find(g => g.from >= ed && g.from <= lim) || D.governments.find(g => g.from <= ed && (!g.to || g.to >= ed)); return `<tr><td>${d.year}</td><td>${d.top ? partyLink(d.top.party_id) : '—'}</td><td class="num">${d.top ? d.top.seats : '—'}</td><td class="num">${d.top ? fmtPct(d.top.seats / d.total * 100) : '—'}</td><td>${g ? esc(g.name) + (g.coalition.length ? ' (' + g.coalition.map(partyName).join(', ') + ')' : '') : '—'}</td></tr>`; }).join('')}</tbody></table></div>`;

    // governments track
    const govs = D.governments.slice().sort((a, b) => a.from.localeCompare(b.from));
    const t0 = new Date(govs[0] ? govs[0].from : '1955-01-01').getTime(), t1 = Date.now();
    $('#gov-track').innerHTML = govs.map(g => { const a = new Date(g.from).getTime(), b = g.to ? new Date(g.to).getTime() : t1; const left = (a - t0) / (t1 - t0) * 100, w = Math.max(0.4, (b - a) / (t1 - t0) * 100); return `<div class="gov-row"><div title="${esc(g.name)}">${esc(g.pm)} <span class="muted">${yearOf(g.from)}–${g.to ? yearOf(g.to) : 'now'}</span></div><div class="bar"><div class="seg" style="left:${left}%;width:${w}%;background:${partyColor(g.pm_party)}" title="${esc(g.name)}: ${g.coalition.map(partyName).join(', ')}"></div></div></div>`; }).join('');
    $('#legend-gov').innerHTML = legendHtml(Object.keys(SLOT).map(pid => ({ label: partyName(pid), color: partyColor(pid) })).concat([{ label: 'Technocrat / no party / other', color: css('--gray-series') }]));

    // party cards
    const order = latestLeg ? latestLeg.results.slice().sort((a, b) => b.seats - a.seats).map(r => r.party_id) : [];
    const sortedParties = D.parties.slice().sort((a, b) => { const ia = order.indexOf(a.id), ib = order.indexOf(b.id); return (ia < 0 ? 999 : ia) - (ib < 0 ? 999 : ib) || a.names.fr.localeCompare(b.names.fr); });
    const ACTIVE = new Set(['parliamentary', 'extra-parliamentary', 'boycotting']);
    const hist = sortedParties.filter(p => !ACTIVE.has(p.status));
    $('#historical-parties').innerHTML = hist.length ? `<div class="table-scroll"><table><thead><tr><th>Party</th><th>Founded</th><th>Status</th><th>Best result</th><th>Note</th></tr></thead><tbody>${hist.map(p => { const best = seatSeries(p.id).filter(s => s.seats).sort((a, b) => b.seats - a.seats)[0]; return `<tr><td><a href="party.html?id=${esc(p.id)}">${esc(p.names.fr)}</a></td><td>${esc(yearOf(p.founded) || '—')}</td><td>${esc(p.status)}</td><td>${best ? best.seats + ' seats (' + best.year + ')' : '—'}</td><td class="small muted">${esc((p.founding_context || '').slice(0, 140))}</td></tr>`; }).join('')}</tbody></table></div>` : '<p class="muted">None.</p>';
    $('#party-cards').innerHTML = sortedParties.filter(p => ACTIVE.has(p.status)).map(p => { const r = latestLeg ? latestLeg.results.find(r => r.party_id === p.id) : null; return `<a class="card party-card" href="party.html?id=${esc(p.id)}"><div class="name"><span class="swatch" style="background:${partyColor(p.id)}"></span>${esc(p.abbr || p.names.fr)}</div><div class="meta">${esc(p.names.fr)}</div><div class="meta">${esc((p.ideology || []).slice(0, 3).join(' · '))}</div><div class="stats"><span><b>${r ? r.seats : 0}</b>seats ${latestLeg ? yearOf(latestLeg.date) : ''}</span><span><b>${r && r.pct != null ? fmtPct(r.pct) : '—'}</b>votes</span><span><b>${p.founded ? yearOf(p.founded) : '—'}</b>founded</span></div><div class="meta">${esc(p.current_leader ? p.current_leader.name : '')}</div></a>`; }).join('');

    // regional distribution: presidencies 2015 vs 2021, big-city mayors
    const gm = D.global_metrics || {}; const idx = gm._indexes || {};
    const r21 = idx.regional_presidencies_2021 || [], r15 = idx.regional_presidencies_2015 || [];
    if (r21.length || r15.length) {
      const regions = Array.from(new Set(r21.map(r => r.region).concat(r15.map(r => r.region))));
      $('#regions').innerHTML = `<div class="table-scroll"><table><thead><tr><th>Region</th><th>President after 2015</th><th>President after 2021</th></tr></thead><tbody>${regions.map(rg => { const a = r15.find(r => r.region === rg), b = r21.find(r => r.region === rg); const cell = (x) => x ? `${partyLabel(x.party)} <span class="muted small">${esc(x.president || '')}${x.verification && !/verified$/.test(x.verification) ? ' *' : ''}</span>` : '—'; return `<tr><td>${esc(rg)}</td><td>${cell(a)}</td><td>${cell(b)}</td></tr>`; }).join('')}</tbody></table></div><p class="small muted" style="margin:8px 0 0">* name from prior knowledge, party control verified. Sources: Ministry of Interior results as relayed by MAP, Le360, Médias24.</p>`;
      const counts = (arr) => { const c = {}; arr.forEach(r => c[r.party] = (c[r.party] || 0) + 1); return Object.entries(c).sort((a, b) => b[1] - a[1]); };
      $('#regions-summary').innerHTML = `<div class="grid kpi">${[['2015', counts(r15)], ['2021', counts(r21)]].map(([y, c]) => `<div class="tile"><div class="label">Regional presidencies, ${y}</div><div class="value" style="font-size:18px;line-height:1.6">${c.map(([pid, n]) => `<span class="key"><span class="swatch" style="background:${partyColor(pid)}"></span>${esc(partyName(pid))} <b>${n}</b></span>`).join('<br>')}</div></div>`).join('')}</div>`;
    }
    const mayors = idx.big_city_mayors_2021 || [];
    if (mayors.length) $('#mayors').innerHTML = `<div class="table-scroll"><table><thead><tr><th>City</th><th>Mayor (2021–)</th><th>Party</th><th>Conf.</th></tr></thead><tbody>${mayors.map(m => `<tr><td>${esc(m.city)}</td><td>${esc(m.mayor)}</td><td>${partyLabel(m.party)}</td><td>${confChip(m.confidence)}</td></tr>`).join('')}</tbody></table></div>`;
    // recent events
    const recent = D.events.slice().sort((a, b) => b.date.localeCompare(a.date)).slice(0, 8);
    $('#recent-events').innerHTML = `<ul class="timeline">${recent.map(ev => `<li><div class="date">${esc(ev.date)}</div><div class="title"><a href="events.html#${esc(ev.id)}">${esc(ev.title)}</a></div><div class="desc">${esc(ev.significance || ev.description || '').slice(0, 220)}${(ev.significance || ev.description || '').length > 220 ? '…' : ''}</div></li>`).join('')}</ul>`;
  }

  // ---------- PARTY PAGE ----------
  function pageParty() {
    const id = qs('id'); const p = partyById[id];
    const root = $('#party');
    if (!p) { root.innerHTML = `<h1>Party not found</h1><p class="sub">No party with id “${esc(id)}”.</p><p>${D.parties.map(x => `<a href="party.html?id=${esc(x.id)}">${esc(x.abbr || x.names.fr)}</a>`).join(' · ')}</p>`; return; }
    document.title = `${p.abbr || p.names.fr} — Ntikhabat`;
    const ss = seatSeries(p.id); const last = ss[ss.length - 1] || {};
    const m = p.metrics || {};
    const govNow = D.governments.filter(g => !g.to)[0];
    const inGov = govNow && govNow.coalition.includes(p.id);
    const evPositions = D.events.filter(e => (e.positions || []).some(x => x.party_id === p.id)).sort((a, b) => b.date.localeCompare(a.date));
    const regPres = (m.regional_presidencies || []).slice().sort((a, b) => b.year - a.year)[0];
    const funding = (m.public_funding_mad || []).slice().sort((a, b) => a.year - b.year);
    const lastFund = funding[funding.length - 1];
    const govPart = (m.government_participation || []);
    const lastGov = govPart.slice().sort((a, b) => (a.from || '').localeCompare(b.from || '')).pop();

    const logo = partyLogo(p.id);
    root.innerHTML = `
      <div class="pill-row">${[p.family, p.position, p.status].filter(Boolean).map(x => `<span class="chip">${esc(x)}</span>`).join('')}${inGov ? '<span class="chip stance stance-support">in government</span>' : (last.seats ? '<span class="chip">opposition</span>' : '')}</div>
      <h1 style="display:flex;align-items:center;gap:10px">${logo ? `<img src="${esc(logo.path)}" alt="${esc(p.abbr || '')}" style="width:36px;height:36px;object-fit:contain;border-radius:6px;background:var(--surface-2)" onerror="this.style.display='none'">` : `<span class="swatch" style="background:${partyColor(p.id)};width:16px;height:16px;border-radius:4px"></span>`} ${esc(p.names.fr)} ${p.abbr ? `(${esc(p.abbr)})` : ''}</h1>
      ${logo ? mediaCredit(logo) : ''}
      <p class="sub">${esc(p.names.ar || '')} · ${esc(p.names.en || '')}</p>
      <p class="sub">${esc(p.founding_context || '')}</p>
      <div class="grid kpi" id="p-kpis"></div>
      <h2>Ideology and identity</h2>
      <div class="card"><div class="tags">${(p.ideology || []).map(i => `<span class="chip">${esc(i)}</span>`).join('')}</div>
        <p class="small muted" style="margin:10px 0 0">Founded ${esc(p.founded || '?')}${p.founders && p.founders.length ? ' by ' + esc(p.founders.join(', ')) : ''}. Headquarters: ${esc(p.headquarters || '—')}. International affiliation: ${esc((p.international_affiliation || []).join(', ') || '—')}. ${p.website ? `Website: <a href="${esc(p.website)}" target="_blank" rel="noopener">${esc(p.website)}</a>.` : ''}</p></div>
      <h2>Electoral performance</h2>
      <div class="grid two">
        <div class="card chart-card"><div class="head"><span class="title">Seats in the House of Representatives</span><span class="note">${esc(p.abbr || p.names.fr)} highlighted, other parties in gray</span></div><div class="chart-wrap"><canvas id="chart-p-seats"></canvas></div><div id="legend-p-seats"></div><div id="table-p-seats"></div></div>
        <div class="card chart-card"><div class="head"><span class="title">Vote share (%)</span><span class="note">where official percentages exist</span></div><div class="chart-wrap"><canvas id="chart-p-votes"></canvas></div><div id="legend-p-votes"></div><div id="table-p-votes"></div></div>
      </div>
      <div id="p-metrics"></div>
      <h2>Leadership</h2>
      <div class="leaders">${(p.leaders || []).map(l => { const portrait = portraitFor(p.id, l.name); return `<div class="leader">${portrait ? `<img src="${esc(portrait.path)}" alt="${esc(l.name)}" style="width:100%;max-width:120px;border-radius:8px;object-fit:cover;margin-bottom:6px" onerror="this.style.display='none'">` : ''}<b>${esc(l.name)}</b><span class="muted">${esc(l.from || '?')} → ${esc(l.to || 'present')}</span>${l.note ? `<div class="small">${esc(l.note)}</div>` : ''}${portrait ? mediaCredit(portrait) : ''}</div>`; }).join('') || '<p class="muted">No leader data.</p>'}</div>
      ${(p.notable_members || []).length ? `<h3>Notable members</h3><div class="table-scroll"><table><thead><tr><th>Name</th><th>Role</th><th>Period</th></tr></thead><tbody>${p.notable_members.map(n => `<tr><td>${esc(n.name)}</td><td>${esc(n.role)}</td><td>${esc(n.period || '')}</td></tr>`).join('')}</tbody></table></div>` : ''}
      <h2>Timeline</h2>
      <div class="filters" id="tl-filters"></div>
      <ul class="timeline" id="p-timeline"></ul>
      <h2>Achievements and claims</h2>
      <p class="sub small">Each entry states what the party claims and what independent sources support. Confidence reflects cross-source agreement.</p>
      <div class="grid two">${(p.achievements || []).map(a => `<div class="card"><div style="display:flex;justify-content:space-between;gap:8px"><b>${esc(a.title)}</b>${confChip(a.confidence)}</div><div class="small muted">${esc(a.year || '')}${a.claimed_by_party ? ' · party claim' : ''}</div><p class="small" style="margin:6px 0">${esc(a.description)}</p>${a.verification ? `<p class="small" style="margin:6px 0"><b>Verification:</b> ${esc(a.verification)}</p>` : ''}${sourcesHtml(a.sources)}</div>`).join('') || '<p class="muted">No achievements recorded.</p>'}</div>
      <h2>Positions on major events (${evPositions.length})</h2>
      <div id="p-positions"></div>
      <h2>Data quality and sources</h2>
      <div class="card"><p class="small" style="margin:0 0 8px">${confChip(p.data_quality && p.data_quality.confidence)} ${esc(p.data_quality ? p.data_quality.notes : '')}</p>${sourcesHtml(p.sources)}</div>`;

    // KPIs
    const kp = [
      { label: `Seats, ${last.year || ''} election`, value: last.seats != null ? last.seats : '—', delta: last.total ? `of ${last.total} (${fmtPct(last.seats / last.total * 100)})` : '' },
      { label: `Vote share, ${last.year || ''}`, value: last.pct != null ? fmtPct(last.pct) : '—', delta: last.votes ? fmt(last.votes) + ' votes' : '' },
      { label: 'Current leader', value: p.current_leader ? p.current_leader.name : '—', delta: p.current_leader ? `${p.current_leader.title || ''} since ${p.current_leader.since || '?'}` : '' },
      { label: 'Governments joined', value: govPart.length, delta: lastGov ? `latest: ${lastGov.government} (${lastGov.role}${lastGov.ministers != null ? ', ' + lastGov.ministers + ' ministers' : ''})` : '' },
    ];
    if (regPres) kp.push({ label: `Regional presidencies, ${regPres.year}`, value: regPres.count, delta: (regPres.regions || []).join(', ') });
    if (lastFund) kp.push({ label: `State funding, ${lastFund.year}`, value: fmtMAD(lastFund.amount), delta: 'Cour des comptes' });
    $('#p-kpis').innerHTML = kp.map(t => `<div class="card tile"><div class="label">${esc(t.label)}</div><div class="value" style="font-size:${String(t.value).length > 12 ? 18 : 30}px">${esc(t.value)}</div><div class="delta">${esc(t.delta)}</div></div>`).join('');

    // charts: emphasis form (this party accent, other majors gray)
    const others = Object.keys(SLOT).filter(x => x !== p.id);
    makeChart('chart-p-seats', () => ({
      type: 'line',
      data: { labels: ss.map(s => s.year), datasets: others.map(o => ({ label: partyName(o), data: seatSeries(o).map(s => s.seats), borderColor: css('--gray-series'), backgroundColor: css('--gray-series'), borderWidth: 1.5, pointRadius: 0, order: 2 })).concat([{ label: partyName(p.id), data: ss.map(s => s.seats), borderColor: partyColor(p.id), backgroundColor: partyColor(p.id), borderWidth: 2.5, order: 1 }]) },
      options: { responsive: true, maintainAspectRatio: false, scales: { x: axisOpts({ grid: { display: false } }), y: axisOpts({ beginAtZero: true, title: { display: true, text: 'Seats', color: css('--muted') } }) } }
    }));
    $('#legend-p-seats').innerHTML = legendHtml([{ label: partyName(p.id), color: partyColor(p.id) }, { label: 'Other major parties', color: css('--gray-series') }]);
    $('#table-p-seats').innerHTML = tableHtml(['Election', { label: 'Seats', num: true }, { label: 'Total', num: true }, { label: 'Votes', num: true }, { label: 'Share', num: true }], ss.map(s => [s.year, fmt(s.seats), fmt(s.total), fmt(s.votes), fmtPct(s.pct)]));
    const ssPct = ss.filter(s => s.pct != null);
    makeChart('chart-p-votes', () => ({
      type: 'bar',
      data: { labels: ssPct.map(s => s.year), datasets: [{ label: 'Vote share', data: ssPct.map(s => s.pct), backgroundColor: partyColor(p.id) }] },
      options: { responsive: true, maintainAspectRatio: false, scales: { x: axisOpts({ grid: { display: false } }), y: axisOpts({ beginAtZero: true, title: { display: true, text: '%', color: css('--muted') } }) }, plugins: { tooltip: { callbacks: { label: i => i.parsed.y.toFixed(1) + '%' } } } }
    }));

    // other metrics
    let mh = '';
    const series = [];
    if (funding.length) series.push({ id: 'fund', title: 'Annual public funding (MAD)', unit: 'MAD', pts: funding.map(f => ({ x: String(f.year), y: f.amount, src: f.sources })), fmt: fmtMAD });
    const hc = (m.house_of_councillors_seats || []).slice().sort((a, b) => a.year - b.year); if (hc.length) series.push({ id: 'hc', title: 'House of Councillors seats', pts: hc.map(x => ({ x: String(x.year), y: x.seats, src: x.sources })), fmt: fmt });
    const cs = (m.communal_seats || []).slice().sort((a, b) => a.year - b.year); if (cs.length) series.push({ id: 'cs', title: 'Communal council seats', pts: cs.map(x => ({ x: String(x.year), y: x.seats, src: x.sources })), fmt: fmt });
    const rp = (m.regional_presidencies || []).slice().sort((a, b) => a.year - b.year); if (rp.length) series.push({ id: 'rp', title: 'Regional council presidencies (of 12)', pts: rp.map(x => ({ x: String(x.year), y: x.count, src: x.sources })), fmt: fmt });
    const gp = govPart.filter(g => g.ministers != null).slice().sort((a, b) => (a.from || '').localeCompare(b.from || '')); if (gp.length) series.push({ id: 'gp', title: 'Ministers held per government', pts: gp.map(x => ({ x: x.government, y: x.ministers, src: x.sources })), fmt: fmt });
    const wm = (m.women_mps || []).slice().sort((a, b) => a.year - b.year); if (wm.length) series.push({ id: 'wm', title: 'Women MPs elected', pts: wm.map(x => ({ x: String(x.year), y: x.count, src: x.sources })), fmt: fmt });
    (m.custom || []).forEach((c, i) => series.push({ id: 'c' + i, title: c.name + (c.unit ? ` (${c.unit})` : ''), pts: (c.series || []).map(x => ({ x: String(x.year), y: x.value, src: c.sources })), fmt: fmt }));
    if (series.length) {
      mh += '<h2>Other metrics over time</h2><div class="grid two">';
      series.forEach(s => { mh += `<div class="card chart-card"><div class="head"><span class="title">${esc(s.title)}</span></div><div class="chart-wrap short"><canvas id="chart-m-${s.id}"></canvas></div>${tableHtml(['Period', { label: 'Value', num: true }], s.pts.map(pt => [esc(pt.x), s.fmt(pt.y)]))}${sourcesHtml(Array.from(new Set(s.pts.flatMap(pt => pt.src || []))))}</div>`; });
      mh += '</div>';
    }
    const mc = (m.membership_claims || []);
    if (mc.length) mh += `<h3>Membership claims</h3><div class="table-scroll"><table><thead><tr><th>Year</th><th class="num">Claimed</th><th>Source</th><th>Verification</th><th>Conf.</th></tr></thead><tbody>${mc.map(c => `<tr><td>${esc(c.year)}</td><td class="num">${fmt(c.claimed)}</td><td>${esc(c.source)}</td><td>${esc(c.verification)}</td><td>${confChip(c.confidence)}</td></tr>`).join('')}</tbody></table></div>`;
    if (govPart.length) mh += `<h3>Government participation</h3><div class="table-scroll"><table><thead><tr><th>Government</th><th>From</th><th>To</th><th>Role</th><th class="num">Ministers</th></tr></thead><tbody>${govPart.map(g => `<tr><td>${esc(g.government)}</td><td>${esc(g.from || '')}</td><td>${esc(g.to || 'present')}</td><td>${esc(g.role || '')}</td><td class="num">${g.ministers != null ? g.ministers : '—'}</td></tr>`).join('')}</tbody></table></div>`;
    $('#p-metrics').innerHTML = mh;
    series.forEach(s => makeChart('chart-m-' + s.id, () => ({ type: 'bar', data: { labels: s.pts.map(pt => pt.x), datasets: [{ data: s.pts.map(pt => pt.y), backgroundColor: partyColor(p.id) }] }, options: { responsive: true, maintainAspectRatio: false, scales: { x: axisOpts({ grid: { display: false }, ticks: { autoSkip: false, maxRotation: 0, callback: function (v) { const l = this.getLabelForValue(v); return l.length > 12 ? l.slice(0, 11) + '…' : l; } } }), y: axisOpts({ beginAtZero: true }) }, plugins: { tooltip: { callbacks: { label: i => s.fmt(i.parsed.y) } } } } })));

    // timeline with type filter
    const tl = (p.timeline || []).slice().sort((a, b) => String(a.date).localeCompare(String(b.date)));
    const types = Array.from(new Set(tl.map(t => t.type).filter(Boolean)));
    let active = null;
    const renderTl = () => { $('#p-timeline').innerHTML = tl.filter(t => !active || t.type === active).map(t => `<li><div class="date">${esc(t.date)} ${t.type ? `<span class="chip">${esc(t.type)}</span>` : ''}</div><div class="title">${esc(t.title)}</div><div class="desc">${esc(t.description || '')}</div>${sourcesHtml(t.sources)}</li>`).join('') || '<li class="muted">No timeline entries.</li>'; };
    $('#tl-filters').innerHTML = `<span class="pill on" data-t="">All (${tl.length})</span>` + types.map(t => `<span class="pill" data-t="${esc(t)}">${esc(t)} (${tl.filter(x => x.type === t).length})</span>`).join('');
    $$('#tl-filters .pill').forEach(el => el.addEventListener('click', () => { $$('#tl-filters .pill').forEach(x => x.classList.remove('on')); el.classList.add('on'); active = el.dataset.t || null; renderTl(); }));
    renderTl();

    // positions
    $('#p-positions').innerHTML = evPositions.length ? `<div class="table-scroll"><table><thead><tr><th>Date</th><th>Event</th><th>Stance</th><th>Position</th><th>Conf.</th></tr></thead><tbody>${evPositions.map(ev => { const pos = ev.positions.find(x => x.party_id === p.id); return `<tr><td>${esc(ev.date)}</td><td><a href="events.html#${esc(ev.id)}">${esc(ev.title)}</a></td><td><span class="chip stance stance-${esc(pos.stance)}">${stanceIcon(pos.stance)} ${esc(pos.stance)}</span></td><td class="small">${esc(pos.summary)}${sourcesHtml(pos.sources)}</td><td>${confChip(pos.confidence)}</td></tr>`; }).join('')}</tbody></table></div>` : '<p class="muted">No documented positions.</p>';
  }

  const stanceIcon = (s) => ({ support: '✓', oppose: '✕', mixed: '~', conditional: '~', split: '÷', abstain: '○', silent: '·', boycott: '⊘' }[s] || '·');

  // ---------- EVENTS PAGE ----------
  function pageEvents() {
    const events = D.events.slice().sort((a, b) => b.date.localeCompare(a.date));
    const cats = Array.from(new Set(events.map(e => e.category).filter(Boolean))).sort();
    const partiesWithPos = Array.from(new Set(events.flatMap(e => (e.positions || []).map(p => p.party_id))));
    const years = events.map(e => +yearOf(e.date)).filter(Boolean);
    const minY = Math.min.apply(null, years), maxY = Math.max.apply(null, years);
    $('#ev-filters').innerHTML = `
      <input type="search" id="ev-q" placeholder="Search events, descriptions, positions… (e.g. Moudawana, Sahara, Gen Z)" aria-label="Search events">
      <select id="ev-cat"><option value="">All categories</option>${cats.map(c => `<option value="${esc(c)}">${esc(c)}</option>`).join('')}</select>
      <select id="ev-party"><option value="">Any party position</option>${partiesWithPos.map(p => `<option value="${esc(p)}">${esc(partyName(p))}</option>`).join('')}</select>
      <select id="ev-stance"><option value="">Any stance</option>${['support', 'oppose', 'mixed', 'conditional', 'split', 'abstain', 'silent', 'boycott'].map(s => `<option value="${s}">${s}</option>`).join('')}</select>
      <select id="ev-from"><option value="">From ${minY}</option>${range(minY, maxY).map(y => `<option value="${y}">From ${y}</option>`).join('')}</select>
      <select id="ev-to"><option value="">To ${maxY}</option>${range(minY, maxY).map(y => `<option value="${y}">To ${y}</option>`).join('')}</select>`;
    const inputs = ['#ev-q', '#ev-cat', '#ev-party', '#ev-stance', '#ev-from', '#ev-to'].map(s => $(s));
    const hay = (ev) => [ev.title, ev.description, ev.significance, (ev.tags || []).join(' '), (ev.positions || []).map(p => partyName(p.party_id) + ' ' + partyFull(p.party_id) + ' ' + p.summary).join(' ')].join(' ').toLowerCase();
    function render() {
      const q = inputs[0].value.trim().toLowerCase(), cat = inputs[1].value, party = inputs[2].value, stance = inputs[3].value, from = +inputs[4].value || 0, to = +inputs[5].value || 9999;
      const terms = q.split(/\s+/).filter(Boolean);
      const list = events.filter(ev => {
        const y = +yearOf(ev.date); if (y < from || y > to) return false;
        if (cat && ev.category !== cat) return false;
        if (party) { const pos = (ev.positions || []).find(p => p.party_id === party); if (!pos) return false; if (stance && pos.stance !== stance) return false; }
        else if (stance && !(ev.positions || []).some(p => p.stance === stance)) return false;
        if (terms.length) { const h = hay(ev); if (!terms.every(t => h.includes(t))) return false; }
        return true;
      });
      $('#ev-count').textContent = `${list.length} of ${events.length} events`;
      $('#ev-list').innerHTML = list.map(ev => eventHtml(ev, party)).join('') || '<p class="muted">No events match.</p>';
      if (location.hash) { const el = document.getElementById(location.hash.slice(1)); if (el) { el.open = true; } }
    }
    inputs.forEach(i => i.addEventListener('input', render));
    render();
    if (location.hash) { const el = document.getElementById(location.hash.slice(1)); if (el) { el.open = true; el.scrollIntoView({ block: 'start' }); } }
    // stance matrix summary
    const majors = Object.keys(SLOT).filter(p => partiesWithPos.includes(p));
    const counts = {}; majors.forEach(p => counts[p] = { support: 0, oppose: 0, other: 0 });
    events.forEach(ev => (ev.positions || []).forEach(x => { if (!counts[x.party_id]) return; if (x.stance === 'support') counts[x.party_id].support++; else if (x.stance === 'oppose') counts[x.party_id].oppose++; else counts[x.party_id].other++; }));
    $('#ev-matrix').innerHTML = `<div class="table-scroll"><table><thead><tr><th>Party</th><th class="num">Documented positions</th><th class="num">Support</th><th class="num">Oppose</th><th class="num">Mixed / other</th></tr></thead><tbody>${majors.map(p => `<tr><td>${partyLink(p)}</td><td class="num">${counts[p].support + counts[p].oppose + counts[p].other}</td><td class="num">${counts[p].support}</td><td class="num">${counts[p].oppose}</td><td class="num">${counts[p].other}</td></tr>`).join('')}</tbody></table></div>`;
  }
  function range(a, b) { const r = []; for (let i = a; i <= b; i++) r.push(i); return r; }
  function eventHtml(ev, highlightParty) {
    const pos = (ev.positions || []).slice().sort((a, b) => (SLOT[a.party_id] || 99) - (SLOT[b.party_id] || 99));
    return `<details class="card event" id="${esc(ev.id)}"><summary><span class="date">${esc(ev.date)}</span><span class="title">${esc(ev.title)}</span><span class="chip">${esc(ev.category || '')}</span>${confChip(ev.confidence)}<span class="muted small">${pos.length} positions</span></summary>
      <div class="body"><p style="margin:0 0 8px">${esc(ev.description)}</p>${ev.significance ? `<p class="small" style="margin:0 0 10px"><b>Why it matters:</b> ${esc(ev.significance)}</p>` : ''}
      <div class="tags" style="margin-bottom:10px">${(ev.tags || []).map(t => `<span class="chip">${esc(t)}</span>`).join('')}</div>
      <h3 style="margin-top:6px">Party positions</h3>
      <div class="positions">${pos.map(x => `<div class="pos" style="${highlightParty === x.party_id ? 'outline:2px solid var(--accent)' : ''}"><div class="head"><span class="party"><span class="swatch" style="background:${partyColor(x.party_id)}"></span><a href="party.html?id=${esc(x.party_id)}">${esc(partyName(x.party_id))}</a></span><span class="chip stance stance-${esc(x.stance)}">${stanceIcon(x.stance)} ${esc(x.stance)}</span></div><div class="summary">${esc(x.summary)}</div><div style="margin-top:4px">${confChip(x.confidence)}</div>${sourcesHtml(x.sources)}</div>`).join('') || '<p class="muted small">No party positions documented for this event.</p>'}</div>
      <div style="margin-top:10px">${sourcesHtml(ev.sources)}</div>
      <p class="small" style="margin:8px 0 0"><a href="#${esc(ev.id)}">Link to this event</a></p></div></details>`;
  }

  // ---------- ELECTIONS PAGE ----------
  function pageElections() {
    const root = $('#elections');
    const els = D.elections.slice().sort((a, b) => b.date.localeCompare(a.date));
    root.innerHTML = els.map(e => {
      const res = (e.results || []).slice().sort((a, b) => (b.seats || 0) - (a.seats || 0) || (b.votes || 0) - (a.votes || 0));
      return `<details class="card event" id="${esc(e.id)}" ${e.type === 'legislative' ? 'open' : ''}><summary><span class="date">${esc(e.date)}</span><span class="title">${esc(e.chamber || e.type)} — ${esc(e.type)}</span>${confChip(e.confidence)}<span class="muted small">${e.seats_total ? e.seats_total + ' seats' : ''}</span></summary>
        <div class="body"><div class="grid kpi" style="margin-bottom:12px"><div class="tile"><div class="label">Registered voters</div><div class="value" style="font-size:22px">${fmt(e.registered_voters)}</div></div><div class="tile"><div class="label">Turnout</div><div class="value" style="font-size:22px">${fmtPct(e.turnout_pct)}</div></div><div class="tile"><div class="label">Votes cast</div><div class="value" style="font-size:22px">${fmt(e.votes_cast)}</div></div><div class="tile"><div class="label">Seats</div><div class="value" style="font-size:22px">${fmt(e.seats_total)}</div></div></div>
        ${e.electoral_system ? `<p class="small muted">${esc(e.electoral_system)}</p>` : ''}
        ${res.length && e.seats_total ? `<div id="sb-${esc(e.id)}"></div>` : ''}
        ${res.length ? `<div class="table-scroll" style="margin-top:12px"><table><thead><tr><th>Party</th><th class="num">Votes</th><th class="num">%</th><th class="num">Seats</th><th class="num">Change</th><th>Conf.</th><th>Notes</th></tr></thead><tbody>${res.map(r => `<tr><td>${partyLabel(r.party_id)}</td><td class="num">${fmt(r.votes)}</td><td class="num">${fmtPct(r.pct)}</td><td class="num">${fmt(r.seats)}</td><td class="num">${r.seat_change == null ? '—' : (r.seat_change > 0 ? '+' : '') + r.seat_change}</td><td>${confChip(r.confidence)}</td><td class="small muted">${esc(r.notes || '')}</td></tr>`).join('')}</tbody></table></div>` : ''}
        ${e.outcome ? `<p class="small"><b>Outcome:</b> ${esc(e.outcome)}</p>` : ''}
        ${e.notes ? `<p class="small muted">${esc(e.notes)}</p>` : ''}
        ${sourcesHtml(e.sources)}</div></details>`;
    }).join('');
    els.forEach(e => { const c = document.getElementById('sb-' + e.id); if (c && e.seats_total) seatBar(e.results.filter(r => r.seats), e.seats_total, c); });
  }

  // ---------- POLICY MAP PAGE ----------
  function pagePolicy() {
    const dims = D.policy_dimensions || [];
    const positions = D.policy_positions || [];
    const root = $('#policy');
    if (!dims.length || !root) { if (root) root.innerHTML = '<p class="muted">No policy data available.</p>'; return; }
    const posByParty = {};
    positions.forEach(p => { (posByParty[p.party_id] = posByParty[p.party_id] || {})[p.dimension_id] = p; });
    const state = { x: dims[0].id, y: (dims[1] || dims[0]).id, selected: null };
    const dim = (id) => dims.find(d => d.id === id);

    root.innerHTML = `
      <p class="sub">Editorial coding of party positions on ${dims.length} policy dimensions, scored −2..+2 from dated statements and programmes. Missing evidence is omitted, never assumed neutral.</p>
      <div class="pill-row">
        <label class="small">Horizontal axis <select id="pol-x">${dims.map(d => `<option value="${esc(d.id)}">${esc(d.label)}</option>`).join('')}</select></label>
        <label class="small">Vertical axis <select id="pol-y">${dims.map(d => `<option value="${esc(d.id)}">${esc(d.label)}</option>`).join('')}</select></label>
      </div>
      <div class="grid two" style="align-items:start">
        <div class="card chart-card"><div class="chart-wrap tall"><canvas id="chart-policy"></canvas></div><div id="table-policy"></div></div>
        <div class="card" id="policy-detail"></div>
      </div>
      <h2>All positions</h2>
      <div class="card" id="policy-matrix"></div>`;
    $('#pol-x').value = state.x; $('#pol-y').value = state.y;

    function render() {
      const rows = Object.keys(posByParty)
        .filter(pid => posByParty[pid][state.x] && posByParty[pid][state.y])
        .map(pid => ({ pid, x: posByParty[pid][state.x].score, y: posByParty[pid][state.y].score }));
      makeChart('chart-policy', () => ({
        type: 'scatter',
        data: { datasets: rows.map(r => ({ label: partyName(r.pid), data: [{ x: r.x, y: r.y }], backgroundColor: partyColor(r.pid), pointRadius: 8, pointHoverRadius: 10 })) },
        options: {
          responsive: true, maintainAspectRatio: false,
          scales: {
            x: axisOpts({ min: -2.3, max: 2.3, title: { display: true, text: dim(state.x).label, color: css('--muted') } }),
            y: axisOpts({ min: -2.3, max: 2.3, title: { display: true, text: dim(state.y).label, color: css('--muted') } }),
          },
          plugins: { legend: { display: false }, tooltip: { callbacks: { label: (i) => `${i.dataset.label}: ${i.parsed.x}, ${i.parsed.y}` } } },
          onClick: (evt, els) => { if (els.length) { state.selected = rows[els[0].datasetIndex].pid; renderDetail(); } },
        },
      }));
      $('#table-policy').innerHTML = tableHtml(['Party', { label: dim(state.x).label, num: true }, { label: dim(state.y).label, num: true }],
        rows.map(r => [partyLabel(r.pid), r.x, r.y]));
      renderDetail();
      renderMatrix();
    }

    function renderDetail() {
      const box = $('#policy-detail');
      if (!state.selected) { box.innerHTML = '<p class="muted">Click a point on the chart to see the evidence behind it.</p>'; return; }
      const pid = state.selected;
      box.innerHTML = `<h3>${partyLabel(pid)}</h3>` + dims.map(d => {
        const o = (posByParty[pid] || {})[d.id];
        return `<div class="pos"><div class="head"><b>${esc(d.label)}</b>${o ? `<span class="chip">${o.score > 0 ? '+' : ''}${o.score}</span>` : '<span class="muted small">Unknown</span>'}</div>
          ${o ? `<div class="summary">${esc(o.note || '')}</div><p class="small muted" style="margin:4px 0">${esc(o.date || '')}${o.scope ? ' · ' + esc(o.scope) : ''}</p>${sourcesHtml(o.sources)}` : `<p class="small muted">${esc(d.description || '')}</p>`}</div>`;
      }).join('');
    }

    function renderMatrix() {
      const pids = Object.keys(posByParty).sort();
      $('#policy-matrix').innerHTML = tableHtml(['Party'].concat(dims.map(d => ({ label: d.label, num: true }))),
        pids.map(pid => [partyLabel(pid)].concat(dims.map(d => { const o = posByParty[pid][d.id]; return o ? (o.score > 0 ? '+' : '') + o.score : '—'; }))));
    }

    $('#pol-x').onchange = e => { state.x = e.target.value; render(); };
    $('#pol-y').onchange = e => { state.y = e.target.value; render(); };
    render();
  }

  // ---------- PROGRAMMES PAGE ----------
  function pageProgrammes() {
    const pr = D.programmes || {};
    const claims = pr.claims || [];
    const root = $('#programmes');
    if (!claims.length || !root) { if (root) root.innerHTML = '<p class="muted">No programme data available.</p>'; return; }
    const partiesWithDocs = Array.from(new Set((pr.documents || []).map(d => d.party_id)));
    const topics = Array.from(new Set(claims.map(c => c.topic).filter(Boolean))).sort();
    const state = { tab: 'current', topic: '', parties: partiesWithDocs.slice(0, 4), selected: null };

    root.innerHTML = `
      <p class="sub">Selected programme commitments, sourced claims and parliamentary records — not an exhaustive manifesto inventory or a promise-completion score.</p>
      <div class="pill-row" id="pr-tabs">
        <button class="pill" data-tab="current" type="button">2026 proposals</button>
        <button class="pill" data-tab="past" type="button">Previous promises</button>
        <button class="pill" data-tab="parliament" type="button">Parliamentary record</button>
      </div>
      <p class="small muted" style="margin:6px 0 2px">Parties to compare (up to 4)</p>
      <div class="pill-row" id="pr-parties"></div>
      <label class="small">Subject <select id="pr-topic"><option value="">All subjects</option>${topics.map(t => `<option value="${esc(t)}">${esc(t)}</option>`).join('')}</select></label>
      <div id="pr-results"></div>`;

    function renderTabs() { $$('#pr-tabs .pill').forEach(b => b.classList.toggle('on', b.dataset.tab === state.tab)); }
    function renderPartyPicker() {
      $('#pr-parties').innerHTML = partiesWithDocs.map(pid => `<button class="pill ${state.parties.includes(pid) ? 'on' : ''}" data-party="${esc(pid)}" type="button">${esc(partyName(pid))}</button>`).join('');
      $$('#pr-parties [data-party]').forEach(b => b.onclick = () => {
        const pid = b.dataset.party;
        if (state.parties.includes(pid)) state.parties = state.parties.filter(x => x !== pid);
        else if (state.parties.length < 4) state.parties.push(pid);
        state.selected = null; render();
      });
    }

    function selectedClaims() {
      return claims.filter(c => state.parties.includes(c.party_id) && (!state.topic || c.topic === state.topic) && (state.tab === 'past' ? c.year < 2026 : c.year === 2026));
    }

    function promiseCard(c) {
      return `<div class="card" data-claim="${esc(c.id)}" style="cursor:pointer;margin-bottom:8px">
        <div class="small muted">${esc(c.topic || '')}</div><b>${esc(c.title || '')}</b>
        ${c.value != null ? `<div>${fmt(c.value)} <span class="small muted">${esc(c.unit || '')}</span></div>` : '<div class="small muted">Qualitative commitment</div>'}
        <p class="small" style="margin:4px 0 0">${esc(c.promise || '')}</p></div>`;
    }

    function renderClaimDetail() {
      const box = $('#pr-claim-detail'); if (!box) return;
      const c = claims.find(c => c.id === state.selected);
      if (!c) { box.innerHTML = '<p class="muted">Click a commitment to see its proposed method, dated records and evidence limits.</p>'; return; }
      box.innerHTML = `<h3>${esc(c.title)} — ${partyLabel(c.party_id)}</h3>
        <p><b>The promise:</b> ${esc(c.promise || '')}</p>
        <p class="small muted">Target date: ${esc(c.deadline || '—')}</p>
        ${c.method ? `<p><b>How they propose to do it:</b> ${esc(c.method)}</p>` : ''}
        ${sourcesHtml(c.sources)}
        ${(c.history || []).length ? '<h4 style="margin:10px 0 4px">Public record</h4>' + c.history.map(r => `<div class="pos"><b>${esc(r.date || '')}</b> — ${esc(r.title || '')}<p class="small">${esc(r.detail || '')}</p>${sourcesHtml(r.sources)}</div>`).join('') : '<p class="small muted">No sufficiently matched action or outcome record has been collected. This is an evidence gap, not proof of inaction.</p>'}
        ${c.limits ? `<div class="notice" style="margin-top:8px"><b>Evidence limits</b><p style="margin:4px 0 0">${esc(c.limits)}</p></div>` : ''}`;
    }

    function employmentSection() {
      const rr = pr.employment_outcomes || [];
      if (!rr.length || state.tab !== 'past') return '';
      return `<div class="card" style="margin:10px 0"><h3 style="margin-top:0">Employment outcomes — an independent measure</h3><p class="small muted">Annual national net employment change (HCP), not attributable to one party or measure.</p>
        ${tableHtml(['Year', { label: 'Change', num: true }], rr.map(r => [r.year, (r.value > 0 ? '+' : '') + fmt(r.value)]))}</div>`;
    }

    function renderParliament(el) {
      const rr = (pr.legislation || []).filter(l => (l.party_ids || []).some(p => state.parties.includes(p)) && (!state.topic || l.topic === state.topic));
      el.innerHTML = `<div class="notice">These are legislative records, not a scorecard of fulfilled promises. The attribution beneath each entry states what is known.</div>` +
        (rr.map(l => {
          const total = l.votes ? Object.values(l.votes).reduce((a, b) => a + b, 0) : 0;
          return `<div class="card" style="margin:10px 0">
            <div class="small muted">${esc(l.date || '')} · ${esc(l.law || '')}</div><h3 style="margin:2px 0">${esc(l.title)}</h3><span class="chip">${esc(l.stage || '')}</span>
            <p class="small" style="margin:6px 0">${esc(l.summary || '')}</p>
            ${l.vote_note ? `<div class="notice"><b>Disputed tally</b><p style="margin:4px 0 0">${esc(l.vote_note)}</p></div>` : ''}
            ${l.votes && total ? `<div class="small">For ${l.votes.for || 0} · Against ${l.votes.against || 0} · Abstain ${l.votes.abstain || 0}</div>` : '<p class="small muted">Numerical vote breakdown not recorded in this entry.</p>'}
            <p class="small muted" style="margin-top:6px">Parties: ${(l.party_ids || []).map(partyName).join(', ')}</p>
            <p class="small muted">${esc(l.attribution || '')}</p>${sourcesHtml(l.sources)}</div>`;
        }).join('') || '<p class="muted">No matched legislative record in this selection.</p>');
    }

    function renderResults() {
      const el = $('#pr-results');
      if (state.tab === 'parliament') { renderParliament(el); return; }
      const rr = selectedClaims();
      el.innerHTML = `
        <div class="grid kpi" style="margin:10px 0">
          <div class="card tile"><div class="label">Selected commitments</div><div class="value">${rr.length}</div></div>
          <div class="card tile"><div class="label">With numerical targets</div><div class="value">${rr.filter(c => c.value != null).length}</div></div>
          <div class="card tile"><div class="label">With related records</div><div class="value">${rr.filter(c => (c.history || []).length).length}</div></div>
        </div>
        ${state.tab === 'current' ? '<div class="notice">The 2026 election has not taken place. These are future pledges, not completed achievements or broken promises.</div>' : '<div class="notice">Missing records are not evidence of failure; opposition parties did not control government policy.</div>'}
        ${employmentSection()}
        <div class="grid" style="grid-template-columns:repeat(${Math.max(1, state.parties.length)},1fr);gap:12px;margin-top:10px">
          ${state.parties.map(pid => `<div><h3>${partyLabel(pid)}</h3>${rr.filter(c => c.party_id === pid).map(promiseCard).join('') || '<p class="muted small">No reviewed commitment for this party in the selected period and subject.</p>'}</div>`).join('') || '<p class="muted">Choose a party above to begin the comparison.</p>'}
        </div>
        <div id="pr-claim-detail" class="card" style="margin:10px 0"></div>
        ${tableHtml(['Party', 'Topic', 'Title', { label: 'Value', num: true }, 'Unit', 'Deadline', 'Status'],
          rr.map(c => [partyName(c.party_id), esc(c.topic || ''), esc(c.title || ''), c.value != null ? fmt(c.value) : '—', esc(c.unit || ''), esc(c.deadline || ''), esc(c.status || '')]))}`;
      $$('#pr-results [data-claim]').forEach(b => b.onclick = () => { state.selected = b.dataset.claim; renderClaimDetail(); });
      renderClaimDetail();
    }

    function render() { renderTabs(); renderPartyPicker(); renderResults(); }
    $$('#pr-tabs .pill').forEach(b => b.onclick = () => { state.tab = b.dataset.tab; state.selected = null; render(); });
    $('#pr-topic').onchange = e => { state.topic = e.target.value; state.selected = null; render(); };
    render();
  }

  // ---------- init ----------
  document.addEventListener('DOMContentLoaded', () => {
    initTheme();
    const page = document.body.dataset.page;
    $$('header nav a').forEach(a => { if (a.dataset.page === page) a.classList.add('active'); });
    const gen = $('#generated'); if (gen) gen.textContent = (D.meta && D.meta.generated_at) || '';
    try {
      if (page === 'dashboard') pageDashboard();
      else if (page === 'party') pageParty();
      else if (page === 'events') pageEvents();
      else if (page === 'elections') pageElections();
      else if (page === 'policy') pagePolicy();
      else if (page === 'programmes') pageProgrammes();
    } catch (err) { console.error(err); const m = $('main .wrap'); if (m) m.insertAdjacentHTML('afterbegin', `<div class="notice">Rendering error: ${esc(err.message)}. Run <code>python3 scripts/build.py</code> to regenerate data.js.</div>`); }
    matchMedia('(prefers-color-scheme: dark)').addEventListener('change', rerenderCharts);
  });
})();
