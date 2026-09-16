#!/usr/bin/env python3
"""Merge research working files in data/raw/ into the canonical data/*.json files.

- parties: data/raw/parties-group*.json (arrays) -> data/parties.json; metrics from data/raw/metrics.json
  are merged into each party's `metrics` (raw metrics win only for keys the party file lacks).
- elections: data/raw/elections.json -> data/elections.json
- events: data/raw/events.json -> data/events.json
- governments: data/raw/governments.json -> data/governments.json
Prints a report of unknown party ids so they can be added as stub parties.
"""
import json, glob, os, sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
RAW = os.path.join(ROOT, 'data', 'raw')
DATA = os.path.join(ROOT, 'data')


def load(path, default):
    if not os.path.exists(path):
        print('missing', path); return default
    with open(path, encoding='utf-8') as f:
        return json.load(f)


def dump(name, obj):
    with open(os.path.join(DATA, name), 'w', encoding='utf-8') as f:
        json.dump(obj, f, ensure_ascii=False, indent=1)
    print('wrote', name, len(obj))


def main():
    parties = {}
    for path in sorted(glob.glob(os.path.join(RAW, 'parties-group*.json'))):
        for p in load(path, []):
            if p['id'] in parties:
                print('duplicate party across files:', p['id'], '(keeping first)')
                continue
            parties[p['id']] = p
    metrics = load(os.path.join(RAW, 'metrics.json'), {})
    global_metrics = {k: v for k, v in metrics.items() if k.startswith('_')}
    with open(os.path.join(DATA, 'global-metrics.json'), 'w', encoding='utf-8') as f:
        json.dump(global_metrics, f, ensure_ascii=False, indent=1)
    print('wrote global-metrics.json', list(global_metrics))
    for pid, m in metrics.items():
        if pid.startswith('_'):
            continue
        if pid not in parties:
            print('metrics for unknown party', pid); continue
        pm = parties[pid].setdefault('metrics', {})
        for k, v in m.items():
            if k not in pm or not pm[k]:
                pm[k] = v
            elif isinstance(v, list) and isinstance(pm[k], list):
                # merge series by year/government key without duplicating
                keys = {json.dumps({kk: vv for kk, vv in x.items() if kk in ('year', 'government')}, sort_keys=True) for x in pm[k] if isinstance(x, dict)}
                for x in v:
                    if isinstance(x, dict) and json.dumps({kk: vv for kk, vv in x.items() if kk in ('year', 'government')}, sort_keys=True) not in keys:
                        pm[k].append(x)
    elections = load(os.path.join(RAW, 'elections.json'), [])
    events = load(os.path.join(RAW, 'events.json'), [])
    govs = load(os.path.join(RAW, 'governments.json'), [])

    # unknown ids report
    labels = load(os.path.join(DATA, 'labels.json'), {})
    known = set(parties) | set(labels) | {'other', 'independents', 'none', 'technocrat', 'sans-appartenance'}
    unknown = {}
    for e in elections:
        for r in e.get('results', []):
            if r.get('party_id') not in known:
                unknown.setdefault(r['party_id'], set()).add(e['id'])
    for ev in events:
        for pos in ev.get('positions', []):
            if pos.get('party_id') not in known:
                unknown.setdefault(pos['party_id'], set()).add(ev['id'])
    for g in govs:
        for c in [g.get('pm_party')] + g.get('coalition', []):
            if c not in known:
                unknown.setdefault(c, set()).add(g['id'])
    for k, v in sorted(unknown.items()):
        print('UNKNOWN party id', k, '->', ', '.join(sorted(v))[:120])

    order = ['rni', 'pam', 'istiqlal', 'usfp', 'mp', 'pps', 'uc', 'pjd', 'mds', 'fgd', 'psu']
    plist = sorted(parties.values(), key=lambda p: (order.index(p['id']) if p['id'] in order else 99, p['names']['fr']))
    dump('parties.json', plist)
    dump('elections.json', sorted(elections, key=lambda e: e['date']))
    dump('events.json', sorted(events, key=lambda e: e['date']))
    dump('governments.json', sorted(govs, key=lambda g: g['from']))


if __name__ == '__main__':
    main()
