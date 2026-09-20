#!/usr/bin/env python3
"""Export data/*.json into a normalized, queryable site/data.sqlite.

Run after scripts/build.py has validated the data (this script does not
re-validate referential integrity itself -- it trusts build.py's checks).
Writes to a temp file and only replaces the final database once SQLite's
own foreign-key and integrity checks pass, so a failed export never leaves
a corrupt/partial file behind.

Usage: python3 scripts/export_sqlite.py
"""
import json
import os
import sqlite3

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DATA = os.path.join(ROOT, 'data')
OUT = os.path.join(ROOT, 'site', 'data.sqlite')
TMP = OUT + '.tmp'


def load(name, default):
    path = os.path.join(DATA, name)
    if not os.path.exists(path):
        return default
    with open(path, encoding='utf-8') as f:
        return json.load(f)


SCHEMA = """
CREATE TABLE metadata (key TEXT PRIMARY KEY, value TEXT NOT NULL);

CREATE TABLE sources (
    id TEXT PRIMARY KEY, title TEXT, url TEXT, type TEXT,
    origin TEXT, note TEXT, published TEXT, accessed TEXT
);

CREATE TABLE parties (
    id TEXT PRIMARY KEY, abbr TEXT, name_en TEXT, name_fr TEXT, name_ar TEXT,
    status TEXT, family TEXT, position TEXT, founded TEXT, record_json TEXT NOT NULL
);

CREATE TABLE elections (
    id TEXT PRIMARY KEY, date TEXT, type TEXT, chamber TEXT,
    seats_total INTEGER, turnout_pct REAL, record_json TEXT NOT NULL
);
CREATE TABLE election_results (
    id INTEGER PRIMARY KEY, election_id TEXT REFERENCES elections(id),
    party_id TEXT REFERENCES parties(id), votes INTEGER, pct REAL, seats INTEGER, confidence TEXT
);

CREATE TABLE events (
    id TEXT PRIMARY KEY, date TEXT, title TEXT, category TEXT, record_json TEXT NOT NULL
);
CREATE TABLE event_positions (
    id INTEGER PRIMARY KEY, event_id TEXT REFERENCES events(id),
    party_id TEXT REFERENCES parties(id), stance TEXT, confidence TEXT
);

CREATE TABLE governments (
    id TEXT PRIMARY KEY, name TEXT, pm TEXT, pm_party TEXT REFERENCES parties(id),
    from_date TEXT, to_date TEXT, record_json TEXT NOT NULL
);
CREATE TABLE government_coalition (
    government_id TEXT REFERENCES governments(id), party_id TEXT REFERENCES parties(id),
    PRIMARY KEY (government_id, party_id)
);

CREATE TABLE policy_dimensions (id TEXT PRIMARY KEY, label TEXT, record_json TEXT NOT NULL);
CREATE TABLE policy_positions (
    party_id TEXT REFERENCES parties(id), dimension_id TEXT REFERENCES policy_dimensions(id),
    score INTEGER CHECK (score BETWEEN -2 AND 2), date TEXT, record_json TEXT NOT NULL,
    PRIMARY KEY (party_id, dimension_id)
);
CREATE TABLE policy_position_sources (
    party_id TEXT, dimension_id TEXT, source_id TEXT REFERENCES sources(id),
    PRIMARY KEY (party_id, dimension_id, source_id),
    FOREIGN KEY (party_id, dimension_id) REFERENCES policy_positions(party_id, dimension_id)
);

CREATE TABLE programme_documents (party_id TEXT REFERENCES parties(id), year INTEGER, record_json TEXT NOT NULL, PRIMARY KEY (party_id, year));
CREATE TABLE programme_claims (id TEXT PRIMARY KEY, party_id TEXT REFERENCES parties(id), year INTEGER, record_json TEXT NOT NULL);
CREATE TABLE programme_claim_sources (claim_id TEXT REFERENCES programme_claims(id), source_id TEXT REFERENCES sources(id), PRIMARY KEY (claim_id, source_id));
CREATE TABLE legislation (id TEXT PRIMARY KEY, date TEXT, title TEXT, record_json TEXT NOT NULL);
CREATE TABLE legislation_parties (legislation_id TEXT REFERENCES legislation(id), party_id TEXT REFERENCES parties(id), PRIMARY KEY (legislation_id, party_id));
CREATE TABLE legislation_sources (legislation_id TEXT REFERENCES legislation(id), source_id TEXT REFERENCES sources(id), PRIMARY KEY (legislation_id, source_id));
CREATE TABLE employment_outcomes (id TEXT PRIMARY KEY, year INTEGER, value INTEGER, record_json TEXT NOT NULL);

CREATE TABLE media (
    id TEXT PRIMARY KEY, party_id TEXT REFERENCES parties(id), kind TEXT,
    path TEXT NOT NULL, license TEXT, record_json TEXT NOT NULL
);

CREATE INDEX idx_election_results_party ON election_results(party_id);
CREATE INDEX idx_event_positions_party ON event_positions(party_id);
"""


def main():
    parties = load('parties.json', [])
    elections = load('elections.json', [])
    events = load('events.json', [])
    govs = load('governments.json', [])
    sources = load('sources.json', {})
    policy = load('policy-positions.json', {'dimensions': [], 'positions': []})
    programmes = load('programmes.json', {'documents': [], 'claims': [], 'legislation': [], 'employment_outcomes': []})
    media = load('media.json', [])

    if os.path.exists(TMP):
        os.remove(TMP)
    conn = sqlite3.connect(TMP)
    conn.execute('PRAGMA foreign_keys = ON')
    conn.executescript(SCHEMA)

    conn.execute('INSERT INTO metadata VALUES (?, ?)', ('generated_at', __import__('datetime').date.today().isoformat()))
    conn.execute('INSERT INTO metadata VALUES (?, ?)', ('counts', json.dumps({
        'parties': len(parties), 'elections': len(elections), 'events': len(events), 'governments': len(govs),
        'policy_positions': len(policy.get('positions', [])), 'programme_claims': len(programmes.get('claims', [])),
        'media': len(media),
    })))

    for sid, s in sources.items():
        conn.execute('INSERT INTO sources VALUES (?,?,?,?,?,?,?,?)', (
            sid, s.get('title'), s.get('url'), s.get('type'), s.get('origin'),
            s.get('note'), s.get('published'), s.get('accessed'),
        ))

    for p in parties:
        names = p.get('names') or {}
        conn.execute('INSERT INTO parties VALUES (?,?,?,?,?,?,?,?,?,?)', (
            p['id'], p.get('abbr'), names.get('en'), names.get('fr'), names.get('ar'),
            p.get('status'), p.get('family'), p.get('position'), str(p.get('founded')),
            json.dumps(p, ensure_ascii=False),
        ))

    # elections/events/governments can also reference non-party labels (independents,
    # technocrats, unions...) per data/labels.json and build.py's `known` set -- insert
    # them as minimal rows (status='label') so party_id foreign keys hold for those too.
    labels = load('labels.json', {})
    for lid, label_name in labels.items():
        conn.execute('INSERT INTO parties VALUES (?,?,?,?,?,?,?,?,?,?)', (
            lid, None, label_name, None, None, 'label', None, None, None, json.dumps({'id': lid, 'label': label_name}),
        ))
    for lid in ('other', 'independents', 'none', 'technocrat', 'sans-appartenance'):
        if not conn.execute('SELECT 1 FROM parties WHERE id = ?', (lid,)).fetchone():
            conn.execute('INSERT INTO parties VALUES (?,?,?,?,?,?,?,?,?,?)', (
                lid, None, lid, None, None, 'label', None, None, None, json.dumps({'id': lid}),
            ))

    for e in elections:
        conn.execute('INSERT INTO elections VALUES (?,?,?,?,?,?,?)', (
            e['id'], e.get('date'), e.get('type'), e.get('chamber'),
            e.get('seats_total'), e.get('turnout_pct'), json.dumps(e, ensure_ascii=False),
        ))
        for r in e.get('results', []):
            conn.execute('INSERT INTO election_results (election_id, party_id, votes, pct, seats, confidence) VALUES (?,?,?,?,?,?)', (
                e['id'], r.get('party_id'), r.get('votes'), r.get('pct'), r.get('seats'), r.get('confidence'),
            ))

    for ev in events:
        conn.execute('INSERT INTO events VALUES (?,?,?,?,?)', (
            ev['id'], ev.get('date'), ev.get('title'), ev.get('category'), json.dumps(ev, ensure_ascii=False),
        ))
        for pos in ev.get('positions', []):
            conn.execute('INSERT INTO event_positions (event_id, party_id, stance, confidence) VALUES (?,?,?,?)', (
                ev['id'], pos.get('party_id'), pos.get('stance'), pos.get('confidence'),
            ))

    for g in govs:
        conn.execute('INSERT INTO governments VALUES (?,?,?,?,?,?,?)', (
            g['id'], g.get('name'), g.get('pm'), g.get('pm_party'),
            g.get('from'), g.get('to'), json.dumps(g, ensure_ascii=False),
        ))
        for pid in g.get('coalition', []):
            conn.execute('INSERT OR IGNORE INTO government_coalition VALUES (?,?)', (g['id'], pid))

    for d in policy.get('dimensions', []):
        conn.execute('INSERT INTO policy_dimensions VALUES (?,?,?)', (d['id'], d.get('label'), json.dumps(d, ensure_ascii=False)))
    for pos in policy.get('positions', []):
        conn.execute('INSERT INTO policy_positions (party_id, dimension_id, score, date, record_json) VALUES (?,?,?,?,?)', (
            pos.get('party_id'), pos.get('dimension_id'), pos.get('score'), pos.get('date'), json.dumps(pos, ensure_ascii=False),
        ))
        for s in pos.get('sources', []):
            conn.execute('INSERT OR IGNORE INTO policy_position_sources VALUES (?,?,?)', (pos.get('party_id'), pos.get('dimension_id'), s))

    for d in programmes.get('documents', []):
        conn.execute('INSERT INTO programme_documents VALUES (?,?,?)', (d.get('party_id'), d.get('year'), json.dumps(d, ensure_ascii=False)))
    for c in programmes.get('claims', []):
        conn.execute('INSERT INTO programme_claims VALUES (?,?,?,?)', (c['id'], c.get('party_id'), c.get('year'), json.dumps(c, ensure_ascii=False)))
        for s in c.get('sources', []):
            conn.execute('INSERT OR IGNORE INTO programme_claim_sources VALUES (?,?)', (c['id'], s))
    for l in programmes.get('legislation', []):
        conn.execute('INSERT INTO legislation VALUES (?,?,?,?)', (l['id'], l.get('date'), l.get('title'), json.dumps(l, ensure_ascii=False)))
        for pid in l.get('party_ids', []):
            conn.execute('INSERT OR IGNORE INTO legislation_parties VALUES (?,?)', (l['id'], pid))
        for s in l.get('sources', []):
            conn.execute('INSERT OR IGNORE INTO legislation_sources VALUES (?,?)', (l['id'], s))
    for e in programmes.get('employment_outcomes', []):
        conn.execute('INSERT INTO employment_outcomes VALUES (?,?,?,?)', (e['id'], e.get('year'), e.get('value'), json.dumps(e, ensure_ascii=False)))

    for m in media:
        conn.execute('INSERT INTO media VALUES (?,?,?,?,?,?)', (
            m['id'], m.get('party_id'), m.get('kind'), m.get('path'), m.get('license'), json.dumps(m, ensure_ascii=False),
        ))

    fk_violations = conn.execute('PRAGMA foreign_key_check').fetchall()
    assert not fk_violations, f'foreign key violations: {fk_violations}'
    integrity = conn.execute('PRAGMA integrity_check').fetchone()[0]
    assert integrity == 'ok', f'integrity check failed: {integrity}'
    conn.execute('PRAGMA optimize')
    conn.commit()
    conn.close()
    os.replace(TMP, OUT)
    print(f'wrote {OUT}: {len(parties)} parties, {len(elections)} elections, {len(events)} events, '
          f'{len(govs)} governments, {len(policy.get("positions", []))} policy positions, '
          f'{len(programmes.get("claims", []))} programme claims, {len(media)} media entries. '
          f'Foreign keys and integrity check passed.')


if __name__ == '__main__':
    main()
