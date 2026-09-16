#!/usr/bin/env python3
"""Validate data/*.json against data/SCHEMA.md conventions and bundle into site/data.js.

Usage: python3 scripts/build.py [--strict]
"""
import json, sys, os, re, datetime, html

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DATA = os.path.join(ROOT, 'data')
OUT = os.path.join(ROOT, 'site', 'data.js')
STRICT = '--strict' in sys.argv
errors, warnings = [], []
ISO = re.compile(r'^\d{4}(-\d{2}(-\d{2})?)?$')
STANCES = {'support', 'oppose', 'conditional', 'mixed', 'abstain', 'silent', 'boycott', 'split'}
CONF = {'high', 'medium', 'low'}


def load(name):
    p = os.path.join(DATA, name)
    if not os.path.exists(p):
        errors.append(f'missing {name}')
        return []
    with open(p, encoding='utf-8') as f:
        return json.load(f)


def check_date(v, ctx, required=False):
    if v in (None, ''):
        if required:
            errors.append(f'{ctx}: missing date')
        return
    if not ISO.match(str(v)):
        errors.append(f'{ctx}: bad date {v!r}')


def check_conf(v, ctx):
    if v is not None and v not in CONF:
        errors.append(f'{ctx}: bad confidence {v!r}')


def main():
    parties = load('parties.json'); elections = load('elections.json'); events = load('events.json'); govs = load('governments.json')
    gm = load('global-metrics.json') if os.path.exists(os.path.join(DATA, 'global-metrics.json')) else {}
    ids = set()
    for p in parties:
        ctx = f"party {p.get('id')}"
        for k in ('id', 'names', 'status'):
            if not p.get(k):
                errors.append(f'{ctx}: missing {k}')
        if not p.get('founded'):
            warnings.append(f'{ctx}: missing founded')
        if p.get('id') in ids:
            errors.append(f'{ctx}: duplicate id')
        ids.add(p.get('id'))
        check_date(p.get('founded'), ctx)
        for l in p.get('leaders', []):
            check_date(l.get('from'), f'{ctx} leader {l.get("name")}'); check_date(l.get('to'), f'{ctx} leader {l.get("name")}')
        for t in p.get('timeline', []):
            check_date(t.get('date'), f'{ctx} timeline {t.get("title")}', required=True)
            if not t.get('sources'):
                warnings.append(f'{ctx} timeline "{t.get("title")}": no sources')
        for a in p.get('achievements', []):
            check_conf(a.get('confidence'), f'{ctx} achievement {a.get("title")}')
        check_conf((p.get('data_quality') or {}).get('confidence'), ctx)
    labels = load('labels.json') if os.path.exists(os.path.join(DATA, 'labels.json')) else {}
    known = ids | set(labels) | {'other', 'independents', 'none', 'technocrat', 'sans-appartenance'}

    def ref(pid, ctx):
        if pid not in known:
            (errors if STRICT else warnings).append(f'{ctx}: unknown party id {pid!r}')

    eids = set()
    for e in elections:
        ctx = f"election {e.get('id')}"
        if e.get('id') in eids:
            errors.append(f'{ctx}: duplicate id')
        eids.add(e.get('id'))
        check_date(e.get('date'), ctx, required=True)
        check_conf(e.get('confidence'), ctx)
        total = 0
        for r in e.get('results', []):
            ref(r.get('party_id'), ctx)
            check_conf(r.get('confidence'), f'{ctx} {r.get("party_id")}')
            total += r.get('seats') or 0
        if e.get('seats_total') and e.get('results') and total > e['seats_total']:
            errors.append(f'{ctx}: results seats {total} exceed seats_total {e["seats_total"]}')
        if e.get('seats_total') and e.get('results') and total < e['seats_total'] * 0.9 and e.get('type') == 'legislative':
            warnings.append(f'{ctx}: results seats {total} well below seats_total {e["seats_total"]} (check notes explain the gap)')
        if not e.get('sources'):
            warnings.append(f'{ctx}: no sources')
    evids = set()
    for ev in events:
        ctx = f"event {ev.get('id')}"
        if ev.get('id') in evids:
            errors.append(f'{ctx}: duplicate id')
        evids.add(ev.get('id'))
        check_date(ev.get('date'), ctx, required=True)
        check_conf(ev.get('confidence'), ctx)
        if not ev.get('sources'):
            warnings.append(f'{ctx}: no sources')
        seen = set()
        for pos in ev.get('positions', []):
            ref(pos.get('party_id'), ctx)
            if pos.get('party_id') in seen:
                errors.append(f'{ctx}: duplicate position for {pos.get("party_id")}')
            seen.add(pos.get('party_id'))
            if pos.get('stance') not in STANCES:
                errors.append(f'{ctx} {pos.get("party_id")}: bad stance {pos.get("stance")!r}')
            check_conf(pos.get('confidence'), f'{ctx} {pos.get("party_id")}')
            if not pos.get('sources'):
                warnings.append(f'{ctx} {pos.get("party_id")}: position has no sources')
    for g in govs:
        ctx = f"government {g.get('id')}"
        check_date(g.get('from'), ctx, required=True); check_date(g.get('to'), ctx)
        ref(g.get('pm_party'), ctx)
        for c in g.get('coalition', []):
            ref(c, ctx)

    meth = os.path.join(ROOT, 'docs', 'METHODOLOGY.md')
    meth_html = ''
    if os.path.exists(meth):
        meth_html = md_to_html(open(meth, encoding='utf-8').read())
    bundle = {
        'meta': {'generated_at': datetime.date.today().isoformat(), 'methodology_html': meth_html,
                 'counts': {'parties': len(parties), 'elections': len(elections), 'events': len(events), 'governments': len(govs)}},
        'parties': parties, 'elections': elections, 'events': events, 'governments': govs, 'global_metrics': gm, 'labels': labels,
    }
    for w in warnings:
        print('WARN', w)
    for e in errors:
        print('ERROR', e)
    print(f'{len(parties)} parties, {len(elections)} elections, {len(events)} events, {len(govs)} governments; {len(errors)} errors, {len(warnings)} warnings')
    if errors:
        sys.exit(1)
    with open(OUT, 'w', encoding='utf-8') as f:
        f.write('window.DATA = ' + json.dumps(bundle, ensure_ascii=False) + ';\n')
    print('wrote', OUT)


def md_to_html(md):
    out, in_list = [], False
    for line in md.splitlines():
        s = line.rstrip()
        if s.startswith('- '):
            if not in_list:
                out.append('<ul>'); in_list = True
            out.append('<li>' + inline(s[2:]) + '</li>'); continue
        if in_list:
            out.append('</ul>'); in_list = False
        if s.startswith('# '):
            out.append('<h2>' + inline(s[2:]) + '</h2>')
        elif s.startswith('## '):
            out.append('<h3>' + inline(s[3:]) + '</h3>')
        elif s.startswith('### '):
            out.append('<h4>' + inline(s[4:]) + '</h4>')
        elif s:
            out.append('<p>' + inline(s) + '</p>')
    if in_list:
        out.append('</ul>')
    return '\n'.join(out)


def inline(s):
    s = html.escape(s)
    s = re.sub(r'\*\*(.+?)\*\*', r'<b>\1</b>', s)
    s = re.sub(r'`(.+?)`', r'<code>\1</code>', s)
    s = re.sub(r'\[(.+?)\]\((https?://[^)]+)\)', r'<a href="\2" target="_blank" rel="noopener">\1</a>', s)
    s = re.sub(r'(?<!["=>])(https?://[^\s<]+)', r'<a href="\1" target="_blank" rel="noopener">\1</a>', s)
    return s


if __name__ == '__main__':
    main()
