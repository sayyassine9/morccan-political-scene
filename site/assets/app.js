/* Moroccan political scene — data bank front-end (vanilla JS + Chart.js) */
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
  const legs = D.elections.filter(e => e.type === 'legislative' && e.results && e.results.length).sort((a, b) => a.date.localeCompare(b.date));
  const latestLeg = legs[legs.length - 1];
  const partyName = (id) => (partyById[id] && (partyById[id].abbr || partyById[id].names.fr)) || (id === 'other' ? 'Other' : id === 'independents' ? 'Independents' : id);
  const partyFull = (id) => (partyById[id] && partyById[id].names.fr) || partyName(id);
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
    $('#domination').innerHTML = `<div class="table-scroll"><table><thead><tr><th>Election</th><th>Largest party</th><th class="num">Seats</th><th class="num">Share of seats</th><th>Government formed</th></tr></thead><tbody>${dom.map(d => { const g = D.governments.find(g => g.from >= d.year + '-01-01' && g.from <= String(+d.year + 1) + '-12-31'); return `<tr><td>${d.year}</td><td>${d.top ? partyLink(d.top.party_id) : '—'}</td><td class="num">${d.top ? d.top.seats : '—'}</td><td class="num">${d.top ? fmtPct(d.top.seats / d.total * 100) : '—'}</td><td>${g ? esc(g.name) + ' (' + g.coalition.map(partyName).join(', ') + ')' : '—'}</td></tr>`; }).join('')}</tbody></table></div>`;

    // governments track
    const govs = D.governments.slice().sort((a, b) => a.from.localeCompare(b.from));
    const t0 = new Date(govs[0] ? govs[0].from : '1955-01-01').getTime(), t1 = Date.now();
    $('#gov-track').innerHTML = govs.map(g => { const a = new Date(g.from).getTime(), b = g.to ? new Date(g.to).getTime() : t1; const left = (a - t0) / (t1 - t0) * 100, w = Math.max(0.4, (b - a) / (t1 - t0) * 100); return `<div class="gov-row"><div title="${esc(g.name)}">${esc(g.pm)} <span class="muted">${yearOf(g.from)}–${g.to ? yearOf(g.to) : 'now'}</span></div><div class="bar"><div class="seg" style="left:${left}%;width:${w}%;background:${partyColor(g.pm_party)}" title="${esc(g.name)}: ${g.coalition.map(partyName).join(', ')}"></div></div></div>`; }).join('');
    $('#legend-gov').innerHTML = legendHtml(Object.keys(SLOT).map(pid => ({ label: partyName(pid), color: partyColor(pid) })).concat([{ label: 'Technocrat / no party / other', color: css('--gray-series') }]));

    // party cards
    const order = latestLeg ? latestLeg.results.slice().sort((a, b) => b.seats - a.seats).map(r => r.party_id) : [];
    const sortedParties = D.parties.slice().sort((a, b) => { const ia = order.indexOf(a.id), ib = order.indexOf(b.id); return (ia < 0 ? 999 : ia) - (ib < 0 ? 999 : ib) || a.names.fr.localeCompare(b.names.fr); });
    $('#party-cards').innerHTML = sortedParties.map(p => { const r = latestLeg ? latestLeg.results.find(r => r.party_id === p.id) : null; return `<a class="card party-card" href="party.html?id=${esc(p.id)}"><div class="name"><span class="swatch" style="background:${partyColor(p.id)}"></span>${esc(p.abbr || p.names.fr)}</div><div class="meta">${esc(p.names.fr)}</div><div class="meta">${esc((p.ideology || []).slice(0, 3).join(' · '))}</div><div class="stats"><span><b>${r ? r.seats : 0}</b>seats ${latestLeg ? yearOf(latestLeg.date) : ''}</span><span><b>${r && r.pct != null ? fmtPct(r.pct) : '—'}</b>votes</span><span><b>${p.founded ? yearOf(p.founded) : '—'}</b>founded</span></div><div class="meta">${esc(p.current_leader ? p.current_leader.name : '')}</div></a>`; }).join('');

    // recent events
    const recent = D.events.slice().sort((a, b) => b.date.localeCompare(a.date)).slice(0, 8);
    $('#recent-events').innerHTML = `<ul class="timeline">${recent.map(ev => `<li><div class="date">${esc(ev.date)}</div><div class="title"><a href="events.html#${esc(ev.id)}">${esc(ev.title)}</a></div><div class="desc">${esc(ev.significance || ev.description || '').slice(0, 220)}${(ev.significance || ev.description || '').length > 220 ? '…' : ''}</div></li>`).join('')}</ul>`;
  }

  // ---------- PARTY PAGE ----------
  function pageParty() {
    const id = qs('id'); const p = partyById[id];
    const root = $('#party');
    if (!p) { root.innerHTML = `<h1>Party not found</h1><p class="sub">No party with id “${esc(id)}”.</p><p>${D.parties.map(x => `<a href="party.html?id=${esc(x.id)}">${esc(x.abbr || x.names.fr)}</a>`).join(' · ')}</p>`; return; }
    document.title = `${p.abbr || p.names.fr} — Moroccan political scene`;
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

    root.innerHTML = `
      <div class="pill-row">${[p.family, p.position, p.status].filter(Boolean).map(x => `<span class="chip">${esc(x)}</span>`).join('')}${inGov ? '<span class="chip stance stance-support">in government</span>' : (last.seats ? '<span class="chip">opposition</span>' : '')}</div>
      <h1><span class="swatch" style="background:${partyColor(p.id)};width:16px;height:16px;border-radius:4px;vertical-align:-1px"></span> ${esc(p.names.fr)} ${p.abbr ? `(${esc(p.abbr)})` : ''}</h1>
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
      <div class="leaders">${(p.leaders || []).map(l => `<div class="leader"><b>${esc(l.name)}</b><span class="muted">${esc(l.from || '?')} → ${esc(l.to || 'present')}</span>${l.note ? `<div class="small">${esc(l.note)}</div>` : ''}</div>`).join('') || '<p class="muted">No leader data.</p>'}</div>
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
        ${res.length ? `<div class="table-scroll" style="margin-top:12px"><table><thead><tr><th>Party</th><th class="num">Votes</th><th class="num">%</th><th class="num">Seats</th><th class="num">Change</th><th>Conf.</th><th>Notes</th></tr></thead><tbody>${res.map(r => `<tr><td>${partyLink(r.party_id)}</td><td class="num">${fmt(r.votes)}</td><td class="num">${fmtPct(r.pct)}</td><td class="num">${fmt(r.seats)}</td><td class="num">${r.seat_change == null ? '—' : (r.seat_change > 0 ? '+' : '') + r.seat_change}</td><td>${confChip(r.confidence)}</td><td class="small muted">${esc(r.notes || '')}</td></tr>`).join('')}</tbody></table></div>` : ''}
        ${e.outcome ? `<p class="small"><b>Outcome:</b> ${esc(e.outcome)}</p>` : ''}
        ${e.notes ? `<p class="small muted">${esc(e.notes)}</p>` : ''}
        ${sourcesHtml(e.sources)}</div></details>`;
    }).join('');
    els.forEach(e => { const c = document.getElementById('sb-' + e.id); if (c && e.seats_total) seatBar(e.results.filter(r => r.seats), e.seats_total, c); });
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
    } catch (err) { console.error(err); const m = $('main .wrap'); if (m) m.insertAdjacentHTML('afterbegin', `<div class="notice">Rendering error: ${esc(err.message)}. Run <code>python3 scripts/build.py</code> to regenerate data.js.</div>`); }
    matchMedia('(prefers-color-scheme: dark)').addEventListener('change', rerenderCharts);
  });
})();
