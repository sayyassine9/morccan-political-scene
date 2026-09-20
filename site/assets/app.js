/* Ntikhabat — The Match-Day Table.
   Comparison-first front-end. Four pages: compare (index), party, record, method.
   Direction contract: .impeccable/surfaces/site-index-html.md */
(function () {
  'use strict';

  const D = window.DATA || {};
  const PARTIES = D.parties || [];
  const EVENTS = D.events || [];
  const ELECTIONS = D.elections || [];
  const GOVS = D.governments || [];
  const MEDIA = D.media || [];
  const LABELS = D.labels || {};
  const PROSE = D.prose || {};
  const DIMS = D.policy_dimensions || [];
  const POSITIONS = D.policy_positions || [];
  const PROGRAMMES = D.programmes || {};

  /* Set by whichever page is active; re-run when the reader switches language, because
     prose() resolves translations at render time. */
  let rerenderPage = null;

  const $ = (s, r) => (r || document).querySelector(s);
  const $$ = (s, r) => Array.from((r || document).querySelectorAll(s));
  const cssVar = (n) => getComputedStyle(document.documentElement).getPropertyValue(n).trim();
  const esc = (s) => String(s == null ? '' : s).replace(/[&<>"']/g, (c) =>
    ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

  /* ------------------------------------------------------------ prose i18n */
  /* Twin of key_of() in scripts/translate.py. Must stay byte-identical. */
  function proseKey(s) {
    const bytes = new TextEncoder().encode(String(s).trim());
    let h1 = 2166136261, h2 = 5381;
    for (const b of bytes) {
      h1 = Math.imul(h1 ^ b, 16777619) >>> 0;
      h2 = (((Math.imul(h2, 33) >>> 0) ^ b) >>> 0);
    }
    return (h1 >>> 0).toString(16).padStart(8, '0') + (h2 >>> 0).toString(16).padStart(8, '0');
  }
  const currentLang = () => {
    try { return localStorage.getItem('language') || 'en'; } catch (e) { return 'en'; }
  };
  /* Renders data-bank prose in the reader's language when a translation exists.
     When it does not, the source text ships with an explicit language marker rather
     than silently presenting English inside an Arabic interface. */
  function prose(text) {
    if (!text) return '';
    const lang = currentLang();
    if (lang === 'en') return esc(text);
    const cat = PROSE[lang];
    const hit = cat && cat[proseKey(text)];
    if (hit) return esc(hit);
    return `<span class="untranslated"><span class="src-lang">EN</span>${esc(text)}</span>`;
  }

  /* ------------------------------------------------------------ icons */
  /* Authored, one stroke weight (1.75), one 20-unit box. */
  const ico = (d, extra) => `<svg viewBox="0 0 20 20" width="${(extra && extra.size) || 16}" height="${(extra && extra.size) || 16}" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${d}</svg>`;
  const ICONS = {
    brand: '<svg viewBox="0 0 20 20" width="22" height="22" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" aria-hidden="true"><path d="M3 4h14M3 4v12M10 4v12M17 4v12M3 16h14M3 9h14M3 12.5h14"/></svg>',
    strong: ico('<path d="M2.5 10.5l3 3 6.5-7"/><path d="M9 13.5l2 2 6.5-7"/>'),
    single: ico('<circle cx="10" cy="10" r="6.5"/><circle cx="10" cy="10" r="1.6" fill="currentColor" stroke="none"/>'),
    disputed: ico('<circle cx="10" cy="10" r="6.5"/><path d="M10 3.5v13"/><path d="M10 10l5-4"/>'),
    absent: ico('<circle cx="10" cy="10" r="6.5" stroke-dasharray="2.6 2.6"/>'),
    search: ico('<circle cx="9" cy="9" r="5.5"/><path d="M13.2 13.2L17 17"/>'),
    close: ico('<path d="M5 5l10 10M15 5L5 15"/>'),
    plus: ico('<path d="M10 4.5v11M4.5 10h11"/>', { size: 18 }),
    swap: ico('<path d="M4 7h12l-3-3M16 13H4l3 3"/>'),
  };

  /* ------------------------------------------------------------ party helpers */
  const byId = {};
  PARTIES.forEach((p) => { byId[p.id] = p; });
  const logoOf = (id) => MEDIA.find((m) => m.kind === 'logo' && m.party_id === id);
  const portraitOf = (name) => MEDIA.find((m) => m.kind === 'portrait' && m.person_name === name);

  /* Fixed slot per party: colour follows the entity, never rank, and is never that
     party's real brand colour. */
  const SLOT = { rni: 1, pam: 2, istiqlal: 3, usfp: 4, mp: 5, pps: 6, uc: 7, pjd: 8 };
  const colorOf = (id) => (SLOT[id] ? cssVar('--s' + SLOT[id]) : cssVar('--s-none'));
  const abbrOf = (id) => (byId[id] && (byId[id].abbr || byId[id].names.fr)) || LABELS[id] || id;
  const fullOf = (id) => (byId[id] && (byId[id].names.fr || byId[id].names.en)) || abbrOf(id);
  const nameInLang = (id) => {
    const p = byId[id];
    if (!p) return abbrOf(id);
    const lang = currentLang();
    if (lang === 'ary' && p.names.ar) return p.names.ar;
    if (lang === 'fr' && p.names.fr) return p.names.fr;
    return p.names.en || p.names.fr || abbrOf(id);
  };
  const yearOf = (d) => (d ? String(d).slice(0, 4) : '');
  const fmt = (n) => (n == null || isNaN(n) ? '—' : Number(n).toLocaleString('en-US'));
  const fmtPct = (n) => (n == null || isNaN(n) ? '—' : Number(n).toFixed(1) + '%');
  /* Numerals and mixed number+word phrases keep their own direction inside RTL text.
     Without isolation, "-1" renders as "1-" and "27.7% of the vote" reverses. */
  const bidi = (v) => `<bdi>${esc(v)}</bdi>`;
  const signed = (n) => `<bdi>${n > 0 ? '+' : n < 0 ? '\u2212' : ''}${Math.abs(n)}</bdi>`;

  const LEGS = ELECTIONS
    .filter((e) => e.type === 'legislative' && e.results && e.results.length)
    .sort((a, b) => a.date.localeCompare(b.date));
  const LATEST = LEGS[LEGS.length - 1];

  function logoMark(id, cls) {
    const m = logoOf(id);
    const color = colorOf(id);
    if (m) {
      return `<img class="logo ${cls || ''}" src="${esc(m.path)}" alt="" loading="lazy"
        onerror="this.outerHTML='<span class=&quot;logo-fallback ${cls || ''}&quot;>${esc(abbrOf(id).slice(0, 4))}</span>'">`;
    }
    return `<span class="logo-fallback ${cls || ''}" style="--col-color:${color}">${esc(abbrOf(id).slice(0, 4))}</span>`;
  }

  /* ------------------------------------------------------------ evidence */
  /* Four states derived only from what the data actually supports. Policy positions
     carry no confidence field, so strength comes from independent source count. */
  function evidenceOf(sources, extra) {
    const n = (sources || []).length;
    if (extra && extra.disputed) return 'disputed';
    if (n >= 2) return 'strong';
    if (n === 1) return 'single';
    return 'absent';
  }
  const EV_LABEL = {
    strong: 'corroborated',
    single: 'single source',
    disputed: 'disputed',
    absent: 'no evidence recorded',
  };
  function evidenceTag(state, n) {
    const count = state === 'strong' && n ? ` (${n})` : '';
    return `<span class="ev" data-state="${state}">${ICONS[state]}${EV_LABEL[state]}${count}</span>`;
  }
  function sourcesBlock(ids) {
    const list = ids || [];
    if (!list.length) return '';
    const reg = D.sources || {};
    const items = list.map((s) => {
      const rec = reg[s];
      const url = rec && (rec.url || rec.link);
      const title = (rec && (rec.title || rec.publisher)) || s;
      return url
        ? `<li><a href="${esc(url)}" target="_blank" rel="noopener">${esc(title)}</a></li>`
        : `<li>${esc(title)}</li>`;
    }).join('');
    return `<details class="sources"><summary>Sources (${list.length})</summary><ol>${items}</ol></details>`;
  }

  /* ------------------------------------------------------------ meter */
  /* The one magnitude variable in the system: a signed −2..+2 meter, identical
     everywhere a score appears. */
  function meter(score, color) {
    if (score == null) return '';
    const pct = (Math.abs(score) / 2) * 50;
    const side = score >= 0 ? 'inset-inline-start:50%' : `inset-inline-end:50%`;
    return `<span class="meter" style="--col-color:${color}">
      <span class="track"></span><span class="axis"></span>
      <span class="bar" style="${side};width:${pct}%"></span>
    </span>`;
  }

  /* ------------------------------------------------------------ theme + lang */
  function initChrome() {
    try {
      const t = localStorage.getItem('theme');
      if (t) document.documentElement.dataset.theme = t;
    } catch (e) {}
    const tb = $('#theme-toggle');
    if (tb) tb.addEventListener('click', () => {
      const cur = document.documentElement.dataset.theme ||
        (matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
      const next = cur === 'dark' ? 'light' : 'dark';
      document.documentElement.dataset.theme = next;
      try { localStorage.setItem('theme', next); } catch (e) {}
      rerenderCharts();
    });
    const page = document.body.dataset.page;
    $$('header.top nav a').forEach((a) => {
      if (a.dataset.page === page) { a.classList.add('active'); a.setAttribute('aria-current', 'page'); }
    });
    const gen = $('#generated');
    if (gen && D.meta) gen.textContent = D.meta.generated_at || '';
  }

  /* ------------------------------------------------------------ charts */
  const charts = [];
  function chartDefaults() {
    if (!window.Chart) return;
    Chart.defaults.font.family = "'Tajawal', system-ui, sans-serif";
    Chart.defaults.font.size = 12;
    Chart.defaults.color = cssVar('--muted');
    Chart.defaults.borderColor = cssVar('--rule');
    Chart.defaults.plugins.legend.display = false;
    Chart.defaults.plugins.tooltip.backgroundColor = cssVar('--surface');
    Chart.defaults.plugins.tooltip.titleColor = cssVar('--ink');
    Chart.defaults.plugins.tooltip.bodyColor = cssVar('--ink-2');
    Chart.defaults.plugins.tooltip.borderColor = cssVar('--rule-strong');
    Chart.defaults.plugins.tooltip.borderWidth = 1;
    Chart.defaults.elements.bar.borderRadius = { topLeft: 3, topRight: 3 };
    Chart.defaults.elements.bar.borderSkipped = 'start';
    Chart.defaults.maxBarThickness = 26;
    Chart.defaults.interaction = { mode: 'index', intersect: false };
  }
  /* Every axis is titled. An unlabelled axis is a defect, not a style. */
  const axis = (title, extra) => Object.assign({
    grid: { color: cssVar('--rule'), lineWidth: 1 },
    border: { color: cssVar('--rule-strong') },
    ticks: { color: cssVar('--muted') },
    title: title ? { display: true, text: title, color: cssVar('--ink-2'), font: { weight: 700, size: 12 } } : { display: false },
  }, extra || {});
  function makeChart(id, build) {
    const el = document.getElementById(id);
    if (!el || !window.Chart) return;
    const entry = { el, build, chart: null };
    charts.push(entry);
    chartDefaults();
    entry.chart = new Chart(el.getContext('2d'), entry.build());
  }
  function rerenderCharts() {
    chartDefaults();
    charts.forEach((e) => { if (e.chart) e.chart.destroy(); e.chart = new Chart(e.el.getContext('2d'), e.build()); });
  }

  /* ============================================================ COMPARE */
  /* The 9 parties with policy or programme evidence. Comparison is meaningful for
     these; every other party is still selectable and its gaps are stated plainly. */
  const posByParty = {};
  POSITIONS.forEach((p) => {
    (posByParty[p.party_id] = posByParty[p.party_id] || {})[p.dimension_id] = p;
  });
  const claimsByParty = {};
  (PROGRAMMES.claims || []).forEach((c) => {
    (claimsByParty[c.party_id] = claimsByParty[c.party_id] || []).push(c);
  });
  const COMPARABLE = PARTIES.filter((p) => posByParty[p.id] || claimsByParty[p.id]).map((p) => p.id);

  function seatsIn(election, pid) {
    const r = ((election && election.results) || []).find((x) => x.party_id === pid);
    return r || null;
  }
  function inGovernmentNow(pid) {
    const sorted = GOVS.slice().sort((a, b) => (a.from || '').localeCompare(b.from || ''));
    const last = sorted[sorted.length - 1];
    if (!last) return null;
    const members = (last.coalition || []).map((c) => (typeof c === 'string' ? c : c.party_id));
    return { gov: last, member: members.indexOf(pid) !== -1, pm: last.pm_party === pid };
  }
  /* Form guide: the last five legislative elections, as finishing position. This shows
     what happened; it never implies which party is better. */
  function formGuide(pid) {
    return LEGS.slice(-5).map((e) => {
      const ranked = (e.results || []).slice().sort((a, b) => (b.seats || 0) - (a.seats || 0));
      const idx = ranked.findIndex((r) => r.party_id === pid);
      const rec = idx >= 0 ? ranked[idx] : null;
      let rank = 'absent';
      if (idx === 0) rank = '1';
      else if (idx > -1 && idx < 3) rank = 'top3';
      else if (idx > -1) rank = 'ran';
      return { year: yearOf(e.date), rank, seats: rec ? rec.seats : null, place: idx >= 0 ? idx + 1 : null };
    });
  }

  function pageCompare() {
    const root = $('#compare');
    if (!root) return;
    const MAXP = 3;
    let picked = [];
    try {
      const saved = JSON.parse(localStorage.getItem('compare') || '[]');
      picked = saved.filter((id) => byId[id]).slice(0, MAXP);
    } catch (e) {}
    const fromUrl = (new URLSearchParams(location.search).get('parties') || '')
      .split(',').filter((id) => byId[id]);
    if (fromUrl.length) picked = fromUrl.slice(0, MAXP);
    if (!picked.length) picked = COMPARABLE.slice(0, 2);

    const persist = () => {
      try { localStorage.setItem('compare', JSON.stringify(picked)); } catch (e) {}
      const u = new URL(location.href);
      u.searchParams.set('parties', picked.join(','));
      history.replaceState(null, '', u);
    };

    /* ---- party chooser dialog ---- */
    const dlg = document.createElement('dialog');
    dlg.className = 'chooser';
    dlg.innerHTML = `
      <form method="dialog" class="chooser-head">
        <label class="chip" style="gap:7px">${ICONS.search}<span class="sr-only">Search</span></label>
        <input class="field" id="chooser-q" type="search" placeholder="Search a party by name or initials" autocomplete="off">
        <button class="btn" value="cancel" aria-label="Close">${ICONS.close}</button>
      </form>
      <div class="chooser-list" id="chooser-list" role="listbox"></div>`;
    document.body.appendChild(dlg);
    let targetIndex = 0;

    function renderChooser(q) {
      const term = (q || '').trim().toLowerCase();
      const match = PARTIES.filter((p) => {
        if (!term) return true;
        const hay = [p.abbr, p.names.fr, p.names.en, p.names.ar, p.id].join(' ').toLowerCase();
        return hay.indexOf(term) !== -1;
      });
      /* Parties with comparable evidence lead; the rest remain reachable. */
      const withEv = match.filter((p) => COMPARABLE.indexOf(p.id) !== -1);
      const without = match.filter((p) => COMPARABLE.indexOf(p.id) === -1);
      const row = (p) => {
        const already = picked.indexOf(p.id) !== -1;
        const ev = COMPARABLE.indexOf(p.id) !== -1;
        return `<button class="chooser-item" role="option" data-id="${esc(p.id)}"
          ${already ? 'aria-disabled="true" disabled' : ''}>
          ${logoMark(p.id)}
          <span style="min-width:0">
            <span style="font-weight:800;display:block">${esc(p.abbr || p.names.fr)}</span>
            <span class="micro muted" style="display:block;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${esc(p.names.fr || '')}</span>
          </span>
          <span class="micro muted" style="margin-inline-start:auto;text-align:end">
            ${already ? 'selected' : ev ? 'positions on file' : 'record only'}
          </span>
        </button>`;
      };
      const html = (withEv.length ? withEv.map(row).join('') : '') +
        (without.length ? `<div class="micro muted" style="padding:10px 10px 4px;font-weight:700;text-transform:uppercase;letter-spacing:.06em">Record only — no policy positions on file</div>${without.map(row).join('')}` : '');
      $('#chooser-list').innerHTML = html ||
        `<div class="chooser-empty">No party matches “${esc(q)}”.</div>`;
    }
    $('#chooser-q', dlg).addEventListener('input', (e) => renderChooser(e.target.value));
    $('#chooser-list', dlg).addEventListener('click', (e) => {
      const b = e.target.closest('.chooser-item');
      if (!b || b.disabled) return;
      if (targetIndex >= picked.length) picked.push(b.dataset.id);
      else picked[targetIndex] = b.dataset.id;
      persist(); dlg.close(); render();
    });
    function openChooser(i) {
      targetIndex = i;
      $('#chooser-q', dlg).value = '';
      renderChooser('');
      dlg.showModal();
      $('#chooser-q', dlg).focus();
    }

    /* ---- comparison rows ---- */
    function rowsFor(ids) {
      const rows = [];
      const push = (label, hint, cells, opts) => rows.push(Object.assign({ label, hint, cells }, opts || {}));

      rows.push({ group: 'Identity' });
      push('Founded', null, ids.map((id) => {
        const p = byId[id];
        return { value: p && p.founded ? yearOf(p.founded) : '—' };
      }));
      push('Current leader', null, ids.map((id) => {
        const p = byId[id];
        return { value: (p && p.current_leader && p.current_leader.name) || '—', small: true };
      }));
      push('Ideology', null, ids.map((id) => {
        const p = byId[id];
        const tags = (p && p.ideology) || [];
        return { html: tags.length ? `<div class="tags">${tags.slice(0, 4).map((t) => `<span class="chip">${esc(t)}</span>`).join('')}</div>` : '—' };
      }));

      rows.push({ group: 'Record' });
      push('Seats', LATEST ? `${yearOf(LATEST.date)} general election` : null, ids.map((id) => {
        const r = seatsIn(LATEST, id);
        return {
          html: `<div class="cmp-value">${bidi(r ? fmt(r.seats) : '0')}</div>
            <div class="cmp-sub">${r && r.pct != null ? bidi(fmtPct(r.pct) + ' of the vote') : 'no seats won'}</div>`,
        };
      }));
      push('In government', 'the government sitting now', ids.map((id) => {
        const g = inGovernmentNow(id);
        return {
          value: g ? (g.pm ? 'Leads it' : g.member ? 'Yes' : 'No') : '—',
          sub: g && g.gov ? esc(g.gov.name || '') : '',
          small: true,
        };
      }));
      push('Governments led', 'since 1955', ids.map((id) => ({
        value: fmt(GOVS.filter((g) => g.pm_party === id).length),
      })));

      rows.push({ group: 'Where they stand' });
      const skipped = [];
      DIMS.forEach((d) => {
        const anyEvidence = ids.some((id) => (posByParty[id] || {})[d.id]);
        push(d.label, null, ids.map((id) => {
          const o = (posByParty[id] || {})[d.id];
          if (!o) return { html: `<span class="ev" data-state="absent">${ICONS.absent}${EV_LABEL.absent}</span>` };
          const state = evidenceOf(o.sources);
          const color = colorOf(id);
          return {
            html: `<div class="cmp-value">${signed(o.score)}</div>
              ${meter(o.score, color)}
              <div class="meter-scale"><span>${esc(d.low || '')}</span><span>${esc(d.high || '')}</span></div>
              <div class="cmp-sub">${prose(o.note || '')}</div>
              ${evidenceTag(state, (o.sources || []).length)}
              ${o.date || o.scope ? `<div class="micro muted" style="margin-block-start:4px">${esc(o.scope || '')}${o.scope && o.date ? ' · ' : ''}${esc(o.date || '')}</div>` : ''}
              ${sourcesBlock(o.sources)}`,
          };
        }), { empty: !anyEvidence });
      });

      /* Rows where no selected party has any evidence are withheld and counted, rather
         than padding the table with identical empty cells. */
      for (let i = rows.length - 1; i >= 0; i--) {
        if (rows[i].empty) { skipped.push(rows[i].label); rows.splice(i, 1); }
      }
      if (skipped.length) {
        rows.push({ note: `${skipped.length} more ${skipped.length === 1 ? 'dimension has' : 'dimensions have'} no evidence on file for ${ids.length > 1 ? 'either party' : 'this party'}: ${skipped.reverse().join(', ')}.` });
      }

      rows.push({ group: '2026 programme' });
      const topics = Array.from(new Set(ids.flatMap((id) => (claimsByParty[id] || []).map((c) => c.topic)).filter(Boolean))).sort();
      if (!topics.length) {
        push('Commitments', null, ids.map(() => ({ html: `<span class="ev" data-state="absent">${ICONS.absent}${EV_LABEL.absent}</span>` })));
      }
      topics.forEach((topic) => {
        push(topic, null, ids.map((id) => {
          const cs = (claimsByParty[id] || []).filter((c) => c.topic === topic);
          if (!cs.length) return { html: `<span class="ev" data-state="absent">${ICONS.absent}${EV_LABEL.absent}</span>` };
          return {
            html: cs.map((c) => `
              <div style="margin-block-end:8px">
                <div style="font-weight:800">${prose(c.title || c.promise || '')}</div>
                ${c.method ? `<div class="cmp-sub">${prose(c.method)}</div>` : ''}
                ${c.deadline ? `<div class="micro muted">by ${esc(c.deadline)}</div>` : ''}
                ${c.definition ? `<div class="counter"><b>What this does not mean</b>${prose(c.definition)}</div>` : ''}
                ${evidenceTag(evidenceOf(c.sources), (c.sources || []).length)}
                ${sourcesBlock(c.sources)}
              </div>`).join(''),
          };
        }));
      });
      return rows;
    }

    function render() {
      const ids = picked.slice(0, MAXP);
      const cols = Math.max(ids.length, 1);
      const cmpCols = `--cols:${cols};grid-template-columns:minmax(118px,0.78fr) repeat(${cols},minmax(0,1fr))`;

      /* picker */
      const slots = [];
      for (let i = 0; i < MAXP; i++) {
        const id = ids[i];
        if (id) {
          slots.push(`<button class="slot" data-i="${i}" style="--slot-color:${colorOf(id)}">
            <span class="field-mark"></span>${logoMark(id)}
            <span class="who"><span class="abbr">${esc(abbrOf(id))}</span>
            <span class="full">${esc(nameInLang(id))}</span></span>
            <span class="drop" data-remove="${i}" role="button" tabindex="0" aria-label="Remove ${esc(abbrOf(id))}">${ICONS.close}</span>
          </button>`);
        } else {
          slots.push(`<button class="slot empty" data-i="${i}">${ICONS.plus}<span style="margin-inline-start:8px">Add a party</span></button>`);
        }
      }

      if (!ids.length) {
        root.innerHTML = `<div class="picker"><div class="picker-slots">${slots.join('')}</div></div>
          <div class="empty-state"><h3>Pick two parties to begin</h3>
          <p class="hint">Choose any two — or three — and this page puts their record, their positions and their 2026 promises side by side, with the sources for each.</p></div>`;
      } else {
        const rows = rowsFor(ids);
        const rowHtml = rows.map((r) => {
          if (r.group) {
            return `<div class="cmp-row group-head"><div class="cmp-label"><bdi>${esc(r.group)}</bdi></div></div>`;
          }
          if (r.note) {
            return `<div class="cmp-row"><div class="cmp-label" style="grid-column:1/-1;background:none;border:none;font-weight:400;font-size:13px;color:var(--muted)"><bdi>${esc(r.note)}</bdi></div></div>`;
          }
          const cells = r.cells.map((c) => `<div class="cmp-cell">${
            c.html != null ? c.html :
            `<div class="${c.small ? 'cmp-sub' : 'cmp-value'}">${esc(c.value)}</div>${c.sub ? `<div class="cmp-sub">${c.sub}</div>` : ''}`
          }</div>`).join('');
          return `<div class="cmp-row" style="${cmpCols}"><div class="cmp-label"><bdi>${esc(r.label)}</bdi>${r.hint ? `<span class="hint"><bdi>${esc(r.hint)}</bdi></span>` : ''}</div>${cells}</div>`;
        }).join('');

        const heads = ids.map((id) => {
          const fg = formGuide(id);
          return `<div class="h2h-col" style="--col-color:${colorOf(id)}">
            ${logoMark(id)}
            <div class="name">${esc(abbrOf(id))}</div>
            <div class="full">${esc(nameInLang(id))}</div>
            <div class="form-guide" role="img" aria-label="Finishing position in the last ${fg.length} general elections">
              ${fg.map((f) => `<span class="fg" data-rank="${f.rank}" title="${esc(f.year)}: ${f.place ? 'placed ' + f.place + ' with ' + f.seats + ' seats' : 'no seats'}">${esc(f.year.slice(2))}</span>`).join('')}
              <span class="fg-label">last ${fg.length} elections</span>
            </div>
          </div>`;
        }).join('');

        root.innerHTML = `
          <div class="picker"><div class="picker-slots">${slots.join('')}</div></div>
          <div class="h2h" style="margin-block-start:16px">
            <div class="h2h-head" style="${cmpCols}"><div class="h2h-spacer"></div>${heads}</div>
            <div class="cmp">${rowHtml}</div>
          </div>
          <p class="micro muted" style="margin-block-start:10px">
            Colours identify parties and are fixed per party; they are not any party's own colours and carry no ranking.
            Positions are editorial codings of dated statements and programmes, scored −2 to +2.
          </p>`;
      }

      root.querySelectorAll('.slot').forEach((b) => {
        b.addEventListener('click', (e) => {
          const rm = e.target.closest('[data-remove]');
          if (rm) { e.stopPropagation(); picked.splice(+rm.dataset.remove, 1); persist(); render(); return; }
          openChooser(+b.dataset.i);
        });
      });
    }
    rerenderPage = render;
    render();
  }

  /* ============================================================ PARTY */
  function pageParty() {
    const root = $('#party');
    if (!root) return;
    const id = new URLSearchParams(location.search).get('id');
    const p = byId[id];
    if (!p) {
      root.innerHTML = `<div class="empty-state"><h3>No such party</h3>
        <p class="hint">That party id is not in the data bank.</p>
        <p><a class="btn" href="index.html">Go to the comparison</a></p></div>`;
      return;
    }
    const color = colorOf(p.id);
    const r = seatsIn(LATEST, p.id);
    const fg = formGuide(p.id);
    const positions = posByParty[p.id] || {};
    const claims = claimsByParty[p.id] || [];
    const evPositions = EVENTS.filter((e) => (e.positions || []).some((x) => x.party_id === p.id));

    document.title = `${p.abbr || p.names.fr} — Ntikhabat`;

    const section = (title, body, note) => !body ? '' : `
      <section><div class="section-head"><h2>${esc(title)}</h2>${note ? `<span class="note">${esc(note)}</span>` : ''}</div>${body}</section>`;

    root.innerHTML = `
      <div class="h2h" style="--col-color:${color}">
        <div class="h2h-head" style="grid-template-columns:1fr">
          <div class="h2h-col" style="--col-color:${color}">
            ${logoMark(p.id)}
            <h1 class="name">${esc(p.abbr || p.names.fr)}</h1>
            <div class="full">${esc(nameInLang(p.id))}</div>
            <div class="form-guide" role="img" aria-label="Finishing position in the last ${fg.length} general elections">
              ${fg.map((f) => `<span class="fg" data-rank="${f.rank}" title="${esc(f.year)}: ${f.place ? 'placed ' + f.place : 'no seats'}">${esc(f.year.slice(2))}</span>`).join('')}
              <span class="fg-label">last ${fg.length} elections</span>
            </div>
          </div>
        </div>
        <div class="cmp">
          <div class="cmp-row" style="grid-template-columns:repeat(3,minmax(0,1fr))">
            <div class="cmp-cell"><div class="cmp-value">${r ? fmt(r.seats) : '0'}</div><div class="cmp-sub">seats in ${LATEST ? yearOf(LATEST.date) : ''}</div></div>
            <div class="cmp-cell"><div class="cmp-value">${r && r.pct != null ? fmtPct(r.pct) : '—'}</div><div class="cmp-sub">of the vote</div></div>
            <div class="cmp-cell"><div class="cmp-value">${p.founded ? yearOf(p.founded) : '—'}</div><div class="cmp-sub">founded</div></div>
          </div>
        </div>
      </div>
      <p style="margin-block-start:14px">
        <a class="btn on" href="index.html?parties=${esc(p.id)}">${ICONS.swap} Compare ${esc(p.abbr || '')} with another party</a>
      </p>

      ${p.founding_context ? section('Origin', `<div class="card prose">${prose(p.founding_context)}</div>`) : ''}

      ${Object.keys(positions).length ? section('Where they stand',
        `<div class="grid two">${DIMS.map((d) => {
          const o = positions[d.id];
          if (!o) return '';
          return `<div class="card" style="--col-color:${color}">
            <h3>${esc(d.label)}</h3>
            <div class="cmp-value">${signed(o.score)}</div>
            ${meter(o.score, color)}
            <div class="meter-scale"><span>${esc(d.low || '')}</span><span>${esc(d.high || '')}</span></div>
            <div class="cmp-sub">${prose(o.note || '')}</div>
            ${evidenceTag(evidenceOf(o.sources), (o.sources || []).length)}
            ${sourcesBlock(o.sources)}</div>`;
        }).join('')}</div>`,
        `${Object.keys(positions).length} of ${DIMS.length} dimensions on file`) : ''}

      ${claims.length ? section('2026 commitments',
        `<div class="grid two">${claims.map((c) => `<div class="card">
          <h3>${prose(c.title || c.promise || '')}</h3>
          ${c.method ? `<p class="cmp-sub">${prose(c.method)}</p>` : ''}
          ${c.definition ? `<div class="counter"><b>What this does not mean</b>${prose(c.definition)}</div>` : ''}
          ${evidenceTag(evidenceOf(c.sources), (c.sources || []).length)}
          ${sourcesBlock(c.sources)}</div>`).join('')}</div>`) : ''}

      ${(p.achievements || []).length ? section('Claims and what supports them',
        `<div class="stack">${p.achievements.map((a) => `<div class="card">
          <div style="font-weight:800">${prose(a.claim || '')}</div>
          <div class="counter"><b>Independent verification</b>${a.verification ? prose(a.verification) : 'No independent source on file for this claim.'}</div>
          ${evidenceTag(a.verification ? 'single' : 'absent')}</div>`).join('')}</div>`,
        'party claims, paired with what independent sources support') : ''}

      ${(p.leaders || []).length ? section('Leadership',
        `<div class="grid three">${p.leaders.map((l) => {
          const por = portraitOf(l.name);
          return `<div class="card" style="display:flex;gap:11px;align-items:flex-start">
            ${por ? `<img class="logo" src="${esc(por.path)}" alt="" loading="lazy" style="width:46px;height:46px;border-radius:8px;object-fit:cover">` : ''}
            <div style="min-width:0"><div style="font-weight:800">${esc(l.name)}</div>
            <div class="micro muted">${esc(l.from || '')}${l.to ? '–' + esc(l.to) : l.from ? '–present' : ''}</div>
            ${l.note ? `<div class="cmp-sub">${prose(l.note)}</div>` : ''}</div></div>`;
        }).join('')}</div>`) : ''}

      ${(p.timeline || []).length ? section('Timeline',
        `<div class="card"><table><thead><tr><th>Date</th><th>Event</th></tr></thead><tbody>
        ${p.timeline.slice().sort((a, b) => String(a.date).localeCompare(String(b.date))).map((t) => `<tr>
          <td class="num" style="white-space:nowrap">${esc(t.date || '')}</td>
          <td><div style="font-weight:700">${prose(t.title || '')}</div>
          ${t.description ? `<div class="cmp-sub">${prose(t.description)}</div>` : ''}</td></tr>`).join('')}
        </tbody></table></div>`,
        `${p.timeline.length} entries`) : ''}

      ${evPositions.length ? section('Positions on major events',
        `<div class="stack">${evPositions.slice(0, 12).map((e) => {
          const x = e.positions.find((y) => y.party_id === p.id);
          return `<div class="card">
            <div class="micro muted">${esc(e.date || '')}</div>
            <div style="font-weight:800">${prose(e.title || '')}</div>
            <div class="chip" style="margin-block-start:6px">${esc(x.stance || '')}</div>
            <div class="cmp-sub">${prose(x.summary || '')}</div>
            ${evidenceTag(evidenceOf(x.sources), (x.sources || []).length)}
            ${sourcesBlock(x.sources)}</div>`;
        }).join('')}</div>`,
        `${evPositions.length} documented`) : ''}
    `;
  }

  /* ============================================================ RECORD */
  function pageRecord() {
    const root = $('#record');
    if (!root) return;
    const tabs = [
      { id: 'elections', label: 'Elections' },
      { id: 'governments', label: 'Governments' },
      { id: 'events', label: 'Events' },
    ];
    let tab = (location.hash || '').replace('#', '') || 'elections';
    if (!tabs.some((t) => t.id === tab)) tab = 'elections';

    function renderElections() {
      return `
        <div class="card chart-card">
          <h3>Seats won at each general election</h3>
          <div class="chart-wrap tall"><canvas id="c-seats"></canvas></div>
          <div id="legend-seats" class="legend"></div>
        </div>
        <div class="card chart-card" style="margin-block-start:14px">
          <h3>Turnout</h3>
          <div class="chart-wrap short"><canvas id="c-turnout"></canvas></div>
        </div>
        <div class="card" style="margin-block-start:14px"><div class="table-scroll"><table>
          <thead><tr><th>Election</th><th>Type</th><th class="num">Seats</th><th class="num">Turnout</th><th>Largest party</th></tr></thead>
          <tbody>${ELECTIONS.slice().sort((a, b) => b.date.localeCompare(a.date)).map((e) => {
            const top = (e.results || []).slice().sort((a, b) => (b.seats || 0) - (a.seats || 0))[0];
            return `<tr><td class="num">${esc(e.date)}</td><td>${esc(e.type || '')}</td>
              <td class="num">${e.seats_total != null ? fmt(e.seats_total) : '—'}</td>
              <td class="num">${e.turnout_pct != null ? fmtPct(e.turnout_pct) : '—'}</td>
              <td>${top ? `<a href="party.html?id=${esc(top.party_id)}">${esc(abbrOf(top.party_id))}</a> <span class="muted">${fmt(top.seats)}</span>` : '<span class="muted">no results on file</span>'}</td></tr>`;
          }).join('')}</tbody></table></div></div>`;
    }
    function renderGovernments() {
      return `<div class="card"><div class="table-scroll"><table>
        <thead><tr><th>From</th><th>Government</th><th>Prime minister's party</th><th>Coalition</th></tr></thead>
        <tbody>${GOVS.slice().sort((a, b) => (b.from || '').localeCompare(a.from || '')).map((g) => `
          <tr><td class="num" style="white-space:nowrap">${esc(g.from || '')}${g.to ? '–' + esc(g.to) : ''}</td>
          <td>${esc(g.name || '')}${g.pm ? `<div class="micro muted">${esc(g.pm)}</div>` : ''}</td>
          <td>${g.pm_party ? `<span class="chip"><span class="swatch" style="background:${colorOf(g.pm_party)}"></span>${esc(abbrOf(g.pm_party))}</span>` : '<span class="muted">—</span>'}</td>
          <td><div class="tags">${(g.coalition || []).map((c) => {
            const pid = typeof c === 'string' ? c : c.party_id;
            return `<span class="chip"><span class="swatch" style="background:${colorOf(pid)}"></span>${esc(abbrOf(pid))}</span>`;
          }).join('') || '<span class="muted">—</span>'}</div></td></tr>`).join('')}
        </tbody></table></div></div>`;
    }
    function renderEvents() {
      return `
        <div class="picker" style="margin-block-end:14px">
          <input class="field" id="ev-q" type="search" placeholder="Search events since 1944">
        </div>
        <div class="stack" id="ev-list"></div>`;
    }
    function drawEvents(q) {
      const term = (q || '').trim().toLowerCase();
      const list = EVENTS.slice().sort((a, b) => (b.date || '').localeCompare(a.date || ''))
        .filter((e) => !term || (e.title + ' ' + (e.description || '')).toLowerCase().indexOf(term) !== -1);
      const el = $('#ev-list');
      if (!el) return;
      if (!list.length) {
        el.innerHTML = `<div class="empty-state"><h3>Nothing matches “${esc(q)}”</h3>
          <p class="hint">Try a shorter term, or a year.</p></div>`;
        return;
      }
      el.innerHTML = list.slice(0, 60).map((e) => `
        <details class="card"><summary style="cursor:pointer;display:flex;gap:12px;align-items:baseline;flex-wrap:wrap">
          <span class="micro muted num" style="min-width:86px">${esc(e.date || '')}</span>
          <span style="font-weight:800;flex:1 1 260px">${prose(e.title || '')}</span>
          <span class="chip">${(e.positions || []).length} positions</span>
        </summary>
        <div style="margin-block-start:12px;border-block-start:1px solid var(--rule);padding-block-start:12px">
          <p class="prose">${prose(e.description || '')}</p>
          <div class="grid three">${(e.positions || []).map((x) => `
            <div class="card" style="background:var(--sunken)">
              <div style="font-weight:800;display:flex;gap:6px;align-items:center">
                <span class="swatch" style="background:${colorOf(x.party_id)}"></span>
                <a href="party.html?id=${esc(x.party_id)}">${esc(abbrOf(x.party_id))}</a></div>
              <div class="chip" style="margin-block-start:6px">${esc(x.stance || '')}</div>
              <div class="cmp-sub">${prose(x.summary || '')}</div>
              ${evidenceTag(evidenceOf(x.sources), (x.sources || []).length)}
              ${sourcesBlock(x.sources)}</div>`).join('')}</div>
        </div></details>`).join('');
    }

    function render() {
      root.innerHTML = `
        <div class="tags" style="margin-block-end:16px" role="tablist">
          ${tabs.map((t) => `<button class="btn" role="tab" aria-selected="${t.id === tab}" data-tab="${t.id}" ${t.id === tab ? 'aria-pressed="true"' : ''}>${esc(t.label)}</button>`).join('')}
        </div>
        <div id="record-body">${tab === 'elections' ? renderElections() : tab === 'governments' ? renderGovernments() : renderEvents()}</div>`;
      root.querySelectorAll('[data-tab]').forEach((b) => b.addEventListener('click', () => {
        tab = b.dataset.tab; location.hash = tab; render();
      }));
      if (tab === 'events') {
        drawEvents('');
        $('#ev-q').addEventListener('input', (e) => drawEvents(e.target.value));
      }
      if (tab === 'elections') drawElectionCharts();
    }

    function drawElectionCharts() {
      charts.length = 0;
      const top = Object.keys(SLOT);
      makeChart('c-seats', () => ({
        type: 'bar',
        data: {
          labels: LEGS.map((e) => yearOf(e.date)),
          datasets: top.map((pid) => ({
            label: abbrOf(pid),
            data: LEGS.map((e) => { const r = seatsIn(e, pid); return r ? r.seats : 0; }),
            backgroundColor: colorOf(pid),
          })),
        },
        options: {
          responsive: true, maintainAspectRatio: false,
          scales: {
            x: axis('General election', { stacked: true, grid: { display: false } }),
            y: axis('Seats in the House of Representatives', { stacked: true, beginAtZero: true }),
          },
        },
      }));
      $('#legend-seats').innerHTML = top.map((pid) =>
        `<span class="key"><span class="swatch" style="background:${colorOf(pid)}"></span>${esc(abbrOf(pid))}</span>`).join('');
      makeChart('c-turnout', () => ({
        type: 'line',
        data: {
          labels: LEGS.map((e) => yearOf(e.date)),
          datasets: [{
            label: 'Turnout', data: LEGS.map((e) => e.turnout_pct),
            borderColor: cssVar('--slate'), backgroundColor: 'transparent',
            borderWidth: 2, tension: 0.25, pointRadius: 3,
          }],
        },
        options: {
          responsive: true, maintainAspectRatio: false,
          scales: {
            x: axis('General election', { grid: { display: false } }),
            y: axis('Turnout (% of registered voters)', { min: 0, max: 100 }),
          },
        },
      }));
    }
    rerenderPage = render;
    render();
  }

  /* ============================================================ METHOD */
  function pageMethod() {
    const root = $('#method');
    if (!root) return;
    root.innerHTML = `<div class="card prose">${(D.meta && D.meta.methodology_html) || ''}</div>`;
  }

  /* ------------------------------------------------------------ boot */
  function boot() {
    initChrome();
    const page = document.body.dataset.page;
    if (page === 'compare') pageCompare();
    else if (page === 'party') { rerenderPage = pageParty; pageParty(); }
    else if (page === 'record') pageRecord();
    else if (page === 'method') pageMethod();
    document.addEventListener('ntk:languagechange', () => { if (rerenderPage) rerenderPage(); });
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();

  window.NTK = { rerenderCharts, COMPARABLE };
})();
