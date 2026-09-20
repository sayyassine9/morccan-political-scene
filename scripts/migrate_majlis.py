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


# --- Phase 2: migration -----------------------------------------------------

# New parties not present in the target -- id here is the *target-style* slug
# to mint, following the target's existing "al-ahd"/"al-amal" naming pattern
# rather than importing Majlis's raw slug verbatim.
NEW_PARTY_IDS = {'umd': 'umd', 'equity': 'al-insaf'}

STATUS_MAP = {
    'cross-checked': 'cross-checked', 'reported': 'reported', 'disputed': 'disputed',
    'official provisional': 'official-provisional', 'official-provisional': 'official-provisional',
    'historical classification': 'historical-classification', 'historical-classification': 'historical-classification',
    'unknown': 'unknown',
}


def norm_status(s):
    if not s:
        return 'unknown'
    return STATUS_MAP.get(s.strip().lower(), 'reported')


def provenance(field):
    """Majlis {value, sources, status, note} -> (value, provenance-dict-or-None)."""
    if not isinstance(field, dict) or 'value' not in field:
        return field, None
    value = field.get('value')
    prov = {'status': norm_status(field.get('status')), 'sources': field.get('sources') or []}
    if field.get('note'):
        prov['note'] = field['note']
    return value, prov


def load_crosswalk():
    rows = load(os.path.join(DATA, 'raw', 'crosswalk.json'))
    m = {}
    for r in rows:
        if r['target_id']:
            m[r['majlis_id']] = r['target_id']
        elif r['confidence'] == 'new':
            m[r['majlis_id']] = NEW_PARTY_IDS[r['majlis_id']]
    return m


def remap(pid, xwalk, ctx):
    if pid is None:
        return None
    if pid not in xwalk:
        print(f'WARN {ctx}: unmapped majlis party id {pid!r}, dropping reference', file=sys.stderr)
        return None
    return xwalk[pid]


def build_sources(majlis):
    out = {}
    for sid, s in majlis['sources'].items():
        out[sid] = {
            'title': s.get('title'), 'url': s.get('url'), 'type': s.get('type'),
            'origin': s.get('origin'), 'note': s.get('note') or '',
            'published': s.get('published'), 'accessed': s.get('accessed'),
        }
    return out


def build_policy_positions(majlis, xwalk):
    dims = [{k: d[k] for k in ('id', 'label', 'low', 'high', 'description', 'rubric') if k in d}
            for d in majlis['positioning']['dimensions']]
    positions = []
    for p in majlis['positioning']['positions']:
        pid = remap(p.get('party'), xwalk, f"policy position {p.get('party')}/{p.get('dimension')}")
        if not pid:
            continue
        positions.append({
            'party_id': pid, 'dimension_id': p.get('dimension'), 'score': p.get('value'),
            'note': p.get('reason') or '', 'date': p.get('date'), 'scope': p.get('scope'),
            'sources': p.get('sources') or [],
        })

    # Collapsing majlis's per-cycle alliance ids (fgd2016/afg2021/fgd2022/ag2026) into
    # one 'fgd' can produce >1 position for the same (party_id, dimension_id) -- e.g. two
    # dated proposals on the same policy axis from different election cycles. Keep the
    # most recent as the current position, and preserve the rest as dated history on it
    # rather than silently dropping or colliding on a (party_id, dimension_id) key.
    grouped = {}
    for pos in positions:
        grouped.setdefault((pos['party_id'], pos['dimension_id']), []).append(pos)
    deduped = []
    for (pid, did), group in grouped.items():
        if len(group) == 1:
            deduped.append(group[0])
            continue
        group.sort(key=lambda p: str(p['date']))
        current = dict(group[-1])
        current['history'] = [{'date': g['date'], 'score': g['score'], 'note': g['note'], 'sources': g['sources']}
                               for g in group[:-1]]
        deduped.append(current)
    return {'dimensions': dims, 'positions': deduped}


def build_programmes(majlis, xwalk):
    pr = majlis['programmes']
    documents = []
    for d in pr.get('documents', []):
        pid = remap(d.get('party'), xwalk, f"programme document {d.get('party')}/{d.get('year')}")
        if not pid:
            continue
        documents.append({'party_id': pid, 'year': d.get('year'), 'sources': d.get('sources') or [],
                           'coverage': d.get('coverage') or ''})

    claims = []
    for c in pr.get('claims', []):
        pid = remap(c.get('party'), xwalk, f"programme claim {c.get('id')}")
        if not pid:
            continue
        row = dict(c)
        row['party_id'] = pid
        del row['party']
        claims.append(row)

    legislation = []
    for l in pr.get('legislation', []):
        party_ids = [remap(p, xwalk, f"legislation {l.get('id')}") for p in l.get('parties') or []]
        row = dict(l)
        row['party_ids'] = [p for p in party_ids if p]
        row.pop('parties', None)
        legislation.append(row)

    employment_outcomes = []
    for e in pr.get('employment', []):
        employment_outcomes.append({
            'id': f"hcp-employment-{e.get('year')}", 'label': 'HCP national net employment change',
            'year': e.get('year'), 'value': e.get('value'), 'unit': 'jobs',
            'note': 'National net change, not attributable to one party or measure.',
            'sources': e.get('sources') or [],
        })

    return {'documents': documents, 'claims': claims, 'legislation': legislation,
            'employment_outcomes': employment_outcomes}


def build_media(majlis, xwalk, majlis_dist_dir, media_out_dir):
    import shutil
    out = []
    os.makedirs(media_out_dir, exist_ok=True)
    for m in majlis['media']:
        pid = remap(m.get('party_id'), xwalk, f"media {m.get('id')}") if m.get('party_id') else None
        src_rel = (m.get('path') or '').lstrip('/')  # e.g. "assets/logo-afg2021.jpg"
        src = os.path.join(majlis_dist_dir, src_rel)
        fname = os.path.basename(src_rel)
        if os.path.exists(src):
            shutil.copyfile(src, os.path.join(media_out_dir, fname))
        else:
            print(f'WARN media {m.get("id")}: source file missing at {src}', file=sys.stderr)
        out.append({
            'id': m.get('id'), 'party_id': pid, 'kind': m.get('kind'),
            'path': f'assets/media/{fname}', 'person_name': m.get('person_name'),
            'title': m.get('title'), 'source_page': m.get('sourcePage'), 'license': m.get('license'),
            'license_url': m.get('licenseUrl') or '', 'credit': m.get('credit') or '',
            'restrictions': m.get('restrictions') or '', 'sha256': m.get('sha256'),
            'reviewed_at': m.get('reviewed_at'), 'alt': m.get('alt') or '', 'caption': m.get('caption') or '',
        })
    return out


def build_new_parties(majlis, xwalk):
    STATUS = 'extra-parliamentary'
    new_ids = set(NEW_PARTY_IDS)
    out = []
    for p in majlis['parties']:
        if p['id'] not in new_ids:
            continue
        target_id = xwalk[p['id']]
        founded, founded_prov = provenance(p.get('founding'))
        founders_val, founders_prov = provenance(p.get('founders'))
        ideology_val, ideology_prov = provenance(p.get('ideology'))
        summary_val, summary_prov = provenance(p.get('summary'))

        timeline = []
        for t in p.get('timeline', []):
            timeline.append({
                'date': t.get('date'), 'title': t.get('title'), 'description': t.get('detail') or '',
                'type': 'other', 'sources': t.get('sources') or [],
                'title_provenance': {'status': norm_status(t.get('status')), 'sources': t.get('sources') or []},
            })

        record = {
            'id': target_id,
            'names': {'fr': p.get('name_fr') or '', 'ar': p.get('name_ar') or '', 'en': p.get('name') or ''},
            'abbr': p.get('acronym') or '',
            'founded': founded,
            'founders': [founders_val] if isinstance(founders_val, str) and founders_val else (founders_val or []),
            'ideology': [s.strip() for s in ideology_val.split(',')] if isinstance(ideology_val, str) else [],
            'position': None,
            'family': None,
            'headquarters': None,
            'colour': p.get('color'),
            'website': None,
            'international_affiliation': [],
            'status': STATUS,
            'current_leader': None,
            'leaders': [],
            'notable_members': [],
            'timeline': timeline,
            'achievements': [],
            'metrics': {'custom': []},
            'sources': sorted({s for f in (p.get('founding'), p.get('founders'), p.get('summary'))
                                if isinstance(f, dict) for s in f.get('sources', [])}),
            'data_quality': {'confidence': 'low',
                              'notes': f"Imported from Majlis (morocco-politics) research bank on 2026-09-19, "
                                       f"majlis id '{p['id']}'. {p.get('coverage') or ''} "
                                       f"Summary: {summary_val or ''}"},
        }
        if founded_prov:
            record['founded_provenance'] = founded_prov
        if founders_prov:
            record['founders_provenance'] = founders_prov
        if ideology_prov:
            record['ideology_provenance'] = ideology_prov
        out.append(record)
    return out


def fold_fgd_family(majlis, xwalk):
    """Return extra timeline entries for the unified 'fgd' record, one per per-cycle
    Majlis record (fgd2016/afg2021/fgd2022/ag2026), per the Phase 0 collapse decision."""
    cycle_ids = {'fgd2016', 'afg2021', 'fgd2022', 'ag2026'}
    entries = []
    by_id = {p['id']: p for p in majlis['parties']}
    for cid in sorted(cycle_ids):
        p = by_id.get(cid)
        if not p:
            continue
        for t in p.get('timeline', []):
            entries.append({
                'date': t.get('date'),
                'title': f"[{p.get('name')}] {t.get('title')}",
                'description': t.get('detail') or '',
                'type': 'electoral',
                'sources': t.get('sources') or [],
            })
    entries.sort(key=lambda e: str(e['date']))
    return entries


def migrate(majlis_path):
    majlis = load(majlis_path)
    majlis_dist_dir = os.path.dirname(os.path.dirname(majlis_path))
    xwalk = load_crosswalk()

    sources = build_sources(majlis)
    policy = build_policy_positions(majlis, xwalk)
    programmes = build_programmes(majlis, xwalk)
    media = build_media(majlis, xwalk, majlis_dist_dir, os.path.join(ROOT, 'site', 'assets', 'media'))
    new_parties = build_new_parties(majlis, xwalk)
    fgd_extra_timeline = fold_fgd_family(majlis, xwalk)

    def write(name, obj):
        path = os.path.join(DATA, name)
        with open(path, 'w', encoding='utf-8') as f:
            json.dump(obj, f, ensure_ascii=False, indent=2)
            f.write('\n')
        print(f'wrote {path}')

    write('sources.json', sources)
    write('policy-positions.json', policy)
    write('programmes.json', programmes)
    write('media.json', media)

    # append new parties + fold fgd timeline into the existing parties.json
    parties = load(os.path.join(DATA, 'parties.json'))
    parties_by_id = {p['id']: p for p in parties}
    for rec in new_parties:
        if rec['id'] in parties_by_id:
            print(f"WARN: new party id {rec['id']} already exists in parties.json, skipping insert", file=sys.stderr)
            continue
        parties.append(rec)
    fgd = parties_by_id.get('fgd')
    if fgd is not None:
        fgd.setdefault('timeline', [])
        fgd['timeline'].extend(fgd_extra_timeline)
        fgd['timeline'].sort(key=lambda e: str(e.get('date')))
    else:
        print('WARN: fgd party not found in parties.json, could not fold alliance-cycle timeline', file=sys.stderr)
    write('parties.json', parties)

    print(f"{len(sources)} sources, {len(policy['positions'])} policy positions "
          f"({len(policy['dimensions'])} dimensions), {len(programmes['claims'])} programme claims, "
          f"{len(programmes['legislation'])} legislation records, "
          f"{len(programmes['employment_outcomes'])} employment outcomes, {len(media)} media entries, "
          f"{len(new_parties)} new parties, {len(fgd_extra_timeline)} fgd timeline entries folded in")


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('--crosswalk', action='store_true')
    ap.add_argument('--migrate', action='store_true')
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

    if args.migrate:
        migrate(args.majlis_path)
        return

    print('nothing to do -- pass --crosswalk or --migrate', file=sys.stderr)
    sys.exit(1)


if __name__ == '__main__':
    main()
