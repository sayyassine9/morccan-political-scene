#!/usr/bin/env python3
"""One-off tool to port data from the Majlis (morocco-politics) research bank into this
repo's canonical data/*.json files, per data/raw/crosswalk.json.

Phase 0 usage (build/refresh the crosswalk only):
    python3 scripts/migrate_majlis.py --crosswalk --majlis-path ../morocco-politics/dist/data/bank.json

Later phases (Phase 2) will add --migrate to actually emit data/policy-positions.json,
data/programmes.json, data/sources.json, data/media.json. Not implemented yet.
"""
import json
import os
import re
import sys
import unicodedata
import argparse

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DATA = os.path.join(ROOT, 'data')


def norm(s):
    if not s:
        return ''
    s = unicodedata.normalize('NFKD', s)
    s = ''.join(c for c in s if not unicodedata.combining(c))
    s = s.lower()
    s = re.sub(r'[^a-z0-9]+', ' ', s)
    return s.strip()


def load(path):
    with open(path, encoding='utf-8') as f:
        return json.load(f)


STOPWORDS = {'parti', 'party', 'du', 'de', 'la', 'le', 'des', 'et', 'the', 'of', 'and', 'l'}


def tokens(s):
    return {t for t in norm(s).split() if t and t not in STOPWORDS}


def token_score(a, b):
    # require at least 2 discriminating tokens on the smaller side so a single
    # shared word (e.g. "constitutionnel") can't count as a full match
    if len(a) < 2 or len(b) < 2:
        return 0.0
    inter = len(a & b)
    if not inter:
        return 0.0
    return inter / min(len(a), len(b))


def build_crosswalk(majlis_path):
    target = load(os.path.join(DATA, 'parties.json'))
    majlis = load(majlis_path)['parties']

    t_strings = []  # (party_id, normalized full-name string)
    t_names = []    # (party_id, token_set) for every fr/ar/en/abbr name variant
    for p in target:
        names = p.get('names') or {}
        for k in ('fr', 'ar', 'en'):
            v = names.get(k)
            n = norm(v)
            if n:
                t_strings.append((p['id'], n))
            tk = tokens(v)
            if tk:
                t_names.append((p['id'], tk))
        ab = tokens(p.get('abbr'))
        if ab:
            t_names.append((p['id'], ab))
    t_by_id = {p['id']: p for p in target}

    rows = []
    for m in majlis:
        mid = m['id']
        m_strings = [norm(m.get(k)) for k in ('name', 'name_fr', 'name_ar')]
        m_strings = [s for s in m_strings if s]
        m_variants = [tokens(m.get(k)) for k in ('name', 'name_fr', 'name_ar', 'acronym')]
        m_variants = [t for t in m_variants if t]

        # Tier 1: exact normalized full-string equality (most reliable signal)
        exact = sorted({tid for tid, tn in t_strings if tn in m_strings})

        note = ''
        if len(exact) == 1:
            target_id, confidence = exact[0], 'exact'
            rows.append({'majlis_id': mid, 'majlis_name': m.get('name'), 'majlis_name_fr': m.get('name_fr'),
                         'target_id': target_id, 'confidence': confidence, 'note': note})
            continue
        if len(exact) > 1:
            rows.append({'majlis_id': mid, 'majlis_name': m.get('name'), 'majlis_name_fr': m.get('name_fr'),
                         'target_id': None, 'confidence': 'uncertain',
                         'note': f'multiple exact full-string matches: {exact}'})
            continue

        # Tier 2: token-containment scoring
        scores = {}
        for mv in m_variants:
            for tid, tv in t_names:
                s = token_score(mv, tv)
                if s > scores.get(tid, 0):
                    scores[tid] = s
        full = sorted([tid for tid, s in scores.items() if s == 1.0])
        strong = sorted([tid for tid, s in scores.items() if 0.6 <= s < 1.0])

        if len(full) == 1:
            target_id, confidence = full[0], 'likely'
            note = f'full token containment with {full[0]} -- verify manually'
        elif len(full) > 1:
            target_id, confidence = None, 'uncertain'
            note = f'multiple full-token matches: {full}'
        elif len(strong) == 1:
            target_id, confidence = strong[0], 'likely'
            note = f'partial token overlap (score>=0.6) with {strong[0]} -- verify manually'
        elif len(strong) > 1:
            target_id, confidence = None, 'uncertain'
            note = f'multiple partial matches: {strong}'
        elif mid in t_by_id:
            target_id, confidence = mid, 'uncertain'
            note = 'id string matches target but no name match confirmed it -- verify manually (acronym collisions are known, e.g. psd)'
        else:
            target_id, confidence = None, 'new'
            note = 'no target match found'

        rows.append({
            'majlis_id': mid,
            'majlis_name': m.get('name'),
            'majlis_name_fr': m.get('name_fr'),
            'target_id': target_id,
            'confidence': confidence,
            'note': note,
        })
    return rows


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('--crosswalk', action='store_true')
    ap.add_argument('--majlis-path', default=os.path.join(ROOT, '..', 'morocco-politics', 'dist', 'data', 'bank.json'))
    args = ap.parse_args()

    if args.crosswalk:
        rows = build_crosswalk(args.majlis_path)
        out = os.path.join(DATA, 'raw', 'crosswalk.json')
        with open(out, 'w', encoding='utf-8') as f:
            json.dump(rows, f, ensure_ascii=False, indent=2)
            f.write('\n')
        exact = sum(1 for r in rows if r['confidence'] == 'exact')
        uncertain = sum(1 for r in rows if r['confidence'] == 'uncertain')
        new = sum(1 for r in rows if r['confidence'] == 'new')
        print(f'{len(rows)} majlis parties: {exact} exact, {uncertain} uncertain, {new} new')
        print(f'wrote {out}')
        return

    print('nothing to do -- pass --crosswalk (Phase 2 migration not implemented yet)', file=sys.stderr)
    sys.exit(1)


if __name__ == '__main__':
    main()
